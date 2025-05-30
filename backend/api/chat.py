from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import requests
from tools.websearch import perform_web_search
from tools.chartgen import auto_generate_chart , draw_chart_from_data
from tools.extract_chart_data import extract_visual_data_from_text




# Load environment variables
load_dotenv()

# Import uploaded document contents
from api.upload import session_documents

router = APIRouter()

# In-memory chat history per session
conversation_histories = {}

class ChatRequest(BaseModel):
    message: str
    session_id: str
    format: str = None  # Optional: 'bullet' or 'paragraph'

@router.post("/chat")
def chat(request: ChatRequest):
    try:
        session_id = request.session_id
        message = request.message
        response_format = request.format

        # Handle chart formats directly
        if response_format and response_format.lower() in ["bar", "line", "hist", "scatter"]:
            try:
                image_data_url = auto_generate_chart(response_format.lower())
                return {"chart": image_data_url}
            except Exception as e:
                return {"error": f"Failed to generate chart: {str(e)}"}


        # Initialize session if needed
        if session_id not in conversation_histories:
            conversation_histories[session_id] = []
            conversation_histories[session_id].append({
                "role": "system",
                "content": "You are a helpful research assistant."
            })

        # Chain of Thought trigger
        cot_triggers = ["step by step", "think step by step", "explain step by step", "reason through"]
        if any(trigger in message.lower() for trigger in cot_triggers):
            conversation_histories[session_id].insert(1, {
                "role": "system",
                "content": "Use Chain of Thought reasoning. Think step by step before answering. Explain each step of your reasoning clearly."
            })

        # Formatting instructions
        if response_format:
            if response_format.lower() == "bullet":
                conversation_histories[session_id].insert(1, {
                    "role": "system",
                    "content": "Format the answer as a bullet list of key points."
                })
            elif response_format.lower() == "paragraph":
                conversation_histories[session_id].insert(1, {
                    "role": "system",
                    "content": "Format the answer as a single concise paragraph."
                })

        # Include document content
        if session_id in session_documents:
            document_context = session_documents[session_id][:1500]
            conversation_histories[session_id].append({
                "role": "system",
                "content": f"The user uploaded the following document:\n{document_context}"
            })
            del session_documents[session_id]

        # Web search
        web_results = perform_web_search(message)
        if web_results:
            conversation_histories[session_id].append({
                "role": "system",
                "content": f"Relevant web search results:\n{web_results}"
            })

        # Add user message
        conversation_histories[session_id].append({
            "role": "user",
            "content": message
        })

        # Send to Groq
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "llama3-70b-8192",
            "messages": conversation_histories[session_id]
        }

        response = requests.post(url, headers=headers, json=data)
        result = response.json()
        reply = result["choices"][0]["message"]["content"]

        # Save assistant reply
        conversation_histories[session_id].append({
            "role": "assistant",
            "content": reply
        })

        return {"reply": reply}

    except Exception as e:
        return {"error": str(e)}

from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import requests
from tools.websearch import perform_web_search
from tools.chartgen import auto_generate_chart, draw_chart_from_data
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
    format: str = None  # Optional: 'bullet', 'paragraph', or visualization type

@router.post("/chat")
def chat(request: ChatRequest):
    try:
        session_id = request.session_id
        message = request.message
        response_format = request.format

        # 🔍 Chart generation logic (data-aware visualization)
        visual_keywords = ["visualize", "chart", "graph", "plot", "compare", "show as", "bar chart", "line chart", "pie chart"]
        if response_format and response_format.lower() in ["bar", "line", "pie", "hist", "histogram"]:
            text_sources = []

            if session_id in session_documents:
                text_sources.append(session_documents[session_id])

            if session_id in conversation_histories:
                text_sources.append(" ".join(
                    msg["content"] for msg in conversation_histories[session_id] if msg["role"] == "user"
                ))

            # Add web search context
            web_results = perform_web_search(message)
            if web_results:
                text_sources.append(web_results)

            text_sources.append(message)
            combined_text = "\n".join(text_sources)

            # Ask the LLM to extract chart-worthy data
            extracted = extract_visual_data_from_text(combined_text)
            if extracted:
                chart_type = extracted["type"]
                labels = extracted["labels"]
                values = extracted["values"]
                chart_url = draw_chart_from_data(chart_type, labels, values)
                return {"chart": chart_url}
            else:
                return {"error": "Could not extract meaningful chart data from your request."}

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

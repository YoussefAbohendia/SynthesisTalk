from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import requests
from tools.websearch import perform_web_search
from tools.chartgen import auto_generate_chart, draw_chart_from_data
from tools.extract_chart_data import extract_visual_data_from_text
from tools.memory import add_note, view_notes, clear_notes, add_citation, view_citations, clear_citations

# Load environment variables
load_dotenv()

from api.upload import session_documents

router = APIRouter()
conversation_histories = {}

class ChatRequest(BaseModel):
    message: str
    session_id: str
    format: str = None

@router.post("/chat")
def chat(request: ChatRequest):
    print(request)
    try:
        session_id = request.session_id
        message = request.message
        response_format = request.format
        lowered = message.lower()

        # 📝 Handle note-taking commands
        if "take note" in lowered or "remember this" in lowered:
            note_text = message.split("note", 1)[-1].strip()
            add_note(session_id, note_text)
            return {"response": "✅ Noted."}

        if "show notes" in lowered or "my notes" in lowered:
            notes = view_notes(session_id)
            return {"response": notes if notes else "You have no saved notes."}
        if "delete notes" in lowered or "clear notes" in lowered:
            clear_notes(session_id)
            return {"response": "🗑️ All notes deleted."}

        # 📚 Handle citation commands
        if "cite this" in lowered or "add citation" in lowered:
            if session_id in conversation_histories:
                last_reply = next((m["content"] for m in reversed(conversation_histories[session_id]) if m["role"] == "assistant"), None)
                if last_reply:
                    add_citation(session_id, last_reply)
                    return {"response": "✅ Citation added from the last assistant reply."}
            return {"response": "⚠️ No recent assistant reply to cite."}
        if "show citations" in lowered or "view citations" in lowered:
            citations = view_citations(session_id)
            return {"response": citations if citations else "You have no saved citations."}
        if "delete citations" in lowered or "clear citations" in lowered:
            clear_citations(session_id)
            return {"response": "🗑️ All citations deleted."}

        # 📊 Chart generation
        if response_format and response_format.lower() in ["bar", "line", "pie", "hist", "histogram"]:
            text_sources = []
            if session_id in session_documents:
                text_sources.append(session_documents[session_id])
            if session_id in conversation_histories:
                text_sources.append(" ".join(
                    msg["content"] for msg in conversation_histories[session_id] if msg["role"] == "user"
                ))
            web_results = perform_web_search(message)
            if web_results:
                text_sources.append(web_results)
            text_sources.append(message)
            combined_text = "\n".join(text_sources)

            extracted = extract_visual_data_from_text(combined_text)
            if extracted:
                chart_type = extracted["type"]
                labels = extracted["labels"]
                values = extracted["values"]
                chart_url = draw_chart_from_data(chart_type, labels, values)
                return {"chart": chart_url}
            else:
                return {"error": "Could not extract meaningful chart data from your request."}

        # 🛠️ Set up session and assistant behavior
        if session_id not in conversation_histories:
            conversation_histories[session_id] = []
            conversation_histories[session_id].append({
                "role": "system",
                "content": "You are a helpful research assistant."
            })

        # 💭 Enable step-by-step reasoning if prompted
        cot_triggers = ["step by step", "think step by step", "explain step by step", "reason through"]
        if any(trigger in lowered for trigger in cot_triggers):
            conversation_histories[session_id].insert(1, {
                "role": "system",
                "content": "Use Chain of Thought reasoning. Think step by step before answering. Explain each step of your reasoning clearly."
            })

        # 🖋️ Format instruction
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

        # 📄 Use uploaded document if available
        if session_id in session_documents:
            document_context = session_documents[session_id][:1500]
            conversation_histories[session_id].append({
                "role": "system",
                "content": f"The user uploaded the following document:\n{document_context}"
            })
            del session_documents[session_id]

        # 🌐 Web search injection
        web_results = perform_web_search(message)
        if web_results:
            conversation_histories[session_id].append({
                "role": "system",
                "content": f"Relevant web search results:\n{web_results}"
            })

        # 🙋 Add user message
        conversation_histories[session_id].append({
            "role": "user",
            "content": message
        })

        # 🤖 Call LLM for initial response
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

        # 🔁 Self-correction step (LLM reflects on its answer)
        reflection_prompt = [
            {"role": "system", "content": "Reflect on the assistant's reply. Check if it's missing information, inaccurate, or unclear. If yes, revise and return a better version. Otherwise, return the same reply."},
            {"role": "user", "content": f"The assistant said:\n\n{reply}"}
        ]
        reflection_data = {
            "model": "llama3-70b-8192",
            "messages": reflection_prompt
        }
        reflection_response = requests.post(url, headers=headers, json=reflection_data)
        reflection_result = reflection_response.json()
        corrected_reply = reflection_result["choices"][0]["message"]["content"]
        final_reply = corrected_reply if corrected_reply.strip() != reply.strip() else reply

        # 💬 Save and return final reply
        conversation_histories[session_id].append({
            "role": "assistant",
            "content": final_reply
        })

        return {"response": final_reply}

    except Exception as e:
        return {"error": str(e)}

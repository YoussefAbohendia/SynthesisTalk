from fastapi import APIRouter
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
from datetime import datetime
from tools.export_pdf import export_to_pdf
from api.chat import conversation_histories

router = APIRouter()

EXPORT_FOLDER = "exports"
os.makedirs(EXPORT_FOLDER, exist_ok=True)

class ExportRequest(BaseModel):
    session_id: str
    format: str = "txt"  # "txt" or "pdf"

@router.post("/export")
def export_conversation(request: ExportRequest):
    session_id = request.session_id
    if session_id not in conversation_histories:
        return {"error": "Session not found."}

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filtered_messages = [
        msg for msg in conversation_histories[session_id]
        if msg["role"] in ["user", "assistant"]
    ]

    if request.format == "pdf":
        filename = f"{session_id}_{timestamp}.pdf"
        file_path = os.path.join(EXPORT_FOLDER, filename)
        export_to_pdf(filtered_messages, file_path)
        return FileResponse(path=file_path, filename=filename, media_type="application/pdf")

    # Default to TXT
    filename = f"{session_id}_{timestamp}.txt"
    file_path = os.path.join(EXPORT_FOLDER, filename)
    with open(file_path, "w", encoding="utf-8") as f:
        for msg in filtered_messages:
            role = msg["role"].capitalize()
            content = msg["content"]
            f.write(f"{role}:\n{content}\n\n")

    return FileResponse(path=file_path, filename=filename, media_type="text/plain")

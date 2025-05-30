from fastapi import APIRouter, UploadFile, File, Form
import os
import fitz  # PyMuPDF


router = APIRouter()

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# In-memory storage for document contents
session_documents = {}

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), session_id: str = Form(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Save uploaded file
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Extract text
    extracted_text = ""
    if file.filename.endswith(".pdf"):
        with fitz.open(file_path) as doc:
            for page in doc:
                extracted_text += page.get_text()
    elif file.filename.endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as f:
            extracted_text = f.read()
    else:
        return {"error": "Unsupported file type"}

    # Save content in session_documents
    session_documents[session_id] = extracted_text

    return {"message": "File uploaded and processed", "session_id": session_id}
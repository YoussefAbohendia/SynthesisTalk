# SynthesisTalk — AI Research Assistant

SynthesisTalk is an AI-powered research assistant that helps you analyze documents, conduct research, and generate insights. The platform consists of a FastAPI backend and a React frontend, with features including file uploads, document summarization, note-taking, and chat-based research assistance.

---

## Features

- Multi-turn chat with contextual memory
- PDF and text file upload and automatic extraction
- Document summarization and research Q&A
- Note and citation management
- Web search (optional, customizable)
- Modern React UI with chat history and quick actions

---

## Requirements

- Python 3.8+
- Node.js 16+ and npm
- (Recommended) [Poetry](https://python-poetry.org/) or `pip` for Python package management

---

## Backend Setup (FastAPI)

1. **Clone the repository**

   ```sh
   git clone https://github.com/YoussefAbohendia/SynthesisTalk.git
   cd <SynthesisTalk>

    Create and activate a virtual environment

python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

cd backend

Install backend dependencies

pip install -r requirements.txt

Set up environment variables

    Create a .env file in the backend directory with your API keys (for LLMs, etc):

    GROQ_API_KEY=your_groq_api_key_here
    SERPAPI_KEY=your_serp_api_key_here

Run the FastAPI server

uvicorn api.main:app --reload

    By default, the API will be served at http://127.0.0.1:8000
    

Frontend Setup (React)

    Navigate to the frontend directory

cd frontend   # or wherever your React app is located

Install frontend dependencies

npm install

npm install -D tailwindcss postcss autoprefixer

npx tailwindcss init -p

Start the React development server

npm run dev


    The app will be available at http://localhost:3000 by default.

API Endpoints
POST /chat

    Handles all chat interactions.

    Expects a JSON body: { "message": "Your question...", "session_id": "unique_session_id" }

    Returns: { "reply": "AI response..." }

POST /upload

    Handles PDF or text file upload and extraction.

    Expects a multipart/form-data body with:

        file: File upload (PDF or .txt)

        session_id: Chat session ID

    Returns: { "message": "File uploaded and processed", "session_id": "..." }

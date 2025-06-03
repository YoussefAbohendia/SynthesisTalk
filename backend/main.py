from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import chat, upload , export 



app = FastAPI()

# Allow frontend to access backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include chat route
app.include_router(chat.router)
app.include_router(upload.router) 
app.include_router(export.router)



@app.get("/")
def home():
    return {"message": "SynthesisTalk backend is running!"}

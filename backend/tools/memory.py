# tools/memory.py

# Store notes per session
session_notes = {}

def add_note(session_id: str, note: str):
    if session_id not in session_notes:
        session_notes[session_id] = []
    session_notes[session_id].append(note)

def view_notes(session_id: str) -> str:
    if session_id not in session_notes or not session_notes[session_id]:
        return ""
    return "\n".join(f"- {note}" for note in session_notes[session_id])

def clear_notes(session_id: str):
    session_notes[session_id] = []
    

# Citation memory per session
session_citations = {}

def add_citation(session_id: str, citation: str):
    if session_id not in session_citations:
        session_citations[session_id] = []
    session_citations[session_id].append(citation)

def view_citations(session_id: str):
    return "\n".join(session_citations.get(session_id, []))

def clear_citations(session_id: str):
    session_citations[session_id] = []


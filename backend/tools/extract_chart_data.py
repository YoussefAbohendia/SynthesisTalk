import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

from typing import Optional

def extract_visual_data_from_text(text: str) -> Optional[dict]:

    """
    Uses LLM to extract chartable data from user message + docs.
    Expected format:
    {
        "type": "bar" | "line" | "pie" | "histogram",
        "labels": [...],
        "values": [...]
    }
    """
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    system_prompt = (
        "You are a data analyst assistant. From the provided text, extract any chart-worthy data.\n"
        "Return it as a JSON object with 'type', 'labels', and 'values'.\n"
        "Example: {\"type\": \"bar\", \"labels\": [\"A\", \"B\"], \"values\": [10, 20]}.\n"
        "Only include numeric data. If nothing useful, return null."
    )

    data = {
        "model": "llama3-70b-8192",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text}
        ]
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=data)
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        if isinstance(parsed, dict) and "labels" in parsed and "values" in parsed:
            return parsed
    except Exception as e:
        print(f"Chart extraction error: {e}")

    return None

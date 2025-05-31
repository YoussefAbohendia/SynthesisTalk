import os
import requests
import json
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

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
        "You are a data analyst. The user wants to create a chart. From the provided text and statistics, "
        "extract the data as a valid JSON object ONLY in this format:\n"
        "{\"type\": \"bar\", \"labels\": [\"A\", \"B\"], \"values\": [10, 20]}.\n"
        "Only include the output JSON. If no useful numeric data is found, reply with null. "
        "Do NOT write explanations or notes."
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

        # ✅ Robust validation:
        if not isinstance(parsed, dict):
            return None
        if parsed.get("type") not in ["bar", "line", "pie", "histogram"]:
            return None
        if not isinstance(parsed.get("labels"), list) or not all(isinstance(x, str) and x.strip() for x in parsed["labels"]):
            return None
        if not isinstance(parsed.get("values"), list) or not all(isinstance(x, (int, float)) for x in parsed["values"]):
            return None
        if len(parsed["labels"]) != len(parsed["values"]):
            return None

        return parsed

    except Exception as e:
        print(f"Chart extraction error: {e}")

    return None

import os
import requests
from dotenv import load_dotenv

load_dotenv()

def perform_web_search(query):
    api_key = os.getenv("SERPAPI_KEY")
    url = "https://serpapi.com/search"
    params = {
        "q": query,
        "api_key": api_key,
        "engine": "google",
        "num": 3  # top 3 results
    }

    response = requests.get(url, params=params)
    data = response.json()

    results = []
    for res in data.get("organic_results", []):
        title = res.get("title", "")
        snippet = res.get("snippet", "")
        link = res.get("link", "")
        results.append(f"{title}:\n{snippet}\n{link}")

    return "\n\n".join(results[:3])


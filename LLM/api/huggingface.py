import requests
from dotenv import load_dotenv
import os
from fastapi import HTTPException

load_dotenv()

HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
CHAT_MODEL_URL = "YOUR_CHAT_MODEL_URL"  # Replace with your desired model
ANALYSIS_MODEL_URL = "YOUR_ANALYSIS_MODEL_URL"  # Replace with your desired model

def query_hf_model(model_url: str, payload: dict) -> str:
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}"}
    try:
        response = requests.post(model_url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()[0]['generated_text']
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error querying HF model: {e}")
    except (KeyError, IndexError):
        raise HTTPException(status_code=500, detail="Error parsing HF response")
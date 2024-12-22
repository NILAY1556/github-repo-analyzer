import google.generativeai as genai
from dotenv import load_dotenv
import os
from fastapi import HTTPException

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

def query_gemini_model(prompt: str) -> str:
    model = genai.GenerativeModel('gemini-pro')
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying Gemini model: {e}")
from fastapi import FastAPI
from api import gemini, huggingface  # Import API modules
from core.context import get_repo_context
from models.schemas import AnalyzeRequest, AnalyzeResponse, ChatRequest, ChatResponse

app = FastAPI()

@app.post("/analyze_repo", response_model=AnalyzeResponse)
async def analyze_repo(request: AnalyzeRequest):
    repo_context = get_repo_context(request.repo_full_name)
    prompt = f"""Analyze the following GitHub repository based on its content:

        Repository: {request.repo_full_name}

        Content: {repo_context}   
        Provide a summary of the repository, its purpose, key technologies used, and any notable features or architecture."""
    if request.selected_model == "huggingface":
        analysis_result = huggingface.query_hf_model(huggingface.ANALYSIS_MODEL_URL, {"inputs": prompt})
        return AnalysisResponse(analysis=analysis_result)
    elif request.selected_model == "gemini":
        analysis_result = gemini.query_gemini_model(prompt)
        return AnalysisResponse(analysis=analysis_result)
    else:
        raise HTTPException(status_code=400, detail="Invalid model selected")

SYSTEM_PROMPT = """You are a helpful assistant that understands the context of a given GitHub repository. Answer questions based on the provided repository information."""

@app.post("/chat", response_model=ChatResponse)
async def chat_with_repo(request: ChatRequest):
    repo_context = get_repo_context(request.repo_full_name)
    prompt = f"""<|system|>\n{SYSTEM_PROMPT}<|endoftext|>\n<|user|>\nContext from repository {request.repo_full_name}:\n```\n{repo_context}\n```\n\n{request.message}<|endoftext|>\n<|assistant|>"""
    if request.selected_model == "huggingface":
        llm_response = huggingface.query_hf_model(huggingface.CHAT_MODEL_URL, {"inputs": prompt})
        return ChatResponse(response=llm_response)
    elif request.selected_model == "gemini":
        llm_response = gemini.query_gemini_model(prompt)
        return ChatResponse(response=llm_response)
    else:
        raise HTTPException(status_code=400, detail="Invalid model selected")









# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# import requests

# app = FastAPI()

# HUGGINGFACE_API_TOKEN = "YOUR_HUGGINGFACE_API_TOKEN"
# CHAT_MODEL_URL = "https://api-inference.huggingface.co/models/YOUR_CHAT_MODEL_HERE"
# ANALYSIS_MODEL_URL = "https://api-inference.huggingface.co/models/YOUR_ANALYSIS_MODEL_HERE"

# # --- Data Models ---
# class AnalyzeRequest(BaseModel):
#     repo_full_name: str

# class ChatRequest(BaseModel):
#     message: str
#     repo_full_name: str

# class ChatResponse(BaseModel):
#     response: str

# class AnalysisResponse(BaseModel):
#     analysis: str

# # --- Helper Functions (Optimize Context Retrieval Here) ---
# def get_repo_context(repo_full_name: str) -> str:
#     """
#     Optimized way to collect information and context from the repo.
#     For now, let's fetch README.md content. You'll enhance this.
#     """
#     owner, repo = repo_full_name.split("/")
#     readme_url = f"https://raw.githubusercontent.com/{owner}/{repo}/HEAD/README.md"
#     try:
#         response = requests.get(readme_url)
#         response.raise_for_status()
#         return response.text
#     except requests.exceptions.RequestException as e:
#         return f"Could not fetch README.md: {e}"

# def query_hf_model(model_url: str, payload: dict) -> str:
#     headers = {"Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}"}
#     try:
#         response = requests.post(model_url, headers=headers, json=payload)
#         response.raise_for_status()
#         return response.json()[0]['generated_text']
#     except requests.exceptions.RequestException as e:
#         raise HTTPException(status_code=500, detail=f"Error querying HF model: {e}")
#     except (KeyError, IndexError):
#         raise HTTPException(status_code=500, detail="Error parsing HF response")

# # --- Endpoints ---
# @app.post("/analyze_repo", response_model=AnalysisResponse)
# async def analyze_repo(request: AnalyzeRequest):
#     repo_context = get_repo_context(request.repo_full_name)
#     prompt = f"""Analyze the following GitHub repository based on its content:

#     Repository: {request.repo_full_name}

#     Content:
#     ```
#     {repo_context}
#     ```

#     Provide a summary of the repository, its purpose, key technologies used, and any notable features or architecture.
#     """
#     payload = {"inputs": prompt}
#     analysis_result = query_hf_model(ANALYSIS_MODEL_URL, payload)
#     return AnalysisResponse(analysis=analysis_result)

# SYSTEM_PROMPT = """You are a helpful assistant that understands the context of a given GitHub repository. Answer questions based on the provided repository information."""

# @app.post("/chat", response_model=ChatResponse)
# async def chat_with_repo(request: ChatRequest):
#     repo_context = get_repo_context(request.repo_full_name)
#     prompt = f"""<|system|>\n{SYSTEM_PROMPT}<|endoftext|>\n<|user|>\nContext from repository {request.repo_full_name}:\n```\n{repo_context}\n```\n\n{request.message}<|endoftext|>\n<|assistant|>"""
#     payload = {"inputs": prompt}
#     llm_response = query_hf_model(CHAT_MODEL_URL, payload)
#     return ChatResponse(response=llm_response)
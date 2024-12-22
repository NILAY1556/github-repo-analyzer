from pydantic import BaseModel

class AnalyzeRequest(BaseModel):
    repo_full_name: str
    selected_model: str

class ChatRequest(BaseModel):
    message: str
    repo_full_name: str
    selected_model: str

class ChatResponse(BaseModel):
    response: str

class AnalysisResponse(BaseModel):
    analysis: str
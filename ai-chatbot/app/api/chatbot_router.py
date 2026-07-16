import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.intent import detect_intent, should_escalate
from app.memory.conversation import get_conversation_history, save_message, clear_session
from app.rag.pipeline import RAGPipeline
from app.utils.language import detect_language

router = APIRouter()
rag_pipeline = RAGPipeline()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    customer_id: Optional[int] = None
    language: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    intent: str
    language: str
    confidence: float
    should_escalate: bool
    conversation_id: Optional[int] = None


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())
    language = request.language or detect_language(request.message)
    intent, confidence = detect_intent(request.message)
    escalate = should_escalate(intent, confidence)

    history = get_conversation_history(session_id)
    save_message(session_id, "user", request.message)

    response_text, resp_confidence = rag_pipeline.generate_response(
        message=request.message,
        language=language,
        history=history,
    )

    save_message(session_id, "assistant", response_text)

    return ChatResponse(
        response=response_text,
        session_id=session_id,
        intent=intent.value,
        language=language,
        confidence=max(confidence, resp_confidence),
        should_escalate=escalate,
    )


@router.delete("/session/{session_id}")
async def clear_conversation(session_id: str):
    clear_session(session_id)
    return {"message": "Session cleared"}


@router.get("/session/{session_id}/history")
async def get_history(session_id: str):
    return {"session_id": session_id, "history": get_conversation_history(session_id)}

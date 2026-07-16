"""Chat API router — processes user messages and returns AI responses."""
import uuid
from fastapi import APIRouter, HTTPException, status
from ..models.message import ChatRequest, ChatResponse
from ..services.intent_classifier import classify_intent
from ..services.nlp_service import get_conversation_history, save_message, clear_session
from ..services.response_generator import ResponseGenerator
from ..core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()
_response_generator = ResponseGenerator()


def _detect_language(text: str) -> str:
    """Detect language of incoming text."""
    try:
        from langdetect import detect
        lang = detect(text)
        return lang if lang in ["en", "fr", "ar"] else "en"
    except Exception:
        return "en"


@router.post("/message", response_model=ChatResponse, summary="Process a chat message")
async def process_message(request: ChatRequest) -> ChatResponse:
    """Process an incoming user message and return an AI-generated response."""
    session_id = request.session_id or str(uuid.uuid4())
    language = request.language or _detect_language(request.message)

    intent_result = classify_intent(request.message)
    history = get_conversation_history(session_id)

    save_message(session_id, "user", request.message)

    response_text, confidence = _response_generator.generate(
        message=request.message,
        language=language,
        history=history,
        context=request.context
    )

    save_message(session_id, "assistant", response_text)

    logger.info(
        "Message processed | session=%s intent=%s escalate=%s",
        session_id, intent_result.intent, intent_result.should_escalate
    )

    return ChatResponse(
        response=response_text,
        session_id=session_id,
        intent=intent_result.intent,
        language=language,
        confidence=max(intent_result.confidence, confidence),
        should_escalate=intent_result.should_escalate
    )


@router.delete("/session/{session_id}", summary="Clear a conversation session")
async def clear_conversation(session_id: str) -> dict:
    """Remove all history for a given session."""
    clear_session(session_id)
    return {"message": f"Session {session_id} cleared"}


@router.get("/session/{session_id}/history", summary="Get conversation history")
async def get_history(session_id: str) -> dict:
    """Retrieve the conversation history for a session."""
    return {"session_id": session_id, "history": get_conversation_history(session_id)}

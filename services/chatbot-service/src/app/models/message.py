"""Message models (DTOs) for the chatbot service."""
from typing import Optional
from pydantic import BaseModel, Field
from .intent import Intent


class ChatRequest(BaseModel):
    """Incoming chat message from the user."""
    message: str = Field(..., min_length=1, max_length=5000)
    session_id: Optional[str] = None
    customer_id: Optional[int] = None
    language: Optional[str] = None
    # Financial context injected by Spring Boot (accounts, transactions, beneficiaries)
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    """Chatbot response returned to the caller."""
    response: str
    session_id: str
    intent: Intent
    language: str
    confidence: float
    should_escalate: bool
    conversation_id: Optional[int] = None


class HistoryMessage(BaseModel):
    """A single message in the conversation history."""
    role: str
    content: str

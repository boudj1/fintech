"""Intent classification models."""
from enum import Enum
from pydantic import BaseModel


class Intent(str, Enum):
    GREETING = "greeting"
    FAREWELL = "farewell"
    HELP = "help"
    COMPLAINT = "complaint"
    BILLING = "billing"
    TECHNICAL = "technical"
    ACCOUNT = "account"
    PRODUCT_INFO = "product_info"
    ESCALATE = "escalate"
    OTHER = "other"


class IntentResult(BaseModel):
    intent: Intent
    confidence: float
    should_escalate: bool

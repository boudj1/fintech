from enum import Enum
import logging

logger = logging.getLogger(__name__)


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


INTENT_KEYWORDS = {
    Intent.GREETING: ["hello", "hi", "hey", "bonjour", "salut", "مرحبا", "السلام"],
    Intent.FAREWELL: ["bye", "goodbye", "au revoir", "merci", "شكرا", "مع السلامة"],
    Intent.COMPLAINT: ["complaint", "problem", "issue", "bad", "terrible", "broken", "plainte", "problème", "شكوى"],
    Intent.BILLING: ["invoice", "payment", "charge", "bill", "refund", "price", "facture", "paiement", "فاتورة", "دفع"],
    Intent.TECHNICAL: ["error", "bug", "crash", "not working", "technical", "erreur", "خطأ", "تقني"],
    Intent.ACCOUNT: ["account", "password", "login", "profile", "mot de passe", "حساب"],
    Intent.ESCALATE: ["human", "agent", "manager", "supervisor", "escalate", "humain", "بشري", "مشرف"],
    Intent.HELP: ["help", "support", "assist", "aide", "مساعدة"],
}


def detect_intent(text: str) -> tuple[Intent, float]:
    text_lower = text.lower()
    scores: dict[Intent, int] = {intent: 0 for intent in Intent}

    for intent, keywords in INTENT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                scores[intent] += 1

    best_intent = max(scores, key=lambda i: scores[i])
    best_score = scores[best_intent]

    if best_score == 0:
        return Intent.OTHER, 0.5

    confidence = min(0.5 + (best_score * 0.15), 0.95)
    return best_intent, confidence


def should_escalate(intent: Intent, confidence: float) -> bool:
    return intent == Intent.ESCALATE or (intent == Intent.COMPLAINT and confidence > 0.8)

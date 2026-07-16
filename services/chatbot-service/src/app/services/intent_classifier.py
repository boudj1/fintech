"""Intent classification service."""
from ..models.intent import Intent, IntentResult
from ..core.logger import get_logger
from ..core.constants import ESCALATION_CONFIDENCE_THRESHOLD

logger = get_logger(__name__)

INTENT_KEYWORDS: dict[Intent, list[str]] = {
    Intent.GREETING: ["hello", "hi", "hey", "bonjour", "salut", "مرحبا", "السلام"],
    Intent.FAREWELL: ["bye", "goodbye", "au revoir", "merci", "شكرا", "مع السلامة"],
    Intent.COMPLAINT: ["complaint", "problem", "issue", "bad", "terrible", "broken", "plainte", "problème", "شكوى"],
    Intent.BILLING: ["invoice", "payment", "charge", "bill", "refund", "price", "facture", "paiement", "فاتورة"],
    Intent.TECHNICAL: ["error", "bug", "crash", "not working", "technical", "erreur", "خطأ", "تقني"],
    Intent.ACCOUNT: ["account", "password", "login", "profile", "mot de passe", "حساب"],
    Intent.ESCALATE: ["human", "agent", "manager", "supervisor", "escalate", "humain", "بشري", "مشرف"],
    Intent.HELP: ["help", "support", "assist", "aide", "مساعدة"],
}


def classify_intent(text: str) -> IntentResult:
    """Classify the intent of a user message using keyword matching."""
    text_lower = text.lower()
    scores: dict[Intent, int] = {intent: 0 for intent in Intent}

    for intent, keywords in INTENT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                scores[intent] += 1

    best_intent = max(scores, key=lambda i: scores[i])
    best_score = scores[best_intent]

    if best_score == 0:
        return IntentResult(intent=Intent.OTHER, confidence=0.5, should_escalate=False)

    confidence = min(0.5 + (best_score * 0.15), 0.95)
    should_escalate = (
        best_intent == Intent.ESCALATE
        or (best_intent == Intent.COMPLAINT and confidence > ESCALATION_CONFIDENCE_THRESHOLD)
    )

    logger.debug("Intent classified: %s (confidence=%.2f)", best_intent, confidence)
    return IntentResult(intent=best_intent, confidence=confidence, should_escalate=should_escalate)

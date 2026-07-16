import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)


def _chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


def build_context_from_history(history: list[dict]) -> str:
    if not history:
        return ""
    recent = history[-6:]
    return "\n".join(f"{m['role'].capitalize()}: {m['content']}" for m in recent)


class RAGPipeline:
    def __init__(self):
        self._openai_available = False
        self._setup_openai()

    def _setup_openai(self):
        if not settings.openai_api_key:
            logger.warning("OpenAI API key not set. Using rule-based responses.")
            return
        try:
            from openai import OpenAI
            self._client = OpenAI(api_key=settings.openai_api_key)
            self._openai_available = True
            logger.info("OpenAI client initialized.")
        except Exception as e:
            logger.warning(f"Could not initialize OpenAI: {e}")

    def generate_response(
        self,
        message: str,
        language: str = "en",
        history: Optional[list[dict]] = None,
        knowledge_context: str = "",
    ) -> tuple[str, float]:
        if self._openai_available:
            return self._llm_response(message, language, history or [], knowledge_context)
        return self._rule_based_response(message, language)

    def _llm_response(self, message: str, language: str, history: list[dict], context: str) -> tuple[str, float]:
        try:
            lang_instruction = {
                "fr": "Respond in French.",
                "ar": "Respond in Arabic.",
            }.get(language, "Respond in English.")

            system_prompt = (
                f"You are a helpful customer service AI assistant. {lang_instruction} "
                "Be concise, professional, and helpful. "
            )
            if context:
                system_prompt += f"\n\nRelevant knowledge base context:\n{context}"

            messages = [{"role": "system", "content": system_prompt}]
            for h in history[-10:]:
                messages.append({"role": h["role"], "content": h["content"]})
            messages.append({"role": "user", "content": message})

            response = self._client.chat.completions.create(
                model=settings.openai_model,
                messages=messages,
                max_tokens=500,
                temperature=0.7,
            )
            return response.choices[0].message.content, 0.9
        except Exception as e:
            logger.error(f"LLM error: {e}")
            return self._rule_based_response(message, language)

    def _rule_based_response(self, message: str, language: str) -> tuple[str, float]:
        msg_lower = message.lower()

        responses = {
            "en": {
                "greet": "Hello! How can I help you today?",
                "bye": "Thank you for contacting us. Have a great day!",
                "help": "I'm here to help! Please describe your issue and I'll assist you.",
                "billing": "For billing inquiries, please provide your account details and I'll look into it.",
                "technical": "I understand you're experiencing a technical issue. Could you please describe it in detail?",
                "default": "Thank you for your message. A support agent will assist you shortly."
            },
            "fr": {
                "greet": "Bonjour! Comment puis-je vous aider?",
                "bye": "Merci de nous avoir contactés. Bonne journée!",
                "help": "Je suis là pour vous aider! Décrivez votre problème.",
                "default": "Merci pour votre message. Un agent vous contactera bientôt."
            },
            "ar": {
                "greet": "مرحباً! كيف يمكنني مساعدتك؟",
                "bye": "شكراً لتواصلك معنا. يوم سعيد!",
                "default": "شكراً لرسالتك. سيتواصل معك أحد الوكلاء قريباً."
            }
        }

        lang_resp = responses.get(language, responses["en"])

        if any(w in msg_lower for w in ["hello", "hi", "hey", "bonjour", "مرحبا"]):
            return lang_resp.get("greet", lang_resp["default"]), 0.8
        if any(w in msg_lower for w in ["bye", "goodbye", "merci", "شكرا"]):
            return lang_resp.get("bye", lang_resp["default"]), 0.8
        if any(w in msg_lower for w in ["help", "aide", "مساعدة"]):
            return lang_resp.get("help", lang_resp["default"]), 0.7
        if any(w in msg_lower for w in ["bill", "invoice", "payment", "facture"]):
            return lang_resp.get("billing", lang_resp["default"]), 0.7
        if any(w in msg_lower for w in ["error", "bug", "technical", "erreur"]):
            return lang_resp.get("technical", lang_resp["default"]), 0.7

        return lang_resp["default"], 0.6

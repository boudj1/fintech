"""FinFlow AI response generator — context-aware financial assistant."""
from typing import Optional
from ..core.config import settings
from ..core.logger import get_logger

logger = get_logger(__name__)

_FALLBACK: dict[str, dict[str, str]] = {
    "fr": {
        "greet": "Bonjour! Je suis FinFlow Assistant. Comment puis-je vous aider avec vos finances aujourd'hui?",
        "bye": "Merci d'avoir utilisé FinFlow. Bonne journée!",
        "help": "Je peux vous aider avec vos comptes, transactions, bénéficiaires et produits FinFlow. Que souhaitez-vous savoir?",
        "solde": "Je vais vérifier votre solde...",
        "default": "Je suis FinFlow Assistant. Posez-moi une question sur vos comptes, transactions ou bénéficiaires."
    },
    "ar": {
        "greet": "مرحباً! أنا مساعد FinFlow. كيف يمكنني مساعدتك في أمورك المالية؟",
        "bye": "شكراً لاستخدام FinFlow. يوم سعيد!",
        "help": "يمكنني مساعدتك في حساباتك والمعاملات والمستفيدين ومنتجات FinFlow.",
        "default": "أنا مساعد FinFlow. اسألني عن حساباتك أو معاملاتك."
    },
    "en": {
        "greet": "Hello! I'm FinFlow Assistant. How can I help with your finances today?",
        "bye": "Thank you for using FinFlow. Have a great day!",
        "help": "I can help with your accounts, transactions, beneficiaries and FinFlow products.",
        "default": "I'm FinFlow Assistant. Ask me about your accounts, transactions or beneficiaries."
    }
}


def _format_context(context: dict) -> str:
    """Build a human-readable financial context block for the system prompt."""
    lines: list[str] = []

    accounts = context.get("accounts", [])
    if accounts:
        lines.append("🏦 COMPTES:")
        for acc in accounts:
            lines.append(
                f"  • {acc.get('type', 'Compte')} ({acc.get('accountNumber', '—')}) : "
                f"{float(acc.get('balance', 0)):,.2f} {acc.get('currency', 'DZD')} "
                f"[{acc.get('status', 'ACTIF')}]"
            )
        lines.append("")

    wallet = context.get("wallet")
    if wallet:
        lines.append(
            f"💼 PORTEFEUILLE: {float(wallet.get('balance', 0)):,.2f} {wallet.get('currency', 'DZD')} "
            f"(limite journalière: {float(wallet.get('dailyLimit', 0)):,.2f} {wallet.get('currency', 'DZD')})"
        )
        lines.append("")

    transactions = context.get("recentTransactions", [])
    if transactions:
        lines.append("📋 10 DERNIÈRES TRANSACTIONS:")
        for tx in transactions[:10]:
            date_str = (tx.get("date") or "")[:10] if tx.get("date") else "N/A"
            desc = tx.get("description") or tx.get("type", "")
            lines.append(
                f"  • {date_str} | {tx.get('type','')} | "
                f"{float(tx.get('amount', 0)):,.2f} {tx.get('currency', 'DZD')} | "
                f"{tx.get('status','')} | {desc}"
            )
        lines.append("")

    beneficiaries = context.get("beneficiaries", [])
    if beneficiaries:
        lines.append("👥 BÉNÉFICIAIRES ENREGISTRÉS:")
        for b in beneficiaries:
            iban = f" ({b.get('iban')})" if b.get("iban") else ""
            bank = f" — {b.get('bankName')}" if b.get("bankName") else ""
            lines.append(f"  • {b.get('name', '')}{iban}{bank}")
        lines.append("")

    return "\n".join(lines) if lines else ""


def _build_system_prompt(language: str, context: Optional[dict]) -> str:
    """Compose the full system prompt with optional financial context."""
    lang_map = {"fr": "en français", "ar": "en arabe (العربية)", "en": "in English"}
    lang_instr = lang_map.get(language, "en français")

    prompt = (
        f"Tu es FinFlow Assistant, l'assistant financier intelligent de FinFlow — "
        f"une application de paiement numérique (similaire à Paysera). "
        f"Réponds toujours {lang_instr}. Sois précis, professionnel, et utile. "
        f"Ne révèle JAMAIS d'informations d'un autre client. "
        f"Tu ne peux pas initier de transactions — tu informes et conseilles uniquement. "
        f"Utilise les données financières ci-dessous pour répondre précisément.\n\n"
    )

    if context:
        ctx_block = _format_context(context)
        if ctx_block:
            prompt += "═══ DONNÉES FINANCIÈRES DU CLIENT ═══\n"
            prompt += ctx_block
            prompt += "═══════════════════════════════════════\n\n"

    return prompt


class ResponseGenerator:
    """Generates responses using OpenAI LLM with financial context, or rule-based fallback."""

    def __init__(self):
        self._openai_client = None
        self._try_init_openai()

    def _try_init_openai(self) -> None:
        if not settings.openai_api_key:
            logger.warning("OpenAI API key not set — using rule-based fallback.")
            return
        try:
            from openai import OpenAI
            self._openai_client = OpenAI(api_key=settings.openai_api_key)
            logger.info("OpenAI client initialized (model=%s)", settings.openai_model)
        except Exception as exc:
            logger.warning("OpenAI initialization failed: %s", exc)

    def generate(self, message: str, language: str,
                 history: Optional[list[dict]] = None,
                 context: Optional[dict] = None) -> tuple[str, float]:
        """Generate a response. Returns (response_text, confidence_score)."""
        if self._openai_client:
            return self._llm_response(message, language, history or [], context)
        return self._rule_based_response(message, language, context)

    def _llm_response(self, message: str, language: str,
                      history: list[dict],
                      context: Optional[dict]) -> tuple[str, float]:
        try:
            system_prompt = _build_system_prompt(language, context)
            messages = [{"role": "system", "content": system_prompt}]
            for h in history[-10:]:
                messages.append({"role": h["role"], "content": h["content"]})
            messages.append({"role": "user", "content": message})

            response = self._openai_client.chat.completions.create(
                model=settings.openai_model,
                messages=messages,
                max_tokens=600,
                temperature=0.5,
            )
            return response.choices[0].message.content, 0.92
        except Exception as exc:
            logger.error("LLM call failed: %s", exc)
            return self._rule_based_response(message, language, context)

    def _rule_based_response(self, message: str, language: str,
                             context: Optional[dict]) -> tuple[str, float]:
        msg_lower = message.lower()
        lang_resp = _FALLBACK.get(language, _FALLBACK["fr"])

        # Greet / bye
        if any(w in msg_lower for w in ["bonjour", "hello", "hi", "salam", "مرحبا", "salut"]):
            return lang_resp.get("greet", lang_resp["default"]), 0.85
        if any(w in msg_lower for w in ["bye", "merci", "au revoir", "شكرا"]):
            return lang_resp.get("bye", lang_resp["default"]), 0.85

        # Financial context questions — answered from real data
        if context:
            accounts = context.get("accounts", [])
            transactions = context.get("recentTransactions", [])
            beneficiaries = context.get("beneficiaries", [])
            wallet = context.get("wallet")

            # Balance / solde
            if any(w in msg_lower for w in ["solde", "balance", "combien", "رصيد", "compte"]):
                if accounts:
                    parts = [f"{a.get('type')} ({a.get('accountNumber')}): {float(a.get('balance',0)):,.2f} {a.get('currency','DZD')}"
                             for a in accounts]
                    if wallet:
                        parts.insert(0, f"Portefeuille: {float(wallet.get('balance',0)):,.2f} {wallet.get('currency','DZD')}")
                    return "Vos soldes actuels:\n• " + "\n• ".join(parts), 0.88
                return "Vous n'avez pas encore de compte FinFlow actif.", 0.75

            # Transactions / historique
            if any(w in msg_lower for w in ["transaction", "historique", "dernier", "virement", "paiement", "معاملات"]):
                if transactions:
                    lines = []
                    for tx in transactions[:5]:
                        date_str = (tx.get("date") or "")[:10]
                        desc = tx.get("description") or tx.get("type", "")
                        lines.append(f"{date_str} | {tx.get('type')} | {float(tx.get('amount',0)):,.2f} {tx.get('currency','DZD')} | {tx.get('status')} — {desc}")
                    return "Vos 5 dernières transactions:\n• " + "\n• ".join(lines), 0.88
                return "Aucune transaction trouvée.", 0.75

            # Beneficiaries
            if any(w in msg_lower for w in ["bénéficiaire", "beneficiaire", "destinataire", "مستفيد"]):
                if beneficiaries:
                    names = [b.get("name", "") for b in beneficiaries]
                    return "Vos bénéficiaires enregistrés:\n• " + "\n• ".join(names), 0.88
                return "Aucun bénéficiaire enregistré.", 0.75

        # Help
        if any(w in msg_lower for w in ["aide", "help", "مساعدة", "quoi", "que"]):
            return lang_resp.get("help", lang_resp["default"]), 0.80

        return lang_resp["default"], 0.60

from langdetect import detect, LangDetectException
import logging

logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES = {"en", "fr", "ar"}
DEFAULT_LANGUAGE = "en"


def detect_language(text: str) -> str:
    if not text or len(text.strip()) < 3:
        return DEFAULT_LANGUAGE
    try:
        detected = detect(text)
        return detected if detected in SUPPORTED_LANGUAGES else DEFAULT_LANGUAGE
    except LangDetectException:
        return DEFAULT_LANGUAGE


def get_language_name(code: str) -> str:
    names = {"en": "English", "fr": "French", "ar": "Arabic"}
    return names.get(code, "English")

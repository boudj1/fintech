"""NLP service: conversation memory management via Redis."""
import json
import logging
from typing import Optional
import redis
from ..core.config import settings
from ..core.logger import get_logger

logger = get_logger(__name__)

_redis_client: Optional[redis.Redis] = None
_memory_store: dict = {}


def _get_redis() -> Optional[redis.Redis]:
    """Lazily initialize Redis client."""
    global _redis_client
    if _redis_client is None:
        try:
            client = redis.from_url(settings.redis_url, decode_responses=True)
            client.ping()
            _redis_client = client
            logger.info("Redis connected successfully")
        except Exception as exc:
            logger.warning("Redis unavailable, using in-memory fallback: %s", exc)
    return _redis_client


def get_conversation_history(session_id: str) -> list[dict]:
    """Retrieve conversation history for a session."""
    client = _get_redis()
    if client:
        try:
            raw = client.get(f"conv:{session_id}")
            return json.loads(raw) if raw else []
        except Exception:
            pass
    return _memory_store.get(session_id, [])


def save_message(session_id: str, role: str, content: str) -> None:
    """Persist a message in the conversation history."""
    history = get_conversation_history(session_id)
    history.append({"role": role, "content": content})

    if len(history) > settings.max_memory_messages:
        history = history[-settings.max_memory_messages:]

    client = _get_redis()
    if client:
        try:
            client.setex(f"conv:{session_id}", settings.memory_ttl, json.dumps(history))
            return
        except Exception:
            pass
    _memory_store[session_id] = history


def clear_session(session_id: str) -> None:
    """Remove conversation history for a session."""
    client = _get_redis()
    if client:
        try:
            client.delete(f"conv:{session_id}")
        except Exception:
            pass
    _memory_store.pop(session_id, None)

import json
import logging
from typing import Optional
import redis
from app.config import settings

logger = logging.getLogger(__name__)


def get_redis_client() -> Optional[redis.Redis]:
    try:
        client = redis.from_url(settings.redis_url, decode_responses=True)
        client.ping()
        return client
    except Exception as e:
        logger.warning(f"Redis unavailable: {e}. Using in-memory fallback.")
        return None


_memory_store: dict = {}
_redis_client = None


def _get_client():
    global _redis_client
    if _redis_client is None:
        _redis_client = get_redis_client()
    return _redis_client


def get_conversation_history(session_id: str) -> list[dict]:
    client = _get_client()
    if client:
        try:
            data = client.get(f"conv:{session_id}")
            return json.loads(data) if data else []
        except Exception:
            pass
    return _memory_store.get(session_id, [])


def save_message(session_id: str, role: str, content: str) -> None:
    history = get_conversation_history(session_id)
    history.append({"role": role, "content": content})
    if len(history) > settings.max_memory_messages:
        history = history[-settings.max_memory_messages:]

    client = _get_client()
    if client:
        try:
            client.setex(f"conv:{session_id}", settings.memory_ttl, json.dumps(history))
            return
        except Exception:
            pass
    _memory_store[session_id] = history


def clear_session(session_id: str) -> None:
    client = _get_client()
    if client:
        try:
            client.delete(f"conv:{session_id}")
        except Exception:
            pass
    _memory_store.pop(session_id, None)

"""Chatbot service configuration."""
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings


class ChatbotSettings(BaseSettings):
    app_name: str = "Enterprise AI Chatbot Service"
    debug: bool = False
    port: int = 8001

    # Database
    database_url: str = "postgresql://enterprise_user:EnterpriseSecure123!@postgres:5432/enterprise_db"

    # Redis
    redis_url: str = "redis://redis:6379/0"

    # OpenAI
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"

    # RAG
    chunk_size: int = 500
    chunk_overlap: int = 50
    top_k_results: int = 3

    # Memory
    max_memory_messages: int = 20
    memory_ttl: int = 3600

    # CORS
    allowed_origins: list[str] = ["http://localhost:4200", "http://localhost:8080"]

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> ChatbotSettings:
    return ChatbotSettings()


settings = get_settings()

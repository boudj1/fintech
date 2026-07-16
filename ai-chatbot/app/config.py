from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "Enterprise AI Chatbot"
    debug: bool = False

    # Database
    database_url: str = "postgresql://enterprise_user:EnterpriseSecure123!@postgres:5432/enterprise_db"

    # Redis
    redis_url: str = "redis://redis:6379/0"

    # OpenAI
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"

    # RAG settings
    chunk_size: int = 500
    chunk_overlap: int = 50
    top_k_results: int = 3

    # Memory
    max_memory_messages: int = 20
    memory_ttl: int = 3600

    # CORS
    allowed_origins: list[str] = ["http://localhost:4200", "https://localhost", "http://localhost"]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

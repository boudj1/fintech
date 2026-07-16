"""Shared configuration utilities for all microservices."""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class CommonSettings(BaseSettings):
    """Base settings shared across all services."""

    environment: str = "development"
    debug: bool = False
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://enterprise_user:EnterpriseSecure123!@postgres:5432/enterprise_db"
    )
    redis_url: str = os.getenv("REDIS_URL", "redis://redis:6379/0")

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_common_settings() -> CommonSettings:
    return CommonSettings()

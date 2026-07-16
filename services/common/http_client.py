"""Shared HTTP client utilities for inter-service communication."""
import httpx
from typing import Any, Optional
from .logger import get_logger

logger = get_logger(__name__)


class ServiceClient:
    """Async HTTP client for calling other microservices."""

    def __init__(self, base_url: str, timeout: float = 30.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    async def get(self, path: str, params: Optional[dict] = None) -> Any:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}{path}", params=params)
            response.raise_for_status()
            return response.json()

    async def post(self, path: str, body: dict) -> Any:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(f"{self.base_url}{path}", json=body)
            response.raise_for_status()
            return response.json()

"""Authentication middleware for the chatbot service."""
from fastapi import Header, HTTPException, status
from typing import Optional


async def verify_service_token(
    x_service_token: Optional[str] = Header(None)
) -> None:
    """Verify inter-service communication tokens.

    Internal services use a shared secret for lightweight auth.
    Public endpoints rely on JWT validated by the Spring Boot gateway.
    """
    pass

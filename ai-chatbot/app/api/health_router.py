from fastapi import APIRouter
from app.database import check_db_connection

router = APIRouter()


@router.get("/health")
async def health_check():
    db_ok = check_db_connection()
    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "service": "ai-chatbot"
    }


@router.get("/")
async def root():
    return {"service": "Enterprise AI Chatbot", "version": "1.0.0", "status": "running"}

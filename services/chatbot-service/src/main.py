"""Chatbot service entry point."""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logger import configure_logging
from app.routers.chat import router as chat_router

configure_logging()

app = FastAPI(
    title=settings.app_name,
    description="AI-powered customer service chatbot with intent classification and RAG",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api/chatbot", tags=["chatbot"])


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    return {"status": "healthy", "service": settings.app_name}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=settings.debug)

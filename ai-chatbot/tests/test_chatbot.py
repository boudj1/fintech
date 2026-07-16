import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.utils.language import detect_language
from app.agents.intent import detect_intent, Intent
from app.memory.conversation import get_conversation_history, save_message, clear_session

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["service"] == "ai-chatbot"


def test_language_detection_english():
    assert detect_language("Hello, how are you?") == "en"


def test_language_detection_french():
    assert detect_language("Bonjour, comment allez-vous?") == "fr"


def test_intent_greeting():
    intent, confidence = detect_intent("Hello there!")
    assert intent == Intent.GREETING
    assert confidence > 0.5


def test_intent_billing():
    intent, confidence = detect_intent("I have an issue with my invoice and payment")
    assert intent == Intent.BILLING


def test_intent_escalation():
    intent, confidence = detect_intent("I need to speak to a human agent immediately")
    assert intent == Intent.ESCALATE


def test_memory_store_retrieve():
    session_id = "test-session-123"
    clear_session(session_id)
    save_message(session_id, "user", "Test message")
    save_message(session_id, "assistant", "Test response")
    history = get_conversation_history(session_id)
    assert len(history) == 2
    assert history[0]["role"] == "user"
    assert history[1]["role"] == "assistant"
    clear_session(session_id)


def test_chat_endpoint():
    response = client.post("/api/chatbot/message", json={
        "message": "Hello, I need help",
        "language": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "session_id" in data
    assert "intent" in data
    assert "language" in data


def test_chat_endpoint_french():
    response = client.post("/api/chatbot/message", json={
        "message": "Bonjour, j'ai besoin d'aide",
        "language": "fr"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "fr"


def test_clear_session():
    session_id = "clear-test-session"
    save_message(session_id, "user", "hello")
    response = client.delete(f"/api/chatbot/session/{session_id}")
    assert response.status_code == 200

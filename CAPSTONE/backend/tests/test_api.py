"""
Tests for API routes (chat, drafting, complaint conversion, documents).
"""

from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_empty_chat_message():
    response = client.post("/api/chat", json={"message": "", "language": "English"})
    # Expect 422 or 400 for empty message
    assert response.status_code in (400, 422)


@patch("backend.services.ollama_service.OllamaService.generate")
def test_valid_chat_mocked(mock_generate):
    mock_generate.return_value = {
        "error": False,
        "text": "Under Section 378 of the Indian Penal Code, theft is defined as dishonest taking of movable property.\n\nPlain Language Summary: Theft is taking someone's property without their consent.",
        "model": "llama3.2:3b",
    }

    response = client.post(
        "/api/chat",
        json={"message": "What is the punishment for theft?", "language": "English"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "Section 378" in data["answer"]
    assert "disclaimer" in data
    assert len(data["disclaimer"]) > 0


@patch("backend.services.ollama_service.OllamaService.generate")
def test_chat_when_ollama_unavailable(mock_generate):
    mock_generate.return_value = {
        "error": True,
        "message": "Ollama is not running. Start Ollama and try again.",
    }

    response = client.post(
        "/api/chat",
        json={"message": "What is the punishment for theft?", "language": "English"},
    )
    # Must not crash, should return structured response or graceful notice
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "disclaimer" in data


def test_documents_list():
    response = client.get("/api/documents")
    assert response.status_code == 200
    data = response.json()
    assert "total_documents" in data
    assert isinstance(data["documents"], list)


def test_documents_count():
    response = client.get("/api/documents/count")
    assert response.status_code == 200
    data = response.json()
    assert "documents_count" in data
    assert "indexed_chunks" in data

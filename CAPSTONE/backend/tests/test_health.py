"""
Tests for NyayaMithra Health Endpoints.
"""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "NyayaMithra API"
    assert data["status"] == "online"


def test_health_overall():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "backend_running" in data
    assert data["backend_running"] is True
    assert "ollama_running" in data
    assert "model" in data
    assert "chroma_status" in data


def test_health_ollama():
    response = client.get("/api/health/ollama")
    assert response.status_code == 200
    data = response.json()
    assert "ollama_running" in data
    assert "model" in data


def test_health_chroma():
    response = client.get("/api/health/chroma")
    assert response.status_code == 200
    data = response.json()
    assert "collection_name" in data
    assert "total_chunks" in data

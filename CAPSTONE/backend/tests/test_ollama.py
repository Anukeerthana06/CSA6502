"""
Tests for OllamaService error handling and mocked generation.
"""

import pytest
from unittest.mock import patch, AsyncMock
from backend.services.ollama_service import OllamaService


@pytest.mark.asyncio
async def test_ollama_connection_refused_handling():
    # Test against an unreachable port to verify it does not raise uncaught exception
    service = OllamaService(base_url="http://127.0.0.1:59999")
    health = await service.check_health()
    assert health["ollama_running"] is False
    assert "error" in health["status"]
    assert "message" in health


@pytest.mark.asyncio
@patch("httpx.AsyncClient.post")
async def test_ollama_generate_mock(mock_post):
    mock_post.return_value = AsyncMock(
        status_code=200,
        json=lambda: {"response": "Section 420 deals with cheating and dishonestly inducing delivery of property.", "total_duration": 1200},
    )

    service = OllamaService()
    res = await service.generate(prompt="What is Section 420?")
    assert res["error"] is False
    assert "Section 420" in res["text"]

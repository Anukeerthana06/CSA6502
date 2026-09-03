"""
Tests for LegalRetriever and embedding provider.
"""

from backend.rag.retriever import get_retriever
from backend.rag.embeddings import EmbeddingProvider


def test_embedding_provider_dimension():
    provider = EmbeddingProvider()
    vec = provider.embed_query("What is theft under Indian Penal Code?")
    assert len(vec) == 384
    assert isinstance(vec[0], float)


def test_retriever_safe_instantiation():
    retriever = get_retriever()
    assert retriever is not None
    health = retriever.check_health()
    assert "status" in health


def test_retriever_empty_query():
    retriever = get_retriever()
    # Empty query or query with no documents should return a list without crashing
    results = retriever.retrieve("")
    assert isinstance(results, list)

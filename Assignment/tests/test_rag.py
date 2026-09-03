"""
test_rag.py
-----------
Tests for the RAG retrieval module.

Note: these tests require the vector database to have been built first
(python ingest.py). If it hasn't, tests that depend on it are skipped
rather than failed, since building the index requires downloading an
embedding model which may not be available in every environment (e.g.
CI without internet access).
"""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import config
from rag import RAGSystem


@pytest.fixture(scope="module")
def rag():
    return RAGSystem()


def _skip_if_not_ready(rag_system: RAGSystem):
    if not rag_system.is_ready():
        pytest.skip(f"Vector DB not ready: {rag_system.load_error()}")


def test_rag_load_error_when_missing(monkeypatch, tmp_path):
    # Point config at a nonexistent index path to verify graceful failure.
    monkeypatch.setattr(config, "FAISS_INDEX_PATH", tmp_path / "missing.bin")
    monkeypatch.setattr(config, "METADATA_PATH", tmp_path / "missing.json")
    r = RAGSystem()
    assert r.is_ready() is False
    assert r.load_error() is not None


def test_retrieve_returns_top_k(rag):
    _skip_if_not_ready(rag)
    results = rag.retrieve("motor overheating vibration", top_k=3)
    assert len(results) <= 3
    for r in results:
        assert "source" in r
        assert "chunk_id" in r
        assert "similarity" in r
        assert "text" in r


def test_retrieve_empty_query_returns_empty(rag):
    _skip_if_not_ready(rag)
    results = rag.retrieve("", top_k=3)
    assert results == []


def test_retrieve_ordering_is_descending_similarity(rag):
    _skip_if_not_ready(rag)
    results = rag.retrieve("bearing lubrication schedule", top_k=5)
    scores = [r["similarity"] for r in results]
    assert scores == sorted(scores, reverse=True)

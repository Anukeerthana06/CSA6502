"""
rag.py
------
Retrieval-Augmented Generation module.

Loads the FAISS index and chunk metadata built by ingest.py, embeds
incoming queries with the same sentence-transformers model, and returns
Top-K retrieved chunks with source filename, chunk id, similarity score,
and text -- everything the UI needs to display for academic evaluation.

This module degrades gracefully: if the FAISS index or the embedding
model isn't available, `is_ready()` returns False and the caller
(app.py) shows an explanatory message rather than crashing.
"""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

import config


class RAGSystem:
    def __init__(self) -> None:
        self._model = None
        self._index = None
        self._metadata: List[Dict[str, Any]] = []
        self._load_error: Optional[str] = None
        self._load()

    # ------------------------------------------------------------------
    def _load(self) -> None:
        if not config.FAISS_INDEX_PATH.exists() or not config.METADATA_PATH.exists():
            self._load_error = (
                "Vector database not found. Run 'python ingest.py' to build it "
                "from the documents in data/manuals, data/sops, and data/incidents."
            )
            return

        try:
            import faiss  # noqa: F401
            from sentence_transformers import SentenceTransformer
        except ImportError as e:
            self._load_error = (
                f"Missing dependency for RAG retrieval ({e}). "
                f"Install requirements: pip install -r requirements.txt"
            )
            return

        try:
            import faiss
            self._index = faiss.read_index(str(config.FAISS_INDEX_PATH))
            with open(config.METADATA_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            self._metadata = data.get("chunks", [])
            self._model = SentenceTransformer(config.EMBEDDING_MODEL)
        except Exception as e:
            self._load_error = f"Failed to load vector database: {e}"
            self._index = None

    # ------------------------------------------------------------------
    def is_ready(self) -> bool:
        return self._index is not None and self._model is not None

    def load_error(self) -> Optional[str]:
        return self._load_error

    def num_chunks(self) -> int:
        return len(self._metadata)

    def num_sources(self) -> int:
        return len({m["source"] for m in self._metadata})

    # ------------------------------------------------------------------
    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Returns up to top_k chunks as a list of dicts:
        {chunk_id, source, similarity, text}
        Ordered by descending similarity.
        """
        if not self.is_ready() or not query or not query.strip():
            return []

        import faiss  # local import keeps module importable without faiss installed

        query_vec = self._model.encode([query], convert_to_numpy=True).astype("float32")
        faiss.normalize_L2(query_vec)

        k = min(top_k, len(self._metadata))
        if k <= 0:
            return []

        similarities, indices = self._index.search(query_vec, k)

        results = []
        for sim, idx in zip(similarities[0], indices[0]):
            if idx < 0 or idx >= len(self._metadata):
                continue
            meta = self._metadata[idx]
            results.append(
                {
                    "chunk_id": meta.get("chunk_id"),
                    "source": meta.get("source"),
                    "similarity": float(sim),
                    "text": meta.get("text", ""),
                }
            )
        return results


# Module-level singleton so Streamlit doesn't reload the model on every
# rerun. app.py wraps this in @st.cache_resource for extra safety.
_rag_instance: Optional[RAGSystem] = None


def get_rag_system() -> RAGSystem:
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = RAGSystem()
    return _rag_instance

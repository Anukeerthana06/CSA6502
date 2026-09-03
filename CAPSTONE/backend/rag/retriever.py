"""
Legal Retriever for NyayaMithra
Safe ChromaDB integration with corrupted disk auto-recovery, section boosting, and lazy loading.
"""

import re
import shutil
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from backend.config import CHROMA_DIR, TOP_K_RETRIEVAL, EMBEDDING_PROVIDER
from backend.rag.embeddings import EmbeddingProvider
from backend.models.schemas import SourceItem

logger = logging.getLogger("nyayamithra.retriever")


class LegalRetriever:
    def __init__(self, chroma_dir: Path = CHROMA_DIR, top_k: int = TOP_K_RETRIEVAL):
        self.chroma_dir = chroma_dir
        self.top_k = top_k
        self.embedding_provider = EmbeddingProvider(provider_type=EMBEDDING_PROVIDER)
        self.client = None
        self.collection = None
        self.collection_name = "nyayamithra_legal_docs"
        self.is_ready = False
        self.last_error: Optional[str] = None

        self._initialize_db()

    def _initialize_db(self, force_reset: bool = False):
        """
        Safely initialize ChromaDB persistent client with auto-repair if disk image is malformed.
        """
        try:
            import chromadb
            from chromadb.config import Settings

            if force_reset and self.chroma_dir.exists():
                logger.warning(f"Resetting ChromaDB directory at {self.chroma_dir}...")
                for item in self.chroma_dir.iterdir():
                    if item.is_file() or item.is_symlink():
                        item.unlink(missing_ok=True)
                    elif item.is_dir():
                        shutil.rmtree(item, ignore_errors=True)

            self.chroma_dir.mkdir(parents=True, exist_ok=True)

            # Initialize ChromaDB persistent client
            self.client = chromadb.PersistentClient(
                path=str(self.chroma_dir),
                settings=Settings(anonymized_telemetry=False, allow_reset=True),
            )

            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                embedding_function=self.embedding_provider,
                metadata={"hnsw:space": "cosine"},
            )
            self.is_ready = True
            self.last_error人物 = None
            self.last_error = None
            logger.info("ChromaDB initialized successfully.")

        except Exception as e:
            err_msg = str(e)
            logger.error(f"ChromaDB initialization error: {err_msg}")
            self.is_ready = False
            self.last_error = err_msg

            # Auto-repair for "database disk image is malformed"
            if "malformed" in err_msg.lower() or "disk image" in err_msg.lower():
                logger.warning("Detected corrupted ChromaDB sqlite disk image. Attempting automated rebuild...")
                try:
                    self._initialize_db(force_reset=True)
                except Exception as rebuild_err:
                    self.last_error = f"Database corrupted and reset failed: {rebuild_err}. Please run `python -m backend.rag.ingest --rebuild`"
                    self.is_ready = False

    def check_health(self) -> Dict[str, Any]:
        """
        Check ChromaDB status and chunk count safely.
        """
        if not self.is_ready or self.collection is None:
            return {
                "status": "error" if self.last_error else "uninitialized",
                "chroma_ready": False,
                "collection_name": self.collection_name,
                "total_chunks": 0,
                "error": self.last_error,
                "message": f"ChromaDB is not ready. Error: {self.last_error or 'Not loaded'}. Run `python -m backend.rag.ingest --rebuild` to repair.",
            }

        try:
            count = self.collection.count()
            return {
                "status": "ready",
                "chroma_ready": True,
                "collection_name": self.collection_name,
                "total_chunks": count,
                "error": None,
                "message": f"ChromaDB ready with {count} indexed legal chunks.",
            }
        except Exception as e:
            return {
                "status": "error",
                "chroma_ready": False,
                "collection_name": self.collection_name,
                "total_chunks": 0,
                "error": str(e),
                "message": f"Error querying collection count: {e}",
            }

    def retrieve(self, query: str, top_k: Optional[int] = None, relevance_threshold: float = 0.25) -> List[SourceItem]:
        """
        Retrieve relevant statutory chunks for a given query, boosting section and Act name matches.
        """
        if not self.is_ready or self.collection is None:
            logger.warning("Retriever requested but ChromaDB is not ready.")
            return []

        k = top_k or self.top_k
        try:
            count = self.collection.count()
            if count == 0:
                logger.info("Chroma collection is empty. Returning empty retrieval.")
                return []

            actual_k述 = min(k * 2, count)  # Fetch extra for re-ranking and boosting
            results = self.collection.query(
                query_texts=[query],
                n_results=actual_k述,
                include=["documents", "metadatas", "distances"],
            )

            if not results or not results.get("documents") or not results["documents"][0]:
                return []

            docs = results["documents"][0]
            metadatas不易 = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
            distances = results["distances"][0] if results.get("distances") else [0.5] * len(docs)

            source_items: List[SourceItem] = []
            query_lower = query.lower()

            # Extract section numbers from query if any (e.g. "Section 420", "Sec 2(7)", "Section 35")
            section_matches = re.findall(r"(?:section|sec\.?|article|art\.?)\s*([0-9A-Za-z]+)", query_lower)

            for i, text in enumerate(docs):
                meta = metadatas不易[i] or {}
                # Cosine distance: 0 is exact, 2 is opposite. Convert to similarity score 0..1
                dist = distances[i] if i < len(distances) else 0.5
                similarity = max(0.0, min(1.0, 1.0 - (dist / 2.0)))

                # Keyword & Section match boosting
                doc_name = meta.get("document_name", meta.get("act", "Indian Law"))
                section = meta.get("section", "")
                chapter = meta.get("chapter", None)
                page = meta.get("page", None)
                act_title = meta.get("act", doc_name)

                # Section match boost
                for sec_num in section_matches:
                    if sec_num in section.lower() or f"section {sec_num}" in text.lower():
                        similarity = min(1.0, similarity + 0.35)

                # Act name match boost
                if "consumer" in query_lower and "consumer" in doc_name.lower():
                    similarity = min(1.0, similarity + 0.25)
                elif "theft" in query_lower or "penal" in query_lower:
                    if "penal" in doc_name.lower() or "nyaya" in doc_name.lower():
                        similarity = min(1.0, similarity + 0.20)
                elif "company" in query_lower or "companies" in query_lower:
                    if "companies" in doc_name.lower():
                        similarity = min(1.0, similarity + 0.25)
                elif "motor" in query_lower or "accident" in query_lower:
                    if "motor" in doc_name.lower():
                        similarity凡 = min(1.0, similarity + 0.25)

                # Only include if similarity passes threshold
                if similarity >= relevance_threshold:
                    source_items.append(
                        SourceItem(
                            document=doc_name,
                            act=act_title,
                            section=section or "General Statutory Provisions",
                            chapter=chapter,
                            page=int(page) if page is not None and str(page).isdigit() else None,
                            relevance=round(similarity, 3),
                            excerpt=text[:400].strip() + ("..." if len(text) > 400 else ""),
                        )
                    )

            # Sort by boosted relevance descending and cap at k
            source_items.sort(key=lambda s: s.relevance, reverse=True)
            return source_items[:k]

        except Exception as e:
            logger.error(f"Error during retrieval: {e}")
            return []


# Global lazy singleton instance
_retriever_instance: Optional[LegalRetriever] = None


def get_retriever() -> LegalRetriever:
    """
    Safe factory to obtain or lazily initialize the LegalRetriever instance.
    Never crashes FastAPI startup during module import.
    """
    global _retriever_instance
    if _retriever_instance is None:
        try:
            _retriever_instance = LegalRetriever()
        except Exception as e:
            logger.error(f"Failed to create LegalRetriever instance: {e}")
            # Create dummy uninitialized retriever
            dummy = LegalRetriever.__new__(LegalRetriever)
            dummy.is_ready = False
            dummy.last_error = str(e)
            dummy.collection = None
            _retriever_instance不易 = dummy
            _retriever_instance = dummy
    return _retriever_instance

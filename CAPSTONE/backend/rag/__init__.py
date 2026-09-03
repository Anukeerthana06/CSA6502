"""
Local RAG (Retrieval-Augmented Generation) package for NyayaMithra.
Uses ChromaDB, local embeddings, legal document loader, and chunker.
"""

from .loader import LegalDocumentLoader, LoadedPage
from .chunker import LegalChunker
from .embeddings import EmbeddingProvider
from .retriever import LegalRetriever, get_retriever
from .ingest import ingest_documents

__all__ = [
    "LegalDocumentLoader",
    "LoadedPage",
    "LegalChunker",
    "EmbeddingProvider",
    "LegalRetriever",
    "get_retriever",
    "ingest_documents",
]

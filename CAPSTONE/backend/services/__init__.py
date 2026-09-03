"""
Backend services package for NyayaMithra.
"""

from .ollama_service import OllamaService, get_ollama_service
from .drafting_service import DraftingService, get_drafting_service

__all__ = [
    "OllamaService",
    "get_ollama_service",
    "DraftingService",
    "get_drafting_service",
]

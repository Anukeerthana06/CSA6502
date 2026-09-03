"""
utils.py
--------
Shared helper functions: input validation, text chunking, timing helpers.
No module here talks to an LLM, vector DB, or the filesystem outside of
what is strictly needed for validation -- keeps this file dependency-light
so it can be imported everywhere safely.
"""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass
from typing import List, Optional

import config


@dataclass
class ValidationResult:
    ok: bool
    message: str = ""


# ----------------------------------------------------------------------
# Text validation
# ----------------------------------------------------------------------
def validate_text_input(text: Optional[str]) -> ValidationResult:
    if text is None or text.strip() == "":
        return ValidationResult(False, "Text input is empty. Please describe the equipment problem.")
    if len(text) > config.MAX_TEXT_LENGTH:
        return ValidationResult(
            False,
            f"Text input is too long ({len(text)} chars). "
            f"Maximum allowed is {config.MAX_TEXT_LENGTH} characters.",
        )
    return ValidationResult(True)


# ----------------------------------------------------------------------
# File validation (works with Streamlit's UploadedFile or any object
# exposing .name and .size / getbuffer())
# ----------------------------------------------------------------------
def _get_extension(filename: str) -> str:
    if "." not in filename:
        return ""
    return filename.rsplit(".", 1)[-1].lower()


def _get_size_bytes(uploaded_file) -> int:
    if hasattr(uploaded_file, "size") and uploaded_file.size is not None:
        return uploaded_file.size
    try:
        return len(uploaded_file.getbuffer())
    except Exception:
        return 0


def validate_image_file(uploaded_file) -> ValidationResult:
    if uploaded_file is None:
        return ValidationResult(False, "No image file provided.")
    ext = _get_extension(uploaded_file.name)
    if ext not in config.ALLOWED_IMAGE_TYPES:
        return ValidationResult(
            False,
            f"Unsupported image type '.{ext}'. Allowed types: {sorted(config.ALLOWED_IMAGE_TYPES)}",
        )
    size_mb = _get_size_bytes(uploaded_file) / (1024 * 1024)
    if size_mb > config.MAX_IMAGE_SIZE_MB:
        return ValidationResult(
            False, f"Image file too large ({size_mb:.1f} MB). Max is {config.MAX_IMAGE_SIZE_MB} MB."
        )
    return ValidationResult(True)


def validate_audio_file(uploaded_file) -> ValidationResult:
    if uploaded_file is None:
        return ValidationResult(False, "No audio file provided.")
    ext = _get_extension(uploaded_file.name)
    if ext not in config.ALLOWED_AUDIO_TYPES:
        return ValidationResult(
            False,
            f"Unsupported audio type '.{ext}'. Allowed types: {sorted(config.ALLOWED_AUDIO_TYPES)}",
        )
    size_mb = _get_size_bytes(uploaded_file) / (1024 * 1024)
    if size_mb > config.MAX_AUDIO_SIZE_MB:
        return ValidationResult(
            False, f"Audio file too large ({size_mb:.1f} MB). Max is {config.MAX_AUDIO_SIZE_MB} MB."
        )
    return ValidationResult(True)


def validate_document_file(uploaded_file) -> ValidationResult:
    if uploaded_file is None:
        return ValidationResult(False, "No document file provided.")
    ext = _get_extension(uploaded_file.name)
    if ext not in config.ALLOWED_DOCUMENT_TYPES:
        return ValidationResult(
            False,
            f"Unsupported document type '.{ext}'. Allowed types: {sorted(config.ALLOWED_DOCUMENT_TYPES)}",
        )
    return ValidationResult(True)


# ----------------------------------------------------------------------
# Chunking (used by ingest.py)
# ----------------------------------------------------------------------
def chunk_text(text: str, chunk_size: int = None, overlap: int = None) -> List[str]:
    """
    Splits text into overlapping character-based chunks.
    Whitespace is normalized first so chunk boundaries are cleaner.
    """
    chunk_size = chunk_size or config.CHUNK_SIZE
    overlap = overlap or config.CHUNK_OVERLAP

    text = " ".join(text.split())
    if not text:
        return []

    if overlap >= chunk_size:
        overlap = chunk_size // 4

    chunks = []
    start = 0
    n = len(text)
    while start < n:
        end = min(start + chunk_size, n)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == n:
            break
        start = end - overlap
    return chunks


# ----------------------------------------------------------------------
# Misc
# ----------------------------------------------------------------------
def new_session_id() -> str:
    return str(uuid.uuid4())


class Timer:
    """Small context manager for measuring elapsed wall-clock time (ms)."""

    def __enter__(self):
        self._start = time.perf_counter()
        return self

    def __exit__(self, *exc):
        self.elapsed_ms = round((time.perf_counter() - self._start) * 1000, 2)

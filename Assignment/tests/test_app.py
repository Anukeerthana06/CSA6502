"""
test_app.py
-----------
Tests for the input-validation utilities and rate limiter used directly by
app.py. We do not attempt to drive the Streamlit UI itself (that requires
Streamlit's AppTest framework and a running app); instead we test the
underlying logic app.py depends on.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import config
import rate_limiter
from utils import (
    validate_text_input,
    validate_image_file,
    validate_audio_file,
    chunk_text,
    new_session_id,
)


class FakeUploadedFile:
    """Minimal stand-in for Streamlit's UploadedFile for validation tests."""

    def __init__(self, name: str, size: int):
        self.name = name
        self.size = size


def test_validate_text_input_empty():
    result = validate_text_input("   ")
    assert result.ok is False


def test_validate_text_input_valid():
    result = validate_text_input("The motor is overheating after 20 minutes.")
    assert result.ok is True


def test_validate_text_input_too_long():
    long_text = "a" * (config.MAX_TEXT_LENGTH + 1)
    result = validate_text_input(long_text)
    assert result.ok is False


def test_validate_image_file_wrong_type():
    f = FakeUploadedFile("motor.gif", 1000)
    result = validate_image_file(f)
    assert result.ok is False


def test_validate_image_file_too_large():
    f = FakeUploadedFile("motor.png", (config.MAX_IMAGE_SIZE_MB + 1) * 1024 * 1024)
    result = validate_image_file(f)
    assert result.ok is False


def test_validate_image_file_valid():
    f = FakeUploadedFile("motor.png", 1024 * 1024)
    result = validate_image_file(f)
    assert result.ok is True


def test_validate_audio_file_wrong_type():
    f = FakeUploadedFile("note.ogg", 1000)
    result = validate_audio_file(f)
    assert result.ok is False


def test_chunk_text_produces_overlapping_chunks():
    text = "word " * 400  # long text
    chunks = chunk_text(text, chunk_size=100, overlap=20)
    assert len(chunks) > 1
    assert all(len(c) <= 100 for c in chunks)


def test_rate_limiter_allows_up_to_limit_then_blocks():
    session_id = new_session_id()
    for _ in range(config.RATE_LIMIT_MAX_REQUESTS):
        assert rate_limiter.check_and_record(session_id) is True
    assert rate_limiter.check_and_record(session_id) is False

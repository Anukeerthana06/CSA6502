"""
test_safety.py
---------------
Tests for grounding checks, unsafe-content detection, and human-review flags.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from safety import (
    grounding_check,
    unsafe_content_check,
    requires_human_review,
    safety_check,
    evidence_strength_label,
)


def test_unsafe_content_detects_bypass_language():
    result = unsafe_content_check("How do I bypass the safety interlock on this motor?")
    assert result["unsafe_detected"] is True


def test_unsafe_content_allows_normal_query():
    result = unsafe_content_check("Why is my motor vibrating after startup?")
    assert result["unsafe_detected"] is False


def test_grounding_check_no_evidence():
    result = grounding_check("Some answer text.", [])
    assert result["grounded"] is False


def test_grounding_check_strong_evidence():
    chunks = [{"source": "motor_manual.txt", "chunk_id": 1, "similarity": 0.8, "text": "..."}]
    result = grounding_check("Some answer text.", chunks)
    assert result["grounded"] is True
    assert result["best_similarity"] == 0.8


def test_requires_human_review_on_unsafe_content():
    grounding = {"grounded": True, "best_similarity": 0.9}
    unsafe = {"unsafe_detected": True, "matched_patterns": ["bypass"]}
    assert requires_human_review(grounding, unsafe, "RETRIEVE", [{"source": "x"}]) is True


def test_requires_human_review_false_when_all_clear():
    grounding = {"grounded": True, "best_similarity": 0.9}
    unsafe = {"unsafe_detected": False, "matched_patterns": []}
    chunks = [{"source": "motor_manual.txt"}]
    assert requires_human_review(grounding, unsafe, "RETRIEVE", chunks) is False


def test_evidence_strength_labels():
    assert evidence_strength_label(0.0, False) == "No evidence retrieved"
    assert "Low evidence" in evidence_strength_label(0.1, True)
    assert evidence_strength_label(0.9, True) == "Strong evidence"


def test_safety_check_bundles_everything():
    chunks = [{"source": "motor_manual.txt", "chunk_id": 0, "similarity": 0.7, "text": "..."}]
    result = safety_check(
        user_query="Why is the motor overheating?",
        response_text="## Possible Fault\nOverheating likely due to poor ventilation.",
        retrieved_chunks=chunks,
        agent_decision="RETRIEVE",
    )
    assert "grounding" in result
    assert "unsafe" in result
    assert "human_review_required" in result
    assert "evidence_strength" in result

"""
safety.py
---------
Prototype Responsible-AI safeguards for IndustroSense AI.

These are heuristic, rule-based checks suitable for a lab/capstone
demonstration. They are NOT a substitute for a rigorous safety review,
red-teaming, or a calibrated hallucination-detection model. They should
be described to users as "prototype safeguards" rather than guarantees.

Three main checks:
1. grounding_check()      - is the answer actually supported by retrieved evidence?
2. unsafe_content_check() - does the answer/query suggest bypassing safety systems?
3. requires_human_review()- should this response be flagged for a human to check?

safety_check() bundles all of the above into a single result dict used
by app.py and audit_logger.py.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List

import config

# Phrases that indicate the model (or the user) is heading toward unsafe
# maintenance/operational advice. This list is intentionally simple and
# will have false positives/negatives -- it is a prototype filter.
UNSAFE_PATTERNS = [
    r"\bdisable\s+(the\s+)?(emergency|safety)\b",
    r"\bbypass\s+(the\s+)?(interlock|safety|emergency|protection)\b",
    r"\bremove\s+(the\s+)?(guard|shield|interlock)\b",
    r"\boverride\s+(the\s+)?(safety|protection|interlock)\b",
    r"\bignore\s+(the\s+)?(alarm|warning|safety)\b",
    r"\bwork\s+on\s+(live|energized)\s+(equipment|circuit|motor)\b",
    r"\bwithout\s+(lockout|tagout|loto)\b",
]
_UNSAFE_REGEXES = [re.compile(p, re.IGNORECASE) for p in UNSAFE_PATTERNS]

DANGEROUS_MAINTENANCE_KEYWORDS = [
    "high voltage", "energized", "live wire", "confined space",
    "pressurized", "flammable", "explosion", "arc flash",
]


def unsafe_content_check(text: str) -> Dict[str, Any]:
    """Scans text (query or generated answer) for unsafe-instruction patterns."""
    if not text:
        return {"unsafe_detected": False, "matched_patterns": []}

    matches = [p.pattern for p in _UNSAFE_REGEXES if p.search(text)]
    return {"unsafe_detected": len(matches) > 0, "matched_patterns": matches}


def grounding_check(response_text: str, retrieved_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Heuristic grounding check: verifies that (a) evidence was retrieved at
    all, and (b) the retrieved evidence has a reasonable similarity score.
    A true grounding check would require NLI/entailment between the answer
    and the source text -- out of scope for this prototype, and we say so.
    """
    if not retrieved_chunks:
        return {
            "grounded": False,
            "reason": "No supporting evidence was retrieved from the knowledge base.",
            "best_similarity": 0.0,
        }

    best_similarity = max(c.get("similarity", 0.0) for c in retrieved_chunks)

    if best_similarity >= config.EVIDENCE_STRONG_THRESHOLD:
        return {
            "grounded": True,
            "reason": "Response is supported by retrieved evidence with strong similarity.",
            "best_similarity": best_similarity,
        }
    elif best_similarity >= config.EVIDENCE_WEAK_THRESHOLD:
        return {
            "grounded": True,
            "reason": "Response is loosely supported by retrieved evidence (moderate similarity).",
            "best_similarity": best_similarity,
        }
    else:
        return {
            "grounded": False,
            "reason": "Retrieved evidence has low similarity to the query; grounding is weak.",
            "best_similarity": best_similarity,
        }


def requires_human_review(
    grounding_result: Dict[str, Any],
    unsafe_result: Dict[str, Any],
    agent_decision: str,
    retrieved_chunks: List[Dict[str, Any]],
) -> bool:
    """
    Flags a response for mandatory human review if any of the following hold:
    - no useful evidence was retrieved,
    - unsafe instruction patterns were detected,
    - the response is not well grounded,
    - the agent could not confidently decide on an action.
    """
    if unsafe_result.get("unsafe_detected"):
        return True
    if not grounding_result.get("grounded", False):
        return True
    if not retrieved_chunks and agent_decision == "RETRIEVE":
        return True
    if agent_decision == "CLARIFY":
        return True
    return False


def safety_check(
    user_query: str,
    response_text: str,
    retrieved_chunks: List[Dict[str, Any]],
    agent_decision: str,
) -> Dict[str, Any]:
    """
    Runs the full Responsible-AI validation pipeline and returns a single
    result dict that the UI and audit logger can consume directly.
    """
    query_safety = unsafe_content_check(user_query)
    response_safety = unsafe_content_check(response_text)
    grounding = grounding_check(response_text, retrieved_chunks)

    unsafe_detected = query_safety["unsafe_detected"] or response_safety["unsafe_detected"]
    unsafe_result = {
        "unsafe_detected": unsafe_detected,
        "matched_patterns": list(
            set(query_safety["matched_patterns"] + response_safety["matched_patterns"])
        ),
    }

    human_review = requires_human_review(grounding, unsafe_result, agent_decision, retrieved_chunks)

    evidence_strength = evidence_strength_label(grounding["best_similarity"], bool(retrieved_chunks))

    return {
        "grounding": grounding,
        "unsafe": unsafe_result,
        "human_review_required": human_review,
        "evidence_strength": evidence_strength,
        "disclaimer": (
            "These are prototype safeguards based on simple heuristics and retrieval "
            "similarity. They do not guarantee correctness, safety, or the absence of "
            "hallucination. Always apply qualified human judgment before acting on "
            "industrial equipment."
        ),
    }


def evidence_strength_label(best_similarity: float, has_chunks: bool) -> str:
    """
    Maps retrieval similarity to a plain-language 'Evidence Strength' label.
    This is explicitly NOT a calibrated probability of diagnostic correctness.
    """
    if not has_chunks:
        return "No evidence retrieved"
    if best_similarity >= config.EVIDENCE_STRONG_THRESHOLD:
        return "Strong evidence"
    if best_similarity >= config.EVIDENCE_WEAK_THRESHOLD:
        return "Moderate evidence"
    return "Low evidence strength — human verification recommended"

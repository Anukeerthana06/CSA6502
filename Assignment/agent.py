"""
agent.py
--------
A transparent, rule-based agent that decides how to handle a user query.

Actions:
    RETRIEVE - pull technical knowledge from the RAG knowledge base
    TOOL     - invoke the maintenance-schedule calculator
    CLARIFY  - ask the user for more information

The decision logic is intentionally simple and inspectable (no hidden
chain-of-thought is exposed) so it can be explained in a college
evaluation. Only a short, human-readable trace is produced.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import config

# Patterns suggesting the user wants a maintenance-interval / schedule
# calculation rather than a diagnostic lookup.
_TOOL_PATTERNS = [
    r"\bhow many hours\b.*\b(until|before|left)\b",
    r"\bnext maintenance\b",
    r"\bwhen should\b.*\b(service|maintain|maintenance)\b",
    r"\bremaining hours\b",
    r"\b(\d+)\s*(operating\s*)?hours?\b.*\binterval\b",
    r"\binterval\b.*\b(\d+)\s*(operating\s*)?hours?\b",
    r"\bcalculate\b.*\bmaintenance\b",
]
_TOOL_REGEXES = [re.compile(p, re.IGNORECASE) for p in _TOOL_PATTERNS]

# Numbers embedded in the query, used to auto-populate the calculator
_NUMBER_PATTERN = re.compile(r"(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)?", re.IGNORECASE)

_TECHNICAL_KEYWORDS = [
    "overheat", "hot", "temperature", "vibrat", "bearing", "lubrica",
    "noise", "leak", "electrical", "fault", "trip", "motor", "pump",
    "seal", "alignment", "imbalance", "cavitation", "inspection",
    "corrosion", "smell", "spark", "current", "voltage",
]


@dataclass
class AgentDecision:
    action: str                      # "RETRIEVE" | "TOOL" | "CLARIFY"
    reason: str
    trace: str
    tool_result: Optional[Dict[str, Any]] = None
    clarification_question: Optional[str] = None
    extracted_numbers: List[float] = field(default_factory=list)


class SimpleAgent:
    """Rule-based agent -- no hidden reasoning, fully inspectable logic."""

    def decide(self, query: str) -> AgentDecision:
        query = (query or "").strip()

        if not query:
            return AgentDecision(
                action="CLARIFY",
                reason="No query text was provided.",
                trace="CLARIFY selected because no query text was supplied.",
                clarification_question=self._clarification_question(query),
            )

        # 1) Check for a maintenance-calculation intent first, since it's
        #    the most specific case.
        if any(rx.search(query) for rx in _TOOL_REGEXES):
            numbers = [float(n) for n in _NUMBER_PATTERN.findall(query)]
            return AgentDecision(
                action="TOOL",
                reason="The query requires a maintenance-schedule calculation.",
                trace="TOOL selected because the query asks about remaining/next "
                      "maintenance hours relative to an interval.",
                extracted_numbers=numbers,
            )

        # 2) Check whether the query is substantive enough / technical
        #    enough to warrant a knowledge-base lookup.
        word_count = len(query.split())
        has_technical_term = any(kw in query.lower() for kw in _TECHNICAL_KEYWORDS)

        if word_count < 3 or (word_count < 6 and not has_technical_term):
            return AgentDecision(
                action="CLARIFY",
                reason="Insufficient technical information in the query.",
                trace="CLARIFY selected because the query is too short or lacks "
                      "specific technical detail to retrieve a useful answer.",
                clarification_question=self._clarification_question(query),
            )

        # 3) Default: retrieve technical knowledge from manuals/SOPs.
        return AgentDecision(
            action="RETRIEVE",
            reason="Technical knowledge from manuals/SOPs is required to answer this query.",
            trace="RETRIEVE selected because the query requires information from "
                  "the technical knowledge base.",
        )

    @staticmethod
    def _clarification_question(query: str) -> str:
        return (
            "Could you provide more detail about the equipment symptom "
            "(e.g. temperature, vibration, noise, or smell), how long it has "
            "been running, and any recent maintenance performed? This helps "
            "retrieve the most relevant technical guidance."
        )


# ----------------------------------------------------------------------
# Tool: maintenance schedule calculator
# ----------------------------------------------------------------------
def calculate_maintenance_schedule(current_hours: float, interval_hours: float) -> Dict[str, Any]:
    """
    Given current operating hours and a maintenance interval, returns how
    many hours remain until the next maintenance is due (can be negative
    if maintenance is already overdue).

    Example: current_hours=1200, interval_hours=500 -> next due at 1500,
    remaining = 300.
    """
    if interval_hours <= 0:
        return {
            "ok": False,
            "message": "Maintenance interval must be a positive number of hours.",
        }
    if current_hours < 0:
        return {
            "ok": False,
            "message": "Current operating hours cannot be negative.",
        }

    cycles_completed = int(current_hours // interval_hours)
    next_due_at = (cycles_completed + 1) * interval_hours
    remaining_hours = next_due_at - current_hours

    # If current_hours lands exactly on an interval boundary, maintenance
    # is due right now (remaining_hours would otherwise roll forward to
    # the *next* cycle, hiding the fact that service is due immediately).
    if current_hours > 0 and current_hours % interval_hours == 0:
        next_due_at = current_hours
        remaining_hours = 0.0

    overdue = remaining_hours <= 0

    return {
        "ok": True,
        "current_hours": current_hours,
        "interval_hours": interval_hours,
        "next_due_at_hours": next_due_at,
        "remaining_hours": round(remaining_hours, 2),
        "overdue": overdue,
        "message": (
            f"Next maintenance due in {round(remaining_hours, 2)} operating hours "
            f"(at {next_due_at} total operating hours)."
            if not overdue
            else f"Maintenance is overdue by {abs(round(remaining_hours, 2))} operating hours."
        ),
    }

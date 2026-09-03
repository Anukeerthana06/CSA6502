"""
test_agent.py
-------------
Tests for the SimpleAgent decision logic and the maintenance calculator tool.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from agent import SimpleAgent, calculate_maintenance_schedule


def test_agent_retrieve_on_technical_query():
    agent = SimpleAgent()
    decision = agent.decide("Why is my motor overheating after 30 minutes of operation?")
    assert decision.action == "RETRIEVE"


def test_agent_tool_on_maintenance_calculation_query():
    agent = SimpleAgent()
    decision = agent.decide(
        "When should the motor be serviced after 1000 operating hours if the interval is 500 hours?"
    )
    assert decision.action == "TOOL"
    assert 1000.0 in decision.extracted_numbers
    assert 500.0 in decision.extracted_numbers


def test_agent_clarify_on_short_ambiguous_query():
    agent = SimpleAgent()
    decision = agent.decide("Motor problem")
    assert decision.action == "CLARIFY"
    assert decision.clarification_question is not None


def test_agent_clarify_on_empty_query():
    agent = SimpleAgent()
    decision = agent.decide("")
    assert decision.action == "CLARIFY"


def test_maintenance_calculator_basic():
    result = calculate_maintenance_schedule(1200, 500)
    assert result["ok"] is True
    assert result["remaining_hours"] == 300
    assert result["overdue"] is False


def test_maintenance_calculator_example_from_spec():
    result = calculate_maintenance_schedule(1200, 500)
    assert "300" in result["message"]


def test_maintenance_calculator_overdue():
    # Exactly on an interval boundary means maintenance is due right now.
    result = calculate_maintenance_schedule(1500, 500)
    assert result["ok"] is True
    assert result["overdue"] is True
    assert result["remaining_hours"] == 0


def test_maintenance_calculator_invalid_interval():
    result = calculate_maintenance_schedule(100, 0)
    assert result["ok"] is False

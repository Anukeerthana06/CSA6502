"""
audit_logger.py
----------------
Append-only JSONL audit logging for every diagnosis request.

Design notes:
- We log metadata about uploaded media (filename, type, size, and derived
  text like transcription/caption) rather than the raw image/audio bytes,
  per the data-minimization requirement in the project spec.
- Each call appends a single JSON object as one line to logs/audit_log.jsonl.
- Reading is done lazily (only when the Audit Log tab is opened) so normal
  request handling never pays the cost of loading the whole file.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import config


def log_event(
    session_id: str,
    user_query: str,
    speech_transcription: Optional[str],
    image_observation: Optional[str],
    agent_decision: str,
    agent_reason: str,
    retrieved_sources: List[Dict[str, Any]],
    generated_response: str,
    safety_result: Dict[str, Any],
    grounding_result: Dict[str, Any],
    human_review_required: bool,
    processing_time_ms: float,
) -> Dict[str, Any]:
    """Builds and appends one audit record. Returns the record written."""

    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "session_id": session_id,
        "user_query": user_query,
        "speech_transcription": speech_transcription,
        "image_observation": image_observation,
        "agent_decision": agent_decision,
        "agent_reason": agent_reason,
        "retrieved_sources": [
            {
                "source": s.get("source"),
                "chunk_id": s.get("chunk_id"),
                "similarity": s.get("similarity"),
            }
            for s in retrieved_sources
        ],
        "generated_response_preview": (generated_response or "")[:500],
        "safety_result": safety_result,
        "grounding_result": grounding_result,
        "human_review_required": human_review_required,
        "processing_time_ms": processing_time_ms,
    }

    config.AUDIT_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(config.AUDIT_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")

    return record


def read_recent_events(limit: int = 20) -> List[Dict[str, Any]]:
    """Returns the most recent `limit` audit records, newest first."""
    path: Path = config.AUDIT_LOG_PATH
    if not path.exists():
        return []

    records: List[Dict[str, Any]] = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError:
                continue

    records.reverse()
    return records[:limit]


def count_events() -> int:
    path: Path = config.AUDIT_LOG_PATH
    if not path.exists():
        return 0
    with open(path, "r", encoding="utf-8") as f:
        return sum(1 for line in f if line.strip())

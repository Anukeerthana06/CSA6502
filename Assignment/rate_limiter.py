"""
rate_limiter.py
----------------
A simple, in-memory, session-based sliding-window rate limiter.

Suitable for a single-process Streamlit demo only. It keeps a list of
request timestamps per session id and rejects requests once the count
inside the configured time window exceeds the limit.

IMPORTANT: This is a prototype safeguard. A real deployment needs
server-side, multi-process-safe rate limiting (e.g. Redis-backed,
per-IP and per-account), especially behind a load balancer.
"""

import time
from collections import defaultdict
from typing import Dict, List

import config

# session_id -> list of request unix timestamps
_REQUEST_LOG: Dict[str, List[float]] = defaultdict(list)


def _prune(session_id: str, now: float) -> None:
    window_start = now - config.RATE_LIMIT_WINDOW_SECONDS
    _REQUEST_LOG[session_id] = [t for t in _REQUEST_LOG[session_id] if t >= window_start]


def check_and_record(session_id: str) -> bool:
    """
    Records a new request for this session and returns True if it is
    allowed, False if the session has exceeded the rate limit.
    """
    now = time.time()
    _prune(session_id, now)

    if len(_REQUEST_LOG[session_id]) >= config.RATE_LIMIT_MAX_REQUESTS:
        return False

    _REQUEST_LOG[session_id].append(now)
    return True


def remaining_requests(session_id: str) -> int:
    now = time.time()
    _prune(session_id, now)
    return max(0, config.RATE_LIMIT_MAX_REQUESTS - len(_REQUEST_LOG[session_id]))


def seconds_until_reset(session_id: str) -> int:
    now = time.time()
    _prune(session_id, now)
    if not _REQUEST_LOG[session_id]:
        return 0
    oldest = min(_REQUEST_LOG[session_id])
    reset_at = oldest + config.RATE_LIMIT_WINDOW_SECONDS
    return max(0, int(reset_at - now))

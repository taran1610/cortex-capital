"""Shared LangGraph state for the Cortex Capital swarm."""

from __future__ import annotations

from typing import Annotated, Any

import operator
from typing_extensions import TypedDict


class CortexState(TypedDict, total=False):
    """End-to-end state: research → debate (+ Dexter) → trader → risk → PM."""

    ticker: str

    # Research bundle (OpenBB + Crucix)
    research_bundle: dict[str, Any]
    macro: dict[str, Any]

    # Multi-agent debate (18 legendary personas, batched)
    debate_rounds: list[dict[str, Any]]
    debate_synthesis: dict[str, Any]

    # Dexter-style reflection (critique → revised thesis); mirrors dexter agent loop
    dexter_critique: str
    dexter_revision: str

    trader_proposal: dict[str, Any]
    risk_assessment: dict[str, Any]
    portfolio_decision: dict[str, Any]

    # Human / UI facing string (JSON or prose); dashboard parses JSON when possible
    decision: str

    # Audit log lines
    log: Annotated[list[str], operator.add]

    # Similar past decisions (from memory)
    memory_hits: list[dict[str, Any]]


def log_line(state: CortexState, message: str) -> CortexState:
    return {"log": [message]}

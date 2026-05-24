"""
FastAPI control layer — thin triggers over the modular kernel + LangGraph swarm.

Run:
  cd python && uvicorn api.app:app --reload --host 0.0.0.0 --port 8800

Next.js (web/) proxies to this API via POST /api/swarm when "Real LLM mode" is on.
"""

from __future__ import annotations

import importlib.util
import os
import re
import sys
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from cortex.orchestrator import run  # noqa: E402
from api.serialize_swarm import swarm_state_for_api  # noqa: E402

app = FastAPI(title="Cortex Capital API", version="0.1.0")


def _cors_config() -> tuple[list[str], str | None]:
    """
    Production: set CORTEX_ALLOWED_ORIGINS=https://your-app.vercel.app,https://www.yourdomain.com
    (comma-separated). When set, regex matching is disabled. When unset, local dev + *.vercel.app regex.
    """
    raw = (os.getenv("CORTEX_ALLOWED_ORIGINS") or "").strip()
    if raw:
        origins = [o.strip() for o in raw.split(",") if o.strip()]
        return origins, None
    return (
        ["http://localhost:3000", "http://127.0.0.1:3000"],
        r"https://.*\.vercel\.app",
    )


_origins, _origin_regex = _cors_config()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=_origin_regex,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _integrations_meta() -> dict[str, Any]:
    """Documents how upstream repos map into this monorepo (for dashboard meta)."""
    ta: dict[str, Any] = {
        "path": "python/tradingagents/",
        "note": (
            "TauricResearch/TradingAgents-style graph lives here; the default "
            "`/swarm/run` path uses `python/graph` (lighter) instead of invoking "
            "TradingAgentsGraph end-to-end to avoid duplicate LLM spend."
        ),
    }
    spec = importlib.util.find_spec("tradingagents")
    ta["import_ok"] = spec is not None
    if spec is None:
        ta["import_error"] = "tradingagents package not importable on PYTHONPATH"

    return {
        "repos": {
            "cortex_langgraph": {
                "path": "python/graph/workflow.py",
                "description": (
                    "Primary swarm: OpenBB researcher → 18 ai-hedge-fund personas (batched) "
                    "→ Dexter-style critique/revision → trader → risk → PM → SQLite memory."
                ),
            },
            "virattt_ai_hedge_fund": {
                "path": "python/graph/legendary_agents.py",
                "description": "Persona names/styles forked from virattt/ai-hedge-fund analyst roster.",
            },
            "virattt_dexter": {
                "path": "python/graph/nodes.py (debater_node)",
                "description": "Reflection loop (critic + revised JSON thesis) mirroring Dexter deep-research agents.",
            },
            "tauric_tradingagents": ta,
            "666ghj_mirofish": {
                "note": (
                    "MiroFish is not vendored; the Next.js swarm dashboard takes inspiration "
                    "from multi-agent simulation UX patterns described in that project."
                ),
            },
            "virattt_embedded_hedge_web": {
                "path": "python/agents/virattt/",
                "description": (
                    "Optional standalone FastAPI + React hedge-fund UI from virattt; "
                    "run that stack separately (see its README) — not wired to this route."
                ),
            },
        },
        "kernel": (
            "GET|POST /run/kernel — synchronous cortex kernel (OpenBB/yfinance data → RSI → risk → "
            "mock or IBKR per CORTEX_EXECUTION_BACKEND)."
        ),
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/swarm/integrations")
def swarm_integrations() -> dict[str, Any]:
    """Static map of how external research repos connect to this codebase."""
    return _integrations_meta()


_TICKER_RE = re.compile(r"^[A-Z0-9=\.\-]{1,20}$", re.I)


class SwarmRunRequest(BaseModel):
    ticker: str = Field(default="SPY", min_length=1, max_length=20)


@app.post("/swarm/run")
def swarm_run(req: SwarmRunRequest) -> dict[str, Any]:
    """
    Run the full LangGraph swarm for one ticker (LLM + OpenBB + Crucix).
    JSON-safe payload for the Next.js dashboard.
    """
    raw = req.ticker.strip().upper()
    if not _TICKER_RE.match(raw):
        raise HTTPException(status_code=400, detail="Invalid ticker format")

    from graph.workflow import run_swarm  # noqa: WPS433 — runtime import after path fix

    try:
        state = run_swarm(raw)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"run_swarm failed: {exc}") from exc

    payload = swarm_state_for_api(dict(state))
    return {
        "ok": True,
        "ticker": raw,
        "state": payload,
        "meta": _integrations_meta(),
    }


def _validate_execution(execution: str | None) -> str | None:
    if execution is None or execution == "":
        return None
    e = execution.strip().lower()
    if e not in ("mock", "ibkr"):
        raise HTTPException(
            status_code=400,
            detail="execution must be mock or ibkr",
        )
    return e


@app.post("/run/kernel")
def run_kernel(
    symbol: str = "GC=F",
    period: str = "3mo",
    execution: str | None = None,
) -> dict:
    """Execute one Phase-1 kernel pass (data → RSI → risk → broker → log)."""
    result = run(symbol=symbol, period=period, execution_backend=_validate_execution(execution))
    return {"result": result}


@app.get("/run/kernel")
def run_kernel_get(
    symbol: str = "GC=F",
    period: str = "3mo",
    execution: str | None = None,
) -> dict:
    """GET variant for quick browser tests."""
    result = run(symbol=symbol, period=period, execution_backend=_validate_execution(execution))
    return {"result": result}

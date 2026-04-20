"""
LangGraph nodes: researcher, multi-agent debate (+ Dexter reflection), trader,
risk manager, portfolio manager, memory persist.
"""

from __future__ import annotations

import json
import math
from typing import Any

import pandas as pd

from graph.legendary_agents import debate_agent_batches, persona_blocks_for_prompt
from graph.llm_client import chat_completion, chat_json
from graph.state import CortexState
from cortex_tools.crucix_bridge import get_macro_signals
from cortex_tools.memory_store import DecisionMemory
from cortex_tools.openbb_tools import build_research_bundle, price_summary_for_llm


def researcher_node(state: CortexState) -> CortexState:
    ticker = state["ticker"].upper()
    bundle = build_research_bundle(ticker)
    macro = get_macro_signals()
    return {
        "research_bundle": bundle,
        "macro": macro,
        "log": [f"researcher: OpenBB bundle + Crucix macro for {ticker}"],
    }


def _annualized_vol(df: pd.DataFrame) -> float:
    if df is None or df.empty or "close" not in df.columns:
        return 0.25
    r = df["close"].astype(float).pct_change().dropna()
    if r.empty:
        return 0.25
    return float(r.std() * math.sqrt(252))


def debater_node(state: CortexState) -> CortexState:
    """
    Simulates the 18 virattt/ai-hedge-fund personas in batched debate rounds, then
    runs a Dexter-style reflection loop (critique → revised synthesis).
    """
    ticker = state["ticker"].upper()
    bundle = state.get("research_bundle") or {}
    macro = state.get("macro") or {}
    px_summary = price_summary_for_llm(bundle)

    filings = bundle.get("filings") or {}
    fund = bundle.get("fundamentals") or {}
    earn = bundle.get("earnings") or {}

    rounds: list[dict[str, Any]] = []
    for i, batch_keys in enumerate(debate_agent_batches(6)):
        block = persona_blocks_for_prompt(batch_keys)
        sys = (
            "You are orchestrating an internal investment committee. Each listed persona "
            "must vote BUY, HOLD, or SELL for the single ticker, with confidence 0-100 and "
            "one-sentence rationale. Output JSON: "
            '{"votes":[{"persona_key":str,"stance":"BUY|HOLD|SELL","confidence":int,"reason":str}, ...]}'
        )
        user = (
            f"Ticker: {ticker}\n\n"
            f"## Price history (recent)\n{px_summary}\n\n"
            f"## Fundamentals snapshot (may be partial)\n{json.dumps(fund, default=str)[:6000]}\n\n"
            f"## Filings index (may be partial)\n{json.dumps(filings, default=str)[:4000]}\n\n"
            f"## Earnings context\n{json.dumps(earn, default=str)[:4000]}\n\n"
            f"## Macro / OSINT (Crucix)\n{json.dumps(macro, default=str)[:4000]}\n\n"
            f"## Personas for this round\n{block}"
        )
        try:
            parsed = chat_json(sys, user, temperature=0.35)
            votes = parsed.get("votes") or []
        except Exception as exc:
            votes = [{"persona_key": "error", "stance": "HOLD", "confidence": 0, "reason": str(exc)}]
        rounds.append({"batch": i, "keys": batch_keys, "votes": votes})

    tally = {"BUY": 0, "HOLD": 0, "SELL": 0, "weights": {"BUY": 0.0, "HOLD": 0.0, "SELL": 0.0}}
    for rnd in rounds:
        for v in rnd.get("votes") or []:
            st = str(v.get("stance", "HOLD")).upper()
            if st not in tally:
                st = "HOLD"
            conf = float(v.get("confidence") or 0)
            tally[st] += 1
            tally["weights"][st] += max(conf, 1.0)

    syn_sys = (
        "You synthesize multi-agent debate into a JSON object with keys: "
        "thesis (string), key_bull_points (array of string), key_bear_points (array), "
        "consensus (BUY|HOLD|SELL), consensus_confidence (0-100), "
        "dissent (string summarizing strongest counter-case)."
    )
    syn_user = f"Ticker {ticker}.\nDebate rounds JSON:\n{json.dumps(rounds, default=str)[:12000]}"
    try:
        synthesis = chat_json(syn_sys, syn_user, temperature=0.25)
    except Exception as exc:
        synthesis = {
            "thesis": "Debate synthesis failed; defaulting to defensive stance.",
            "key_bull_points": [],
            "key_bear_points": [str(exc)],
            "consensus": "HOLD",
            "consensus_confidence": 40,
            "dissent": "",
        }

    # Dexter-style reflection: critic then revision (mirrors deep-research reflection loops)
    crit_sys = (
        "You are Dexter-style critic: find logical gaps, data issues, and missing checks "
        "in an equity thesis. Be concise, actionable, no flattery."
    )
    crit_user = (
        f"Ticker {ticker}.\nSynthesis:\n{json.dumps(synthesis, default=str)[:8000]}\n"
        f"Evidence snippets:\nPX:\n{px_summary[:2500]}\nMACRO:\n{json.dumps(macro, default=str)[:2500]}"
    )
    critique = chat_completion(crit_sys, crit_user, temperature=0.3, max_tokens=900)

    rev_sys = (
        "Revise the investment synthesis incorporating the critique. Output JSON only with keys: "
        "thesis, key_bull_points, key_bear_points, consensus (BUY|HOLD|SELL), "
        "consensus_confidence (0-100), dissent."
    )
    rev_user = (
        f"Original synthesis:\n{json.dumps(synthesis, default=str)}\n\n"
        f"Critique:\n{critique}"
    )
    try:
        revision = chat_json(rev_sys, rev_user, temperature=0.2)
    except Exception:
        revision = synthesis

    return {
        "debate_rounds": rounds,
        "debate_synthesis": {"initial": synthesis, "critique": critique, "revised": revision},
        "dexter_critique": critique,
        "dexter_revision": json.dumps(revision),
        "log": [f"debater: 18-persona batched debate + Dexter reflection for {ticker}"],
    }


def trader_node(state: CortexState) -> CortexState:
    ticker = state["ticker"].upper()
    revision = {}
    ds = state.get("debate_synthesis") or {}
    if isinstance(ds, dict):
        revision = ds.get("revised") or ds.get("initial") or {}
    macro = state.get("macro") or {}
    bundle = state.get("research_bundle") or {}
    sys = (
        "You are the execution trader for an AI-native hedge fund. "
        "Return JSON keys: action (BUY|HOLD|SELL), confidence (0-100), "
        "time_horizon_days (int), catalysts (array of string), "
        "execution_notes (string), invalidation (string — what would flip the view)."
    )
    user = (
        f"Ticker: {ticker}\n"
        f"Debate synthesis:\n{json.dumps(revision, default=str)[:8000]}\n"
        f"Macro:\n{json.dumps(macro, default=str)[:4000]}\n"
        f"Price summary:\n{price_summary_for_llm(bundle)[:3500]}"
    )
    try:
        proposal = chat_json(sys, user, temperature=0.2)
    except Exception as exc:
        proposal = {
            "action": "HOLD",
            "confidence": 35,
            "time_horizon_days": 20,
            "catalysts": [],
            "execution_notes": f"LLM JSON failure, holding flat: {exc}",
            "invalidation": "n/a",
        }
    return {
        "trader_proposal": proposal,
        "log": [f"trader: proposed {proposal.get('action')} @ {proposal.get('confidence')}"],
    }


def risk_manager_node(state: CortexState) -> CortexState:
    ticker = state["ticker"].upper()
    proposal = state.get("trader_proposal") or {}
    action = str(proposal.get("action", "HOLD")).upper()
    conf = float(proposal.get("confidence") or 0)
    bundle = state.get("research_bundle") or {}
    px = bundle.get("price_frame")
    vol = _annualized_vol(px) if isinstance(px, pd.DataFrame) else 0.3
    macro = state.get("macro") or {}
    stress = False
    status = str(macro.get("status", "")).lower()
    if "offline" not in status and macro.get("macro"):
        mg = macro.get("macro")
        if isinstance(mg, dict) and mg:
            # Heuristic: many gauges spiking to "high" strings — downgrade risk appetite
            blob = json.dumps(mg).lower()
            stress = any(k in blob for k in ("severe", "critical", "red", "alert", "conflict"))

    approved = True
    notes: list[str] = []
    if vol > 0.55:
        conf *= 0.85
        notes.append("Elevated realized vol — confidence haircut.")
    if stress:
        if action == "BUY":
            action = "HOLD"
            conf = min(conf, 55.0)
            notes.append("Macro stress overlay — blocked fresh BUY risk.")
        else:
            notes.append("Macro stress overlay noted.")
    if conf < 38 and action == "BUY":
        action = "HOLD"
        notes.append("Low confidence — trader BUY not risk-approved.")

    assessment = {
        "approved": approved,
        "adjusted_action": action,
        "adjusted_confidence": round(conf, 2),
        "annualized_vol": round(vol, 4),
        "macro_stress_flag": stress,
        "notes": notes,
    }
    adj = dict(proposal)
    adj["action"] = action
    adj["confidence"] = conf
    return {
        "risk_assessment": assessment,
        "trader_proposal": adj,
        "log": [f"risk_manager: vol={vol:.2f} action->{action} conf->{conf:.1f}"],
    }


def portfolio_manager_node(state: CortexState) -> CortexState:
    """Final structured decision for UI, IBKR hooks, and SQLite memory."""
    ticker = state["ticker"].upper()
    proposal = state.get("trader_proposal") or {}
    risk = state.get("risk_assessment") or {}
    macro = state.get("macro") or {}
    ds = state.get("debate_synthesis") or {}

    sys = (
        "You are the portfolio manager. Merge risk-adjusted trader action with committee "
        "synthesis. Output JSON keys: "
        "action (BUY|HOLD|SELL), confidence (0-100), reasoning (string), "
        "recommendation (same as action for dashboards), "
        "horizon_days (int), risks (array of string), "
        "yc_hook (one sentence on why an AI-native process matters for this name)."
    )
    user = (
        f"Ticker {ticker}\n"
        f"Trader+risk proposal:\n{json.dumps(proposal, default=str)}\n"
        f"Risk:\n{json.dumps(risk, default=str)}\n"
        f"Debate:\n{json.dumps(ds, default=str)[:6000]}\n"
        f"Macro snapshot:\n{json.dumps(macro, default=str)[:3500]}"
    )
    try:
        final = chat_json(sys, user, temperature=0.15)
    except Exception as exc:
        final = {
            "action": proposal.get("action", "HOLD"),
            "confidence": proposal.get("confidence", 40),
            "reasoning": f"PM JSON fallback: {exc}",
            "recommendation": proposal.get("action", "HOLD"),
            "horizon_days": int(proposal.get("time_horizon_days", 20) or 20),
            "risks": ["Model JSON failure — defaulting to prior stage output."],
            "yc_hook": "Agents + structured macro context compress weeks of desk work into minutes.",
        }

    action = str(final.get("action", "HOLD")).upper()
    if action not in ("BUY", "HOLD", "SELL"):
        action = "HOLD"
    final["action"] = action
    final["recommendation"] = final.get("recommendation", action)
    out_str = json.dumps(final, indent=2)
    return {
        "portfolio_decision": final,
        "decision": out_str,
        "log": [f"portfolio_manager: final {action} @ {final.get('confidence')}"],
    }


def memory_node(state: CortexState) -> CortexState:
    mem = DecisionMemory()
    try:
        pd_obj = state.get("portfolio_decision") or {}
        mem.save(
            ticker=state["ticker"],
            portfolio_decision=pd_obj,
            full_state_snapshot={
                "macro_status": (state.get("macro") or {}).get("status"),
                "debate_consensus": (state.get("debate_synthesis") or {})
                .get("revised", {})
                .get("consensus"),
            },
        )
        hits = mem.recent_similar(state["ticker"], limit=5)
    finally:
        mem.close()
    return {
        "memory_hits": hits,
        "log": ["memory: persisted decision + pulled recent similar rows"],
    }

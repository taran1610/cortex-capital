"""Compile the LangGraph swarm."""

from __future__ import annotations

from langgraph.graph import END, StateGraph

from graph.nodes import (
    debater_node,
    memory_node,
    portfolio_manager_node,
    researcher_node,
    risk_manager_node,
    trader_node,
)
from graph.state import CortexState


def build_app():
    g = StateGraph(CortexState)
    g.add_node("researcher", researcher_node)
    g.add_node("debater", debater_node)
    g.add_node("trader", trader_node)
    g.add_node("risk_manager", risk_manager_node)
    g.add_node("portfolio_manager", portfolio_manager_node)
    g.add_node("memory", memory_node)

    g.set_entry_point("researcher")
    g.add_edge("researcher", "debater")
    g.add_edge("debater", "trader")
    g.add_edge("trader", "risk_manager")
    g.add_edge("risk_manager", "portfolio_manager")
    g.add_edge("portfolio_manager", "memory")
    g.add_edge("memory", END)
    return g.compile()


_APP = None


def get_compiled_graph():
    global _APP
    if _APP is None:
        _APP = build_app()
    return _APP


def run_swarm(ticker: str) -> CortexState:
    """Run full graph for one ticker (used by CLI + Streamlit)."""
    app = get_compiled_graph()
    return app.invoke(
        {
            "ticker": ticker.strip().upper(),
            "log": [],
        }
    )

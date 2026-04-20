"""
Premium dashboard helpers: demo series, sparklines, institutional charts.

Keeps dashboard/app.py readable; safe to import without Streamlit.
"""

from __future__ import annotations

import json
import random
from typing import Any, Optional

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Design tokens (Stripe-adjacent dark + electric cyan)
BG = "#0F1117"
PANEL = "#1A1F2E"
BORDER = "rgba(255,255,255,0.08)"
ACCENT = "#00F0FF"
ACCENT_DIM = "rgba(0, 240, 255, 0.35)"
TEXT = "#E6EAF2"
TEXT_MUTED = "#8B95A8"
POS = "#34D399"
NEG = "#F87171"
WARN = "#FBBF24"

SPARK_CONFIG = {
    "displayModeBar": False,
    "staticPlot": False,
    "responsive": True,
}


def _rng(seed: int = 42) -> random.Random:
    return random.Random(seed)


def demo_sparkline_values(seed: int = 0, n: int = 24) -> list[float]:
    r = _rng(42 + seed)
    v = 100.0
    out = []
    for _ in range(n):
        v *= 1.0 + r.uniform(-0.018, 0.022)
        out.append(round(v, 2))
    return out


def fig_sparkline(values: list[float], *, color: str = ACCENT, height: int = 56) -> go.Figure:
    x = list(range(len(values)))
    fig = go.Figure()
    fig.add_trace(
        go.Scatter(
            x=x,
            y=values,
            mode="lines",
            line=dict(color=color, width=1.8, shape="spline"),
            fill="tozeroy",
            fillcolor=f"rgba(0, 240, 255, 0.08)",
            hoverinfo="skip",
        )
    )
    fig.update_layout(
        margin=dict(l=0, r=0, t=0, b=0),
        height=height,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        xaxis=dict(visible=False, showgrid=False),
        yaxis=dict(visible=False, showgrid=False),
        showlegend=False,
    )
    return fig


def fig_metric_sparkline(seed: int) -> go.Figure:
    return fig_sparkline(demo_sparkline_values(seed=seed), height=52)


def demo_hero_metrics() -> dict[str, dict[str, Any]]:
    return {
        "capacity": {
            "label": "Strategy capacity",
            "value": "$25.0M",
            "delta": "Target sleeve",
            "seed": 1,
            "color": ACCENT,
        },
        "ytd": {
            "label": "YTD (illustrative)",
            "value": "+12.4%",
            "delta": "vs. HFRX placeholder",
            "seed": 2,
            "color": POS,
        },
        "sharpe": {
            "label": "Sharpe (illustrative)",
            "value": "1.82",
            "delta": "Post-cost assumption",
            "seed": 3,
            "color": ACCENT,
        },
        "agents": {
            "label": "Agents online",
            "value": "18",
            "delta": "LangGraph swarm",
            "seed": 4,
            "color": ACCENT,
        },
    }


def demo_portfolio_allocation() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "sleeve": [
                "US mega-cap growth",
                "Macro / rates",
                "Commodities beta",
                "Cash & TBills",
            ],
            "weight": [42, 28, 15, 15],
        }
    )


def fig_allocation_donut(df: Optional[pd.DataFrame] = None) -> go.Figure:
    d = df if df is not None else demo_portfolio_allocation()
    fig = px.pie(
        d,
        names="sleeve",
        values="weight",
        hole=0.62,
        color_discrete_sequence=["#00F0FF", "#5B8DEF", "#A78BFA", "#64748B"],
    )
    fig.update_traces(
        textposition="outside",
        textinfo="percent+label",
        textfont=dict(size=11, color=TEXT),
        marker=dict(line=dict(color=BG, width=2)),
        hovertemplate="<b>%{label}</b><br>%{value}%<extra></extra>",
    )
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=20, r=20, t=28, b=20),
        height=320,
        showlegend=False,
        title=dict(
            text="Target allocation (demo book)",
            font=dict(size=13, color=TEXT_MUTED),
            x=0.5,
            xanchor="center",
        ),
        font=dict(family="Inter, ui-sans-serif, system-ui, sans-serif", color=TEXT),
    )
    return fig


def demo_risk_exposure_rows() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "Book": ["US equities", "Rates DV01", "Commodities", "FX", "Liquidity"],
            "Notional %": [42, 18, 12, 8, 20],
            "Stress (σ)": [-1.1, -0.6, 0.35, -0.2, 0.0],
            "Limit %": [50, 25, 20, 15, 25],
        }
    )


def macro_pulse_series(seed: int = 7, n: int = 30) -> tuple[list[int], list[float]]:
    """Synthetic macro pressure indices for sparklines when Crucix is offline."""
    r = _rng(seed)
    a, b = [], []
    va, vb = 0.45, 0.52
    for i in range(n):
        va = max(0.1, min(0.95, va + r.uniform(-0.04, 0.04)))
        vb = max(0.1, min(0.95, vb + r.uniform(-0.035, 0.035)))
        a.append(i)
        b.append(round((va + vb) / 2, 3))
    return a, b


def fig_macro_sparkline(title: str, color: str = ACCENT) -> go.Figure:
    x, y = macro_pulse_series(seed=hash(title) % 1000)
    fig = go.Figure()
    fig.add_trace(
        go.Scatter(
            x=x,
            y=y,
            mode="lines",
            line=dict(color=color, width=1.5),
            fill="tozeroy",
            fillcolor=f"rgba(0, 240, 255, 0.06)",
            hovertemplate="%{y:.2f}<extra></extra>",
        )
    )
    fig.update_layout(
        title=dict(text=title, font=dict(size=11, color=TEXT_MUTED), x=0, xanchor="left"),
        margin=dict(l=0, r=8, t=32, b=0),
        height=100,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        xaxis=dict(visible=False),
        yaxis=dict(visible=False, range=[0, 1]),
        showlegend=False,
        font=dict(family="Inter, ui-sans-serif, sans-serif"),
    )
    return fig


def parse_decision_payload(row: dict[str, Any]) -> str:
    try:
        p = json.loads(row.get("payload") or "{}")
        pdct = p.get("portfolio_decision") or {}
        return str(pdct.get("reasoning", ""))[:120]
    except Exception:
        return ""


def blended_decision_timeline(
    memory_rows: list[dict[str, Any]], *, demo_pad: int = 6
) -> list[dict[str, Any]]:
    """Merge SQLite rows with synthetic history so the feed never looks empty."""
    out: list[dict[str, Any]] = []
    for r in memory_rows:
        out.append(
            {
                "ts": r.get("ts", ""),
                "ticker": r.get("ticker", ""),
                "action": r.get("action", "HOLD"),
                "confidence": r.get("confidence", 0),
                "source": "live",
                "snippet": parse_decision_payload(r),
            }
        )
    if len(out) >= demo_pad:
        return out[:20]
    r = _rng(99)
    demos = ["NVDA", "SPY", "MSFT", "GLD", "TLT", "AAPL"]
    actions = ["BUY", "HOLD", "SELL", "HOLD", "BUY", "HOLD"]
    for i in range(demo_pad):
        out.append(
            {
                "ts": f"2026-03-{20-i:02d}T15:30:00+00:00",
                "ticker": demos[i % len(demos)],
                "action": actions[i % len(actions)],
                "confidence": round(40 + r.random() * 45, 0),
                "source": "demo",
                "snippet": "Illustrative prior pass — replace with production audit trail.",
            }
        )
    return out[:20]

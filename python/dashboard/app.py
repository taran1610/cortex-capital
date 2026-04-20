"""
Cortex Capital — institutional research console (Streamlit).

Premium UI: Stripe × Google Finance aesthetic. Run from python/:
  streamlit run dashboard/app.py
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from textwrap import dedent

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

os.chdir(_ROOT)

from backtester.backtest_runner import run_backtest  # noqa: E402
from cortex_tools.crucix_bridge import get_macro_signals  # noqa: E402
from cortex_tools.ibkr_tools import (  # noqa: E402
    account_summary_rows,
    connect_ib_paper,
    disconnect_safely,
    load_ibkr_config,
    paper_market_order,
)
from cortex_tools.memory_store import DecisionMemory  # noqa: E402
from cortex_tools.openbb_tools import get_price_history  # noqa: E402
from dashboard.ui_helpers import (  # noqa: E402
    ACCENT,
    BG,
    BORDER,
    NEG,
    PANEL,
    POS,
    SPARK_CONFIG,
    TEXT,
    TEXT_MUTED,
    WARN,
    blended_decision_timeline,
    demo_hero_metrics,
    demo_risk_exposure_rows,
    fig_allocation_donut,
    fig_macro_sparkline,
    fig_metric_sparkline,
)
from graph.workflow import run_swarm  # noqa: E402

POPULAR_TICKERS = [
    "NVDA",
    "AAPL",
    "MSFT",
    "GOOGL",
    "AMZN",
    "META",
    "TSLA",
    "SPY",
    "QQQ",
    "IWM",
    "GLD",
    "TLT",
    "AMD",
    "JPM",
    "XOM",
]

st.set_page_config(
    page_title="Cortex Capital",
    page_icon="◆",
    layout="wide",
    initial_sidebar_state="expanded",
)


def _premium_css() -> None:
    # IMPORTANT: do not indent this block in the source — Streamlit Markdown treats
    # 4+ space–indented lines as a code fence, which prints CSS as plain text on the page.
    st.markdown(
        dedent(
            f"""
            <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            html, body, [class*="css"] {{
              font-family: 'Inter', ui-sans-serif, system-ui, sans-serif !important;
            }}
            .stApp {{
              background: {BG};
              color: {TEXT};
            }}
            .block-container {{
              padding-top: 0.75rem;
              padding-bottom: 4rem;
              max-width: 1440px;
            }}
            #MainMenu {{visibility: hidden;}}
            footer {{visibility: hidden;}}
            header[data-testid="stHeader"] {{
              background: {BG};
              border-bottom: 1px solid {BORDER};
            }}
            [data-testid="stToolbar"] {{visibility: hidden;}}
            [data-testid="stDecoration"] {{display: none;}}

            .cc-nav {{
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 1.5rem;
              flex-wrap: wrap;
              padding: 0.85rem 0 1.1rem 0;
              border-bottom: 1px solid {BORDER};
              margin-bottom: 1.25rem;
            }}
            .cc-logo {{
              display: flex;
              flex-direction: column;
              gap: 0.15rem;
            }}
            .cc-logo-mark {{
              font-size: 1.35rem;
              font-weight: 700;
              letter-spacing: -0.03em;
              color: {TEXT};
            }}
            .cc-logo-sub {{
              font-size: 0.8125rem;
              color: {TEXT_MUTED};
              font-weight: 400;
            }}
            .cc-nav-right {{
              display: flex;
              align-items: center;
              gap: 1rem;
              flex-wrap: wrap;
            }}
            .cc-clock {{
              font-size: 0.8125rem;
              color: {TEXT_MUTED};
              font-variant-numeric: tabular-nums;
            }}
            .cc-live {{
              display: inline-flex;
              align-items: center;
              gap: 0.35rem;
              padding: 0.25rem 0.6rem;
              border-radius: 999px;
              font-size: 0.6875rem;
              font-weight: 600;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              border: 1px solid rgba(52, 211, 153, 0.35);
              color: {POS};
              background: rgba(52, 211, 153, 0.08);
            }}
            .cc-live.off {{
              border-color: {BORDER};
              color: {TEXT_MUTED};
              background: rgba(255,255,255,0.03);
            }}
            .cc-live-dot {{
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: {POS};
              animation: cc-pulse 1.8s ease-in-out infinite;
            }}
            .cc-live.off .cc-live-dot {{
              background: {TEXT_MUTED};
              animation: none;
            }}
            @keyframes cc-pulse {{
              0%, 100% {{ opacity: 1; transform: scale(1); }}
              50% {{ opacity: 0.45; transform: scale(0.92); }}
            }}

            .cc-hero-grid {{
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 0.75rem;
              margin-bottom: 1.25rem;
            }}
            @media (max-width: 1100px) {{
              .cc-hero-grid {{ grid-template-columns: repeat(2, 1fr); }}
            }}
            .cc-metric-card {{
              background: {PANEL};
              border: 1px solid {BORDER};
              border-radius: 10px;
              padding: 0.85rem 1rem 0.65rem 1rem;
              transition: border-color 0.2s ease, box-shadow 0.2s ease;
            }}
            .cc-metric-card:hover {{
              border-color: rgba(0, 240, 255, 0.22);
              box-shadow: 0 0 0 1px rgba(0, 240, 255, 0.06), 0 12px 40px rgba(0,0,0,0.35);
            }}
            .cc-metric-label {{
              font-size: 0.6875rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.09em;
              color: {TEXT_MUTED};
              margin-bottom: 0.2rem;
            }}
            .cc-metric-value {{
              font-size: 1.35rem;
              font-weight: 700;
              letter-spacing: -0.02em;
              color: {TEXT};
            }}
            .cc-metric-delta {{
              font-size: 0.75rem;
              color: {TEXT_MUTED};
              margin-top: 0.15rem;
            }}

            div[data-testid="stTabs"] {{
              margin-top: 0.25rem;
            }}
            div[data-testid="stTabs"] [role="tablist"] {{
              gap: 0.25rem;
              background: transparent;
              border-bottom: 1px solid {BORDER};
              padding-bottom: 0;
            }}
            div[data-testid="stTabs"] button {{
              font-family: 'Inter', sans-serif !important;
              font-size: 0.875rem !important;
              font-weight: 500 !important;
              color: {TEXT_MUTED} !important;
              border: none !important;
              border-radius: 0 !important;
              background: transparent !important;
              padding: 0.65rem 1rem !important;
              margin: 0 !important;
              border-bottom: 2px solid transparent !important;
              transition: color 0.2s ease, border-color 0.25s ease !important;
            }}
            div[data-testid="stTabs"] button:hover {{
              color: {TEXT} !important;
            }}
            div[data-testid="stTabs"] button[aria-selected="true"] {{
              color: {ACCENT} !important;
              border-bottom-color: {ACCENT} !important;
            }}

            .cc-panel {{
              background: {PANEL};
              border: 1px solid {BORDER};
              border-radius: 12px;
              padding: 1.35rem 1.5rem;
              transition: box-shadow 0.2s ease, border-color 0.2s ease;
            }}
            .cc-panel:hover {{
              border-color: rgba(0, 240, 255, 0.12);
              box-shadow: 0 16px 48px rgba(0,0,0,0.28);
            }}
            .cc-glow-btn .stButton > button {{
              width: 100%;
              background: linear-gradient(135deg, rgba(0,240,255,0.18) 0%, rgba(91,141,239,0.22) 100%) !important;
              border: 1px solid rgba(0, 240, 255, 0.45) !important;
              color: {TEXT} !important;
              font-weight: 600 !important;
              font-size: 0.9375rem !important;
              border-radius: 8px !important;
              padding: 0.75rem 1rem !important;
              box-shadow: 0 0 24px rgba(0, 240, 255, 0.12);
              transition: box-shadow 0.25s ease, transform 0.15s ease !important;
            }}
            .cc-glow-btn .stButton > button:hover {{
              box-shadow: 0 0 32px rgba(0, 240, 255, 0.22);
              transform: translateY(-1px);
            }}
            .cc-glow-btn .stButton > button:active {{
              transform: translateY(0);
            }}

            .cc-badge-buy {{
              display: inline-block;
              padding: 0.2rem 0.65rem;
              border-radius: 6px;
              font-size: 0.75rem;
              font-weight: 700;
              letter-spacing: 0.04em;
              background: rgba(52, 211, 153, 0.15);
              color: {POS};
              border: 1px solid rgba(52, 211, 153, 0.35);
            }}
            .cc-badge-sell {{
              display: inline-block;
              padding: 0.2rem 0.65rem;
              border-radius: 6px;
              font-size: 0.75rem;
              font-weight: 700;
              letter-spacing: 0.04em;
              background: rgba(248, 113, 113, 0.12);
              color: {NEG};
              border: 1px solid rgba(248, 113, 113, 0.35);
            }}
            .cc-badge-hold {{
              display: inline-block;
              padding: 0.2rem 0.65rem;
              border-radius: 6px;
              font-size: 0.75rem;
              font-weight: 700;
              letter-spacing: 0.04em;
              background: rgba(251, 191, 36, 0.12);
              color: {WARN};
              border: 1px solid rgba(251, 191, 36, 0.35);
            }}

            .cc-footer {{
              margin-top: 2.5rem;
              padding-top: 1rem;
              border-top: 1px solid {BORDER};
              font-size: 0.75rem;
              color: {TEXT_MUTED};
              text-align: center;
            }}

            div[data-testid="stMetric"] {{
              background: {PANEL};
              border: 1px solid {BORDER};
              border-radius: 10px;
            }}
            .stTextInput input, .stSelectbox div[data-baseweb="select"] > div {{
              background-color: #131722 !important;
              border-color: rgba(255,255,255,0.1) !important;
              color: {TEXT} !important;
            }}
            </style>
            """
        ).strip(),
        unsafe_allow_html=True,
    )


def _parse_decision(raw: str) -> dict | None:
    if not raw or not str(raw).strip():
        return None
    text = str(raw).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    m = re.search(r"\{[\s\S]*\}", text)
    if m:
        try:
            return json.loads(m.group())
        except json.JSONDecodeError:
            return None
    return None


def _crucix_live(macro: dict) -> bool:
    if not isinstance(macro, dict):
        return False
    if macro.get("status"):
        return False
    return macro.get("source") == "crucix" or bool(macro.get("macro"))


def _badge_html(action: str) -> str:
    a = str(action).upper()
    if a == "BUY":
        cls = "cc-badge-buy"
    elif a == "SELL":
        cls = "cc-badge-sell"
    else:
        cls = "cc-badge-hold"
    return f'<span class="{cls}">{a}</span>'


def _price_chart(df: pd.DataFrame, ticker: str) -> go.Figure:
    d = df.copy()
    if "date" in d.columns:
        x = pd.to_datetime(d["date"], utc=True, errors="coerce")
    else:
        x = d.index
    fig = go.Figure()
    fig.add_trace(
        go.Scatter(
            x=x,
            y=d["close"],
            mode="lines",
            line=dict(color=ACCENT, width=2),
            name="Close",
        )
    )
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(26,31,46,0.95)",
        margin=dict(l=48, r=24, t=48, b=40),
        height=380,
        font=dict(family="Inter, sans-serif", color=TEXT_MUTED, size=11),
        title=dict(text=f"{ticker} — price", font=dict(size=14, color=TEXT_MUTED)),
        xaxis=dict(showgrid=False, gridcolor=BORDER),
        yaxis=dict(showgrid=True, gridcolor=BORDER),
    )
    return fig


def _pnl_chart(bt_df: pd.DataFrame, ticker: str) -> go.Figure:
    d = bt_df.copy()
    idx = d.index
    if "date" in d.columns and not isinstance(d.index, pd.DatetimeIndex):
        idx = pd.to_datetime(d["date"], utc=True, errors="coerce")
    fig = go.Figure()
    fig.add_trace(
        go.Scatter(
            x=idx,
            y=d["strategy_equity"],
            mode="lines",
            line=dict(color=ACCENT, width=2),
            name="Harness",
        )
    )
    fig.add_trace(
        go.Scatter(
            x=idx,
            y=d["buy_hold_equity"],
            mode="lines",
            line=dict(color=TEXT_MUTED, width=1.5, dash="dot"),
            name="Buy & hold",
        )
    )
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(26,31,46,0.95)",
        margin=dict(l=48, r=24, t=48, b=40),
        height=380,
        font=dict(family="Inter, sans-serif", color=TEXT_MUTED, size=11),
        title=dict(
            text=f"{ticker} — 90d harness vs benchmark",
            font=dict(size=14, color=TEXT_MUTED),
        ),
        legend=dict(orientation="h", y=1.08, x=0),
    )
    return fig


# --------------------------------------------------------------------------- init state
if "macro_snap" not in st.session_state:
    st.session_state["macro_snap"] = get_macro_signals()
if "ibkr_arm" not in st.session_state:
    st.session_state["ibkr_arm"] = False
if "ibkr_handle" not in st.session_state:
    st.session_state["ibkr_handle"] = None

_premium_css()

# --------------------------------------------------------------------------- top navbar (HTML + toggles in Streamlit)
now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
macro = st.session_state["macro_snap"]
live = _crucix_live(macro)
live_cls = "cc-live" if live else "cc-live off"

st.markdown(
    dedent(
        f"""
        <div class="cc-nav">
          <div class="cc-logo">
            <span class="cc-logo-mark">Cortex Capital</span>
            <span class="cc-logo-sub">Institutional AI research console · LangGraph · OpenBB · Crucix</span>
          </div>
          <div class="cc-nav-right">
            <span class="cc-clock" title="Session time (UTC)">{now}</span>
            <span class="{live_cls}" title="Crucix /api/data reachability">
              <span class="cc-live-dot"></span> Live
            </span>
          </div>
        </div>
        """
    ).strip(),
    unsafe_allow_html=True,
)

c_nav1, c_nav2 = st.columns([4, 1])
with c_nav2:
    st.session_state["ibkr_arm"] = st.toggle(
        "Connect broker (IBKR paper)",
        value=st.session_state["ibkr_arm"],
        help="Arm execution hooks. TWS / IB Gateway paper must be running with API enabled.",
    )

# --------------------------------------------------------------------------- hero metrics + sparklines
hero = demo_hero_metrics()
hcols = st.columns(4)
keys = ["capacity", "ytd", "sharpe", "agents"]
for col, key in zip(hcols, keys):
    m = hero[key]
    with col:
        st.markdown(
            dedent(
                f"""
                <div class="cc-metric-card" title="{m['label']} — illustrative desk metrics for demo">
                  <div class="cc-metric-label">{m["label"]}</div>
                  <div class="cc-metric-value" style="color:{m['color']};">{m["value"]}</div>
                  <div class="cc-metric-delta">{m["delta"]}</div>
                </div>
                """
            ).strip(),
            unsafe_allow_html=True,
        )
        st.plotly_chart(
            fig_metric_sparkline(m["seed"]),
            use_container_width=True,
            config=SPARK_CONFIG,
        )

# --------------------------------------------------------------------------- sidebar
with st.sidebar:
    st.markdown("### Cortex Capital")
    st.caption("Console · YC-scale demo quality")
    with st.expander("Architecture", expanded=False):
        st.markdown(
            """
            **Stack**  
            LangGraph · Groq / Claude · OpenBB · Crucix · SQLite memory · IBKR (optional)

            **Flow**  
            Research → 18-persona debate → reflection → trader → risk → PM → persist
            """
        )
    with st.expander("Decision log", expanded=False):
        st.caption("SQLite at `CORTEX_MEMORY_PATH` — full audit in Research tab feed.")
    with st.expander("Backtester", expanded=False):
        st.caption("90-day momentum harness — **Backtester** tab. Not an LLM replay.")
    with st.expander("Paper trading", expanded=False):
        st.caption(
            "Toggle **Connect broker** in the header row. Execution requires "
            "`IBKR_AUTO_TRADE=true` in `.env` and confirmed paper session."
        )
    st.divider()
    if st.button("Refresh macro (Crucix)", use_container_width=True):
        st.session_state["macro_snap"] = get_macro_signals()
        st.rerun()

# --------------------------------------------------------------------------- tabs
tab_r, tab_m, tab_d, tab_b, tab_p = st.tabs(
    ["Research Desk", "Macro Intelligence", "Market Data", "Backtester", "Portfolio View"]
)

with tab_r:
    st.markdown("### Research Desk")
    st.caption(
        "Run the LangGraph swarm: data pull, committee debate, reflection, risk, final recommendation."
    )
    row1_c1, row1_c2 = st.columns([1.15, 1], gap="large")

    with row1_c1:
        st.markdown('<div class="cc-panel">', unsafe_allow_html=True)
        st.markdown("#### Run AI research workflow")
        st.caption(
            "Latency typically **30–90s** depending on provider. "
            "Last run shown in the output panel →"
        )
        mode = st.radio(
            "Symbol source",
            ["Quick pick", "Custom ticker"],
            horizontal=True,
            help="Quick pick uses a curated institutional watchlist; custom accepts any US symbol.",
        )
        if mode == "Quick pick":
            sym = st.selectbox(
                "Symbol",
                POPULAR_TICKERS,
                index=0,
                help="US-listed symbols — extend POPULAR_TICKERS in app.py",
            )
        else:
            sym = (
                st.text_input(
                    "Symbol",
                    value="NVDA",
                    placeholder="e.g. COST",
                    help="Free-text US equity ticker",
                )
                .strip()
                .upper()
                or "NVDA"
            )

        last_lat = st.session_state.get("last_latency_s")
        if last_lat is not None:
            st.caption(f"Last workflow latency: **{last_lat:.1f}s**")

        st.markdown('<div class="cc-glow-btn">', unsafe_allow_html=True)
        run = st.button(
            "Run AI research workflow",
            type="primary",
            use_container_width=True,
            help="Invokes graph.workflow.run_swarm — multiple LLM rounds",
        )
        st.markdown("</div>", unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)

        if run:
            t0 = time.monotonic()
            with st.spinner("Running LangGraph workflow — typically 30–90s…"):
                st.session_state["swarm_out"] = run_swarm(sym)
            st.session_state["swarm_ticker"] = sym
            st.session_state["last_latency_s"] = time.monotonic() - t0

    with row1_c2:
        st.markdown('<div class="cc-panel">', unsafe_allow_html=True)
        st.markdown("#### Latest output")
        out = st.session_state.get("swarm_out")
        if not out:
            st.info("Run the workflow to generate a structured recommendation.")
        else:
            parsed = _parse_decision(out.get("decision", ""))
            sw = st.session_state.get("swarm_ticker", sym)
            if parsed:
                act = str(parsed.get("recommendation", parsed.get("action", "HOLD"))).upper()
                conf = parsed.get("confidence", "—")
                conf_s = f"{conf}%" if isinstance(conf, (int, float)) else str(conf)
                st.markdown(
                    f"**{sw}** &nbsp; {_badge_html(act)} &nbsp; **Confidence** {conf_s}",
                    unsafe_allow_html=True,
                )
                reasoning = parsed.get("reasoning") or ""
                risks = parsed.get("risks") or []
                with st.expander("Rationale & risk", expanded=True):
                    if reasoning:
                        st.markdown("**Rationale**")
                        for line in reasoning.replace(". ", ".\n").split("\n"):
                            line = line.strip()
                            if line:
                                st.markdown(f"- {line}")
                    if isinstance(risks, list) and risks:
                        st.markdown("**Risks**")
                        for r in risks[:10]:
                            st.markdown(f"- {r}")
                with st.expander("Raw JSON", expanded=False):
                    st.json(parsed)

                qty = st.number_input(
                    "Paper size (shares)",
                    min_value=1,
                    max_value=1000,
                    value=1,
                    help="Demo size only — verify in TWS paper before scaling.",
                )
                if st.button(
                    "Execute paper trade",
                    use_container_width=True,
                    help="Requires armed broker toggle + TWS + IBKR_AUTO_TRADE=true",
                ):
                    if act not in ("BUY", "SELL"):
                        st.info("Paper execution is enabled only when the recommendation is BUY or SELL.")
                    elif not st.session_state.get("ibkr_arm"):
                        st.warning("Enable **Connect broker (IBKR paper)** first.")
                    else:
                        cfg = load_ibkr_config()
                        if not cfg.auto_trade:
                            st.error(
                                "Set `IBKR_AUTO_TRADE=true` in `.env` to allow order placement."
                            )
                        else:
                            ib = None
                            try:
                                ib = connect_ib_paper()
                                res = paper_market_order(
                                    ib,
                                    symbol=sw,
                                    action=act,
                                    quantity=float(qty),
                                )
                                st.success(json.dumps(res, default=str))
                            except Exception as e:
                                st.error(str(e))
                            finally:
                                disconnect_safely(ib)
            else:
                st.warning("Unparsed model output.")
                st.code(out.get("decision", ""), language="json")
        st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("#### Macro pulse")
    pulse = st.session_state["macro_snap"]
    pulse_live = _crucix_live(pulse)
    b1, b2, b3, b4 = st.columns(4)
    with b1:
        st.caption("Crucix status")
        st.markdown(
            f'<span class="{"cc-badge-buy" if pulse_live else "cc-badge-sell"}">'
            f'{"ONLINE" if pulse_live else "OFFLINE"}</span>',
            unsafe_allow_html=True,
        )
    with b2:
        st.plotly_chart(
            fig_macro_sparkline("Cross-asset stress"),
            use_container_width=True,
            config=SPARK_CONFIG,
        )
    with b3:
        st.plotly_chart(
            fig_macro_sparkline("Liquidity conditions", color="#5B8DEF"),
            use_container_width=True,
            config=SPARK_CONFIG,
        )
    with b4:
        st.plotly_chart(
            fig_macro_sparkline("Geopolitical impulse", color="#A78BFA"),
            use_container_width=True,
            config=SPARK_CONFIG,
        )

    st.markdown("#### Risk & exposure (demo book)")
    risk_df = demo_risk_exposure_rows()
    st.data_editor(
        risk_df,
        disabled=True,
        hide_index=True,
        use_container_width=True,
        column_config={
            "Notional %": st.column_config.ProgressColumn(
                "Notional %",
                format="%d%%",
                min_value=0,
                max_value=100,
            ),
            "Limit %": st.column_config.ProgressColumn(
                "Limit %",
                format="%d%%",
                min_value=0,
                max_value=100,
            ),
            "Stress (σ)": st.column_config.TextColumn(
                "Stress (σ)",
                help="Illustrative stress tagging",
            ),
        },
    )

    st.markdown("#### Recent decisions")
    mem_rows: list = []
    try:
        mem = DecisionMemory()
        try:
            mem_rows = mem.recent_feed(limit=12)
        finally:
            mem.close()
    except Exception:
        mem_rows = []
    feed = blended_decision_timeline(mem_rows, demo_pad=8)
    for item in feed:
        src = item.get("source", "")
        dot = "●" if src == "live" else "○"
        st.markdown(
            f"**{dot}** `{item.get('ts', '')[:19]}` · **{item.get('ticker')}** · "
            f"{_badge_html(str(item.get('action')))} · *{item.get('confidence')}%*"
        )
        if item.get("snippet"):
            st.caption(item["snippet"])

with tab_m:
    st.markdown("### Macro intelligence")
    st.caption("Crucix `/api/data` payload — refresh from sidebar.")
    st.json(st.session_state["macro_snap"])

with tab_d:
    st.markdown("### Market data")
    m_sym = (
        st.text_input(
            "Symbol",
            value=st.session_state.get("swarm_ticker", "NVDA"),
            key="mkt_sym",
        )
        .strip()
        .upper()
        or "NVDA"
    )
    try:
        hist = get_price_history(m_sym, days=120)
        if hist is not None and not hist.empty and "error" not in hist.columns:
            st.plotly_chart(_price_chart(hist, m_sym), use_container_width=True)
        else:
            st.warning("No OHLCV returned.")
    except Exception as e:
        st.error(str(e))

with tab_b:
    st.markdown("### Backtester")
    st.caption("Deterministic 90-day momentum harness on the OpenBB / yfinance feed.")
    b_sym = (
        st.text_input("Symbol", value="SPY", key="bt_sym").strip().upper() or "SPY"
    )
    if st.button("Run 90-day harness", key="run_bt"):
        try:
            summ = run_backtest(b_sym, days=90)
            st.session_state["bt_summary"] = summ
            df = pd.read_csv(summ["csv_path"])
            if "date" in df.columns:
                df["date"] = pd.to_datetime(df["date"], utc=True)
                df = df.set_index("date")
            st.session_state["bt_df"] = df
            st.session_state["bt_sym"] = b_sym
        except Exception as e:
            st.error(str(e))
    bdf = st.session_state.get("bt_df")
    bsym = st.session_state.get("bt_sym", b_sym)
    if isinstance(bdf, pd.DataFrame) and not bdf.empty:
        st.plotly_chart(_pnl_chart(bdf, bsym), use_container_width=True)
        s = st.session_state.get("bt_summary") or {}
        st.caption(
            f"Harness: **{s.get('strategy_total_return')}%** · "
            f"Buy & hold: **{s.get('buy_hold_total_return')}%** · `{s.get('csv_path')}`"
        )

with tab_p:
    st.markdown("### Portfolio view")
    st.caption("Target allocation (illustrative) — wire to OMS for production.")
    st.plotly_chart(fig_allocation_donut(), use_container_width=True)
    st.dataframe(
        demo_portfolio_allocation(),
        hide_index=True,
        use_container_width=True,
    )
    if st.session_state.get("ibkr_arm"):
        if st.button("Ping IBKR paper session"):
            ib = None
            try:
                ib = connect_ib_paper()
                rows = account_summary_rows(ib)
                st.json(rows[:24])
            except Exception as e:
                st.error(str(e))
            finally:
                disconnect_safely(ib)

st.markdown(
    dedent(
        """
        <div class="cc-footer">
          Toronto · Prototype · Not investment advice · IBKR paper only unless explicitly enabled
        </div>
        """
    ).strip(),
    unsafe_allow_html=True,
)

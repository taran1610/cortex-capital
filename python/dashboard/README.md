# Cortex Capital — Research Console (Streamlit)

Institutional-grade UI direction: **Stripe-level restraint** (electric cyan `#00F0FF` on deep charcoal `#0F1117`) meets **Google Finance clarity** (tabular hierarchy, sparklines, legible risk tables). The console is built for allocator-facing demos: hero desk metrics with live-style sparklines, underline-styled primary navigation, macro pulse row, demo risk grid with progress columns, allocation donut, and a decision timeline that blends SQLite audit rows with illustrative history so the product never looks empty.

**Run**

```bash
cd ~/cortex-capital/python
source .venv/bin/activate
streamlit run dashboard/app.py
```

**Modules**

- `app.py` — layout, CSS injection (Inter), LangGraph `run_swarm`, Crucix, OpenBB, IBKR hooks, tabs.
- `ui_helpers.py` — Plotly sparklines, demo portfolio/risk data, macro pulse mini-charts, timeline blending.

**Trust & compliance**

Footer and sidebar copy reinforce *prototype / not advice / IBKR paper*. Paper orders require broker toggle, live TWS/Gateway, and `IBKR_AUTO_TRADE=true`.

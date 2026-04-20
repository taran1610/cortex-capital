# Cortex Capital

**Cortex Capital** is an open-source **AI-native hedge fund prototype** built in Toronto for YC Summer 2026-style demos.
It combines multi-agent reasoning, market/macro data, backtesting, memory, and paper-trading execution into one system that can be run locally.

## What This Project Is

Cortex Capital is a research and execution sandbox for the YC thesis:

> "AI-native hedge funds" where swarms of agents analyze filings, earnings, macro signals, and produce trade decisions with an audit trail.

This repo is designed to show:
- an end-to-end **research -> debate -> risk -> portfolio decision** workflow,
- a polished **institutional Streamlit console**,
- a simple **90-day backtest harness**,
- optional **IBKR paper trade hooks**,
- local **decision memory** for traceability.

---

## High-Level Architecture

### Core components
- **Orchestration:** LangGraph (`python/graph/*`)
- **Models:** Groq primary + Anthropic fallback (`python/graph/llm_client.py`)
- **Market/Fundamental data:** OpenBB with robust fallback paths (`python/cortex_tools/openbb_tools.py`)
- **Macro/OSINT feed:** Crucix bridge (`python/cortex_tools/crucix_bridge.py`)
- **Paper broker hooks:** Interactive Brokers via `ib_insync` (`python/cortex_tools/ibkr_tools.py`)
- **Memory/Audit:** SQLite decision store (`python/cortex_tools/memory_store.py`)
- **UI:** Streamlit institutional dashboard (`python/dashboard/app.py`)
- **Backtest harness:** 90-day deterministic strategy runner (`python/backtester/backtest_runner.py`)

### Agent workflow
1. **Researcher node** pulls price + fundamentals + filings + macro context.
2. **Debater node** runs 18 legendary-investor personas in batches.
3. **Dexter-style reflection** critiques and revises synthesis.
4. **Trader node** produces structured action proposal.
5. **Risk manager** overlays volatility/macro constraints.
6. **Portfolio manager** outputs final BUY/HOLD/SELL + confidence.
7. **Memory node** persists outcomes for audit/feed.

---

## Repository Layout

```text
cortex-capital/
├── README.md
├── .gitmodules
├── crucix/                       # submodule: macro OSINT engine
└── python/
    ├── main.py                   # CLI entry
    ├── requirements.txt
    ├── .env.example
    ├── graph/
    │   ├── state.py
    │   ├── nodes.py
    │   ├── workflow.py
    │   ├── llm_client.py
    │   └── legendary_agents.py
    ├── cortex_tools/
    │   ├── openbb_tools.py
    │   ├── crucix_bridge.py
    │   ├── ibkr_tools.py
    │   └── memory_store.py
    ├── dashboard/
    │   ├── app.py
    │   ├── ui_helpers.py
    │   └── README.md
    ├── backtester/
    │   └── backtest_runner.py
    ├── data/                     # local sqlite memory lives here
    └── reports/                  # generated backtest outputs
```

---

## Local Setup (Mac)

### 1) Clone + initialize submodules
```bash
git clone https://github.com/taran1610/cortex-capital.git
cd cortex-capital
git submodule update --init --recursive
```

### 2) Python environment
```bash
cd python
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
```

### 3) Configure `.env`
At minimum set one model key:
- `GROQ_API_KEY` (primary)
- `ANTHROPIC_API_KEY` (fallback)

Optional:
- `CRUCIX_URL=http://127.0.0.1:3117`
- `IBKR_HOST`, `IBKR_PORT`, `IBKR_CLIENT_ID`, `IBKR_AUTO_TRADE`
- `FRED_API_KEY`, `FMP_API_KEY`, `EIA_API_KEY`, `SEC_USER_AGENT`

---

## Run the Full Stack

### Terminal A: Crucix (macro feed)
```bash
cd ~/cortex-capital/crucix
npm install
npm run dev
```

### Terminal B: Streamlit dashboard
```bash
cd ~/cortex-capital/python
source .venv/bin/activate
streamlit run dashboard/app.py
```

Open the URL shown by Streamlit (usually `http://localhost:8501`).

---

## CLI Usage

```bash
cd ~/cortex-capital/python
source .venv/bin/activate
python main.py --ticker NVDA
python main.py --ticker NVDA --json
```

---

## Backtesting

Run a 90-day harness:
```bash
cd ~/cortex-capital/python
source .venv/bin/activate
python backtester/backtest_runner.py --ticker SPY --days 90
```

Outputs:
- CSV equity curve in `python/reports/`
- monthly P&L markdown in `python/reports/`

> Note: this harness is deterministic and lightweight; it is not a full historical replay of all LLM debate calls.

---

## Interactive Brokers (Paper)

1. Enable paper trading in IBKR account settings.
2. Open TWS or IB Gateway (paper login).
3. Enable API sockets in TWS (paper port usually `7497`).
4. Set `IBKR_*` values in `python/.env`.
5. Keep `IBKR_AUTO_TRADE=false` until you explicitly want order placement.

The dashboard includes:
- broker arm toggle,
- paper session ping,
- conditional "Execute paper trade" action.

---

## Dashboard Features (2026-style UI)

- Institutional dark theme (`#0F1117`, electric cyan accents)
- Top nav with UTC + live macro badge + broker arm toggle
- Hero metrics with mini sparklines
- Multi-tab workspace:
  - Research Desk
  - Macro Intelligence
  - Market Data
  - Backtester
  - Portfolio View
- Structured recommendation card with BUY/HOLD/SELL badge
- Macro pulse indicators
- Risk/exposure table with progress bars
- Portfolio allocation donut
- Recent decision timeline (SQLite + demo fill)

---

## Security / What Is Not Committed

The repo intentionally ignores:
- `.env` files and secret keys,
- local DB artifacts,
- generated reports,
- Python cache files,
- local virtualenv directories.

Use `python/.env.example` as the safe template.

---

## Troubleshooting

### Streamlit prints CSS on screen
This happens when HTML/CSS strings are treated as Markdown code blocks. We already guard this using `dedent(...).strip()` in `dashboard/app.py`. If this reappears, check indentation in HTML/CSS `st.markdown` strings.

### OpenBB import issues
`cortex_tools/openbb_tools.py` uses lazy OpenBB init and falls back to yfinance for prices. Ensure `requirements.txt` is installed in your active venv.

### Port already in use
Run Streamlit on another port:
```bash
streamlit run dashboard/app.py --server.port 8502
```

---

## Upstream Submodules / Attribution

This repo references upstream projects via submodules:
- OpenBB
- virattt/ai-hedge-fund
- virattt/dexter
- calesthio/Crucix

Please review and respect each upstream license.

---

## Disclaimer

This project is a research prototype and demo system.
It is **not investment advice**, **not production execution software**, and should be used with paper trading / simulation unless independently validated.

---

## Founder Narrative (YC-friendly)

Toronto founder building an AI-native hedge fund OS: an auditable, multi-agent investment workflow that turns fragmented data + macro signals into structured portfolio decisions, then proves discipline through risk overlays, backtests, and paper execution before scaling to institutional deployment.

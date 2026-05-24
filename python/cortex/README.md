# `cortex` — modular kernel (Phase 1)

This package is the **testable, composable core**: market data, deterministic
strategies, risk sizing, execution adapters, storage, and a tiny backtest loop.

It is intentionally **separate** from:

- **`graph/`** — LangGraph multi-agent swarm (research → debate → PM).
- **`cortex_tools/`** — integrations (OpenBB, Crucix, IBKR, SQLite memory).
- **`dashboard/`** — Streamlit institutional console.

## Layout

```text
cortex/
├── data/market_data.py       # OHLCV fetch (yfinance MVP)
├── core/strategies/          # alpha rules (RSI starter)
├── risk/manager.py           # position sizing
├── execution/broker.py       # Broker protocol + MockBroker
├── storage/logger.py         # CSV trade log
├── backtesting/engine.py     # walk-forward harness
├── orchestrator.py           # wires the pipeline
└── __main__.py               # CLI: python -m cortex
```

## Run (CLI)

From `python/`:

```bash
python -m cortex --symbol SPY --period 6mo
```

## Run (HTTP)

```bash
uvicorn api.app:app --reload --port 8800
```

Then `GET http://127.0.0.1:8800/run/kernel?symbol=SPY`

## Next upgrades (when Phase 1 is stable)

1. Swap `MarketData` internals to OpenBB (`cortex_tools.openbb_tools`).
2. Add `execution/ibkr_broker.py` implementing `Broker` with `ib_insync`.
3. Promote `Backtester` to share the same `Broker` + fee/slippage models.
4. Event bus / async jobs between API and long-running LangGraph runs.

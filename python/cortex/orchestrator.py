"""
Phase-1 orchestrator — wires data → strategy → risk → execution → storage.

This is intentionally small and synchronous. The LangGraph swarm (`graph.workflow`)
is the advanced path; call that from CLI/UI when you need multi-agent reasoning.
"""

from __future__ import annotations

import os

from cortex.core.strategies.rsi_trend import RSIStrategy
from cortex.data.market_data import MarketData
from cortex.execution.ibkr_broker import IbkrBroker, make_broker
from cortex.risk.manager import RiskManager
from cortex.storage.logger import TradeLogger


def run(
    symbol: str = "GC=F",
    *,
    period: str = "3mo",
    balance: float = 10_000.0,
    stop_loss_pips: float = 50.0,
    pip_value: float = 1.0,
    execution_backend: str | None = None,
) -> dict:
    """Fetch data, compute signal, size, execute (mock or IBKR), log."""
    backend = (
        execution_backend.strip().lower()
        if execution_backend
        else os.getenv("CORTEX_EXECUTION_BACKEND", "mock").strip().lower()
    )

    data = MarketData(symbol=symbol, interval="1d")
    df = data.fetch(period=period)
    if df.empty:
        return {"status": "no_data", "symbol": symbol}

    strategy = RSIStrategy()
    risk = RiskManager()
    broker = make_broker(backend=backend)
    logger = TradeLogger()

    signal = strategy.generate_signal(df)
    out: dict = {
        "status": "ok",
        "symbol": symbol,
        "signal": signal,
        "execution_backend": backend,
    }
    try:
        if signal != "HOLD":
            size = risk.position_size(balance, stop_loss_pips, pip_value)
            trade = broker.place_order(
                symbol=symbol,
                side="BUY" if signal == "BUY" else "SELL",
                size=size,
                sl=stop_loss_pips,
                tp=stop_loss_pips * 2,
            )
            if "broker" not in trade:
                trade["broker"] = "mock"
            logger.log(trade)
            out["trade"] = trade
            if hasattr(broker, "positions"):
                out["positions"] = len(getattr(broker, "positions", []))
        return out
    finally:
        if isinstance(broker, IbkrBroker):
            broker.close()

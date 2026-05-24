"""
Interactive Brokers adapter for the Phase-1 kernel (paper session).

Enable with:
  CORTEX_EXECUTION_BACKEND=ibkr
  IBKR_AUTO_TRADE=true   # required to actually transmit orders
Paper TWS / IB Gateway must be running (default port 7497).

Only **US equity root symbols** (e.g. SPY, AAPL) are supported on this path;
yfinance continuous futures (GC=F) cannot be mapped to a single Stock contract here.
"""

from __future__ import annotations

import json
import os
from typing import Any, Literal

from cortex.data.symbols import ibkr_kernel_equity_symbol
from cortex.execution.broker import Broker


class IbkrBroker:
    """Connect-on-first-use broker; disconnect via `close()`."""

    def __init__(self) -> None:
        self._ib: Any = None

    def _connect(self) -> None:
        if self._ib is not None:
            return
        from cortex_tools.ibkr_tools import connect_ib_paper

        self._ib = connect_ib_paper()

    def close(self) -> None:
        from cortex_tools.ibkr_tools import disconnect_safely

        disconnect_safely(self._ib)
        self._ib = None

    def place_order(
        self,
        symbol: str,
        side: Literal["BUY", "SELL"],
        size: float,
        sl: float,
        tp: float,
    ) -> dict[str, Any]:
        from cortex_tools import ibkr_tools

        eq = ibkr_kernel_equity_symbol(symbol)
        if eq is None:
            return {
                "symbol": symbol,
                "side": side,
                "size": size,
                "stop_loss": sl,
                "take_profit": tp,
                "placed": False,
                "broker": "ibkr",
                "reason": (
                    "Kernel IBKR path supports US equity tickers only "
                    "(e.g. SPY). yfinance-style continuous futures (GC=F) are data-only here."
                ),
            }

        cfg = ibkr_tools.load_ibkr_config()
        qty = max(1, int(round(size)))
        base: dict[str, Any] = {
            "symbol": eq,
            "side": side,
            "size": float(qty),
            "stop_loss": sl,
            "take_profit": tp,
            "broker": "ibkr",
            "ibkr_auto_trade": cfg.auto_trade,
            "ibkr_host": cfg.host,
            "ibkr_port": cfg.port,
        }

        if not cfg.auto_trade:
            return {
                **base,
                "placed": False,
                "reason": (
                    "IBKR_AUTO_TRADE=false — order not sent. "
                    "Set IBKR_AUTO_TRADE=true in .env after confirming paper TWS / Gateway."
                ),
            }

        try:
            self._connect()
        except Exception as exc:  # noqa: BLE001
            return {**base, "placed": False, "reason": f"connect_failed: {exc}"}

        try:
            out = ibkr_tools.paper_market_order(
                self._ib,
                symbol=eq,
                action="BUY" if side == "BUY" else "SELL",
                quantity=float(qty),
            )
        except Exception as exc:  # noqa: BLE001
            return {**base, "placed": False, "reason": f"order_failed: {exc}"}

        notes = {
            "ibkr_response": out,
            "kernel_execution_backend": "ibkr",
        }
        return {
            **base,
            "placed": bool(out.get("placed")),
            "notes": json.dumps(notes),
        }


def make_broker(*, backend: str | None = None) -> Broker:
    """Factory: mock (default) or ibkr when backend / env CORTEX_EXECUTION_BACKEND=ibkr."""
    b = (backend if backend is not None else os.getenv("CORTEX_EXECUTION_BACKEND", "mock"))
    b = str(b).strip().lower()
    if b == "ibkr":
        return IbkrBroker()
    from cortex.execution.broker import MockBroker

    return MockBroker()

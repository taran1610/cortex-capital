"""
Interactive Brokers (ib_insync) — paper trading connection helpers.

Canada-friendly: run TWS or IB Gateway in paper mode; enable API sockets.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Optional

from dotenv import load_dotenv

load_dotenv()


@dataclass
class IBKRConnectionInfo:
    host: str
    port: int
    client_id: int
    account: str
    auto_trade: bool


def load_ibkr_config() -> IBKRConnectionInfo:
    return IBKRConnectionInfo(
        host=os.getenv("IBKR_HOST", "127.0.0.1"),
        port=int(os.getenv("IBKR_PORT", "7497")),
        client_id=int(os.getenv("IBKR_CLIENT_ID", "1")),
        account=os.getenv("IBKR_ACCOUNT", "").strip(),
        auto_trade=os.getenv("IBKR_AUTO_TRADE", "false").lower() in ("1", "true", "yes"),
    )


def connect_ib_paper() -> Any:
    """Returns connected `IB` instance or raises."""
    from ib_insync import IB

    cfg = load_ibkr_config()
    ib = IB()
    ib.connect(cfg.host, cfg.port, clientId=cfg.client_id, readonly=False)
    return ib


def account_summary_rows(ib: Any) -> list[dict[str, Any]]:
    """Flatten ib.accountSummary() for dashboards."""
    rows: list[dict[str, Any]] = []
    try:
        for v in ib.accountSummary():
            rows.append(
                {
                    "tag": v.tag,
                    "value": v.value,
                    "currency": v.currency,
                    "account": v.account,
                }
            )
    except Exception as exc:
        rows.append({"error": str(exc)})
    return rows


def paper_market_order(
    ib: Any,
    *,
    symbol: str,
    action: str,
    quantity: float,
    exchange: str = "SMART",
    currency: str = "USD",
) -> dict[str, Any]:
    """
    Places a simple MKT order when IBKR_AUTO_TRADE=true.
    Use tiny size in paper — this is a prototype hook, not production execution.
    """
    from ib_insync import MarketOrder, Stock

    cfg = load_ibkr_config()
    if not cfg.auto_trade:
        return {
            "placed": False,
            "reason": "IBKR_AUTO_TRADE is not enabled",
            "symbol": symbol.upper(),
        }
    contract = Stock(symbol.upper(), exchange, currency)
    ib.qualifyContracts(contract)
    order = MarketOrder(action.upper(), quantity)
    trade = ib.placeOrder(contract, order)
    return {
        "placed": True,
        "symbol": symbol.upper(),
        "action": action.upper(),
        "quantity": quantity,
        "order": str(trade.order),
    }


def disconnect_safely(ib: Optional[Any]) -> None:
    if ib is None:
        return
    try:
        ib.disconnect()
    except Exception:
        pass

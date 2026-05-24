"""Execution adapters — mock first, IBKR optional."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal, Protocol


class Broker(Protocol):
    def place_order(
        self,
        symbol: str,
        side: Literal["BUY", "SELL"],
        size: float,
        sl: float,
        tp: float,
    ) -> dict[str, Any]: ...


@dataclass
class MockBroker:
    """In-memory broker for tests and dry runs."""

    positions: list[dict[str, Any]] = field(default_factory=list)

    def place_order(
        self,
        symbol: str,
        side: Literal["BUY", "SELL"],
        size: float,
        sl: float,
        tp: float,
    ) -> dict[str, Any]:
        order = {
            "symbol": symbol,
            "side": side,
            "size": size,
            "stop_loss": sl,
            "take_profit": tp,
        }
        self.positions.append(order)
        return order

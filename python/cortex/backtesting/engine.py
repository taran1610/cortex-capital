"""Minimal walk-forward simulator — one signal per step (MVP)."""

from __future__ import annotations

from typing import Any

import pandas as pd


class Backtester:
    def __init__(self, strategy: Any):
        self.strategy = strategy

    def run(self, df: pd.DataFrame, warmup: int = 50) -> list[str]:
        trades: list[str] = []
        if len(df) <= warmup:
            return trades
        for i in range(warmup, len(df)):
            sub = df.iloc[:i]
            signal = self.strategy.generate_signal(sub)
            if signal != "HOLD":
                trades.append(signal)
        return trades

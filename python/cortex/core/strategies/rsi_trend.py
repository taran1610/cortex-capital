"""Classic RSI mean-reversion style signals (MVP alpha layer)."""

from __future__ import annotations

import pandas as pd


class RSIStrategy:
    def __init__(self, rsi_period: int = 14, oversold: float = 30.0, overbought: float = 70.0):
        self.rsi_period = rsi_period
        self.oversold = oversold
        self.overbought = overbought

    def compute_rsi(self, series: pd.Series) -> pd.Series:
        delta = series.diff()
        gain = delta.clip(lower=0).rolling(self.rsi_period).mean()
        loss = (-delta.clip(upper=0)).rolling(self.rsi_period).mean()
        rs = gain / loss.replace(0, pd.NA)
        return 100 - (100 / (1 + rs))

    def generate_signal(self, df: pd.DataFrame) -> str:
        col = "Close" if "Close" in df.columns else "close"
        if col not in df.columns or len(df) < self.rsi_period + 2:
            return "HOLD"
        work = df.copy()
        work["rsi"] = self.compute_rsi(work[col])
        last = work.iloc[-1]
        rsi_raw = last["rsi"]
        if pd.isna(rsi_raw):
            return "HOLD"
        rsi = float(rsi_raw)
        if rsi < self.oversold:
            return "BUY"
        if rsi > self.overbought:
            return "SELL"
        return "HOLD"

"""OHLCV ingestion — OpenBB-first with yfinance fallback (via `cortex_tools.openbb_tools`)."""

from __future__ import annotations

import os
from dataclasses import dataclass

import pandas as pd

from cortex.data.symbols import normalize_feed_symbol, period_to_lookback_days


def _normalize_ohlcv_df(df: pd.DataFrame) -> pd.DataFrame:
    """Ensure a numeric `Close` column for strategies."""
    if df is None or df.empty:
        return pd.DataFrame()
    out = df.copy()
    lower = {str(c).lower(): c for c in out.columns}
    src = None
    for key in ("close", "adjclose", "adj_close"):
        if key in lower:
            src = lower[key]
            break
    if src is None:
        return pd.DataFrame()
    out["Close"] = pd.to_numeric(out[src], errors="coerce")
    out = out.dropna(subset=["Close"])
    return out


@dataclass
class MarketData:
    symbol: str
    interval: str = "1d"

    def fetch(self, period: str = "3mo") -> pd.DataFrame:
        """
        Daily history. Uses `cortex_tools.get_price_history` (OpenBB when available,
        else yfinance). Interval is accepted for API compatibility; only 1d bars are returned.
        """
        sym = normalize_feed_symbol(self.symbol)
        days = period_to_lookback_days(period)
        provider = (os.getenv("CORTEX_PRICE_PROVIDER") or "yfinance").strip() or "yfinance"

        from cortex_tools.openbb_tools import get_price_history

        raw = get_price_history(sym, days=days, provider=provider)
        return _normalize_ohlcv_df(raw)

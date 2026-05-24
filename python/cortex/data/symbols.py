"""Symbol + calendar helpers for yfinance-style tickers vs US equity IBKR routes."""

from __future__ import annotations

import re
from typing import Literal

# yfinance periods supported by `MarketData.fetch(period=...)`
_PERIOD_DAYS: dict[str, int] = {
    "1d": 5,
    "5d": 10,
    "1mo": 40,
    "3mo": 100,
    "6mo": 200,
    "1y": 380,
    "2y": 760,
    "5y": 1900,
    "ytd": 380,
    "max": 8000,
}


def normalize_feed_symbol(raw: str) -> str:
    """Strip and preserve case conventions expected by providers (usually UPPER for equities)."""
    s = raw.strip()
    if not s:
        return s
    # yfinance continuous futures use suffix =F; keep as-is for data vendors
    if "=" in s:
        return s.upper()
    return s.upper()


def infer_asset_kind(symbol: str) -> Literal["equity", "yf_continuous_future", "unknown"]:
    """
    - US-style tickers (AAPL, BRK.B) → equity
    - yfinance continuous futures (GC=F, ES=F) → yf_continuous_future
    """
    s = symbol.strip().upper()
    if "=" in s and s.endswith("=F"):
        return "yf_continuous_future"
    if re.fullmatch(r"[A-Z0-9.\-]{1,12}", s):
        return "equity"
    return "unknown"


def period_to_lookback_days(period: str) -> int:
    """Map yfinance-style period strings to a day count for OpenBB / history windows."""
    p = period.strip().lower()
    if p in _PERIOD_DAYS:
        return _PERIOD_DAYS[p]
    m = re.fullmatch(r"(\d+)\s*d", p)
    if m:
        return max(int(m.group(1)) + 5, 10)
    return 120


def ibkr_kernel_equity_symbol(symbol: str) -> str | None:
    """Ticker string for a SMART `Stock` order, or None for non-equity symbols."""
    if infer_asset_kind(symbol) != "equity":
        return None
    return symbol.strip().upper()

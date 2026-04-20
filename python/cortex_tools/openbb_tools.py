"""
OpenBB data layer — prices, fundamentals context, filings, earnings calendar.

OpenBB is imported lazily so import errors or slow first-time builds never prevent
this module from defining `build_research_bundle` / `price_summary_for_llm`.
"""

from __future__ import annotations

import os
from datetime import date, timedelta
from typing import Any, Optional

import pandas as pd
from dotenv import load_dotenv

load_dotenv()

__all__ = [
    "build_research_bundle",
    "get_earnings_context",
    "get_fundamental_snapshot",
    "get_price_history",
    "get_recent_filings",
    "price_summary_for_llm",
]

_obb = None
_obb_error: Optional[str] = None


def _get_obb():
    """Lazy OpenBB client; failures are cached so callers can fall back."""
    global _obb, _obb_error
    if _obb is not None:
        return _obb
    if _obb_error is not None:
        return None
    try:
        from openbb import obb as obb_mod

        obb_mod.user.preferences.output_type = "dataframe"
        _ua = os.getenv("SEC_USER_AGENT", "CortexCapital/1.0 (research@localhost)")
        if _ua and hasattr(obb_mod.user, "preferences"):
            try:
                obb_mod.user.preferences.request_headers = {"User-Agent": _ua}
            except Exception:
                pass
        _obb = obb_mod
        return _obb
    except Exception as exc:
        _obb_error = str(exc)
        return None


def _to_df(result: Any) -> pd.DataFrame:
    if result is None:
        return pd.DataFrame()
    for meth in ("to_dataframe", "to_df"):
        if hasattr(result, meth):
            try:
                df = getattr(result, meth)()
                if df is not None:
                    return df if isinstance(df, pd.DataFrame) else pd.DataFrame(df)
            except Exception:
                pass
    if isinstance(result, pd.DataFrame):
        return result
    return pd.DataFrame()


def _price_via_yfinance(ticker: str, days: int) -> pd.DataFrame:
    """Last-resort prices if OpenBB providers fail to import (common during dev upgrades)."""
    import yfinance as yf

    t = yf.Ticker(ticker.upper())
    df = t.history(period=f"{int(days * 1.2)}d", auto_adjust=True)
    if df is None or df.empty:
        return pd.DataFrame()
    out = df.rename(
        columns={
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close",
            "Volume": "volume",
        }
    )
    out = out.reset_index()
    if "Date" in out.columns:
        out = out.rename(columns={"Date": "date"})
    return out


def get_price_history(
    ticker: str,
    *,
    days: int = 120,
    provider: str = "yfinance",
) -> pd.DataFrame:
    """Daily OHLCV for charting and volatility heuristics."""
    obb = _get_obb()
    if obb is None:
        return _price_via_yfinance(ticker, days)

    end = date.today()
    start = end - timedelta(days=int(days * 1.5))
    try:
        res = obb.equity.price.historical(
            symbol=ticker.upper(),
            start_date=start.isoformat(),
            end_date=end.isoformat(),
            provider=provider,
        )
        df = _to_df(res)
        if df.empty or "error" in df.columns:
            return _price_via_yfinance(ticker, days)
        return df.tail(days + 30)
    except Exception:
        return _price_via_yfinance(ticker, days)


def get_fundamental_snapshot(ticker: str) -> dict[str, Any]:
    """Key ratios / profile snippets for the researcher prompt."""
    out: dict[str, Any] = {}
    sym = ticker.upper()
    obb = _get_obb()
    if obb is None:
        return {"openbb_unavailable": _obb_error or "unknown"}

    def _metrics():
        for prov in ("yfinance", "fmp"):
            try:
                return obb.equity.fundamental.metrics(
                    symbol=sym, provider=prov, period="ttm", limit=1
                )
            except Exception:
                continue
        return obb.equity.fundamental.metrics(symbol=sym, period="ttm", limit=1)

    for label, call in (
        ("metrics_ttm", _metrics),
        (
            "balance_growth",
            lambda: obb.equity.fundamental.balance_growth(
                symbol=sym, period="annual", limit=3, provider="fmp"
            ),
        ),
        (
            "cash_growth",
            lambda: obb.equity.fundamental.cash_growth(
                symbol=sym, period="annual", limit=3, provider="fmp"
            ),
        ),
    ):
        try:
            df = _to_df(call())
            if df is not None and not df.empty:
                out[label] = df.head(5).to_dict(orient="records")
            else:
                out[label] = []
        except Exception as exc:
            out[label] = {"error": str(exc)}
    return out


def get_recent_filings(ticker: str, *, limit: int = 5) -> dict[str, Any]:
    """SEC (or other) filing index — links into 10-K / 10-Q."""
    sym = ticker.upper()
    obb = _get_obb()
    if obb is None:
        return {"error": _obb_error or "openbb_unavailable", "rows": []}
    try:
        df = _to_df(
            obb.equity.fundamental.filings(symbol=sym, provider="sec", limit=limit)
        )
        if df.empty:
            df = _to_df(
                obb.equity.fundamental.filings(symbol=sym, provider="fmp", limit=limit)
            )
        return {"rows": df.head(limit).to_dict(orient="records")}
    except Exception as exc:
        return {"error": str(exc), "rows": []}


def get_earnings_context(ticker: str) -> dict[str, Any]:
    """Upcoming / recent earnings calendar + last transcript metadata if available."""
    sym = ticker.upper()
    out: dict[str, Any] = {}
    obb = _get_obb()
    if obb is None:
        return {"calendar_error": _obb_error or "openbb_unavailable"}
    try:
        cal = _to_df(obb.equity.calendar.earnings(symbol=sym, provider="fmp"))
        if not cal.empty:
            out["calendar"] = cal.head(8).to_dict(orient="records")
    except Exception as exc:
        out["calendar_error"] = str(exc)
    try:
        tr = _to_df(
            obb.equity.fundamental.transcript(
                symbol=sym, year=date.today().year, quarter=4, provider="fmp"
            )
        )
        if not tr.empty:
            out["transcript_sample"] = tr.head(3).to_dict(orient="records")
    except Exception:
        pass
    return out


def build_research_bundle(ticker: str) -> dict[str, Any]:
    """Single object the graph researcher node attaches to state."""
    px = get_price_history(ticker)
    last_row = {}
    if px is not None and not px.empty and "error" not in px.columns:
        tail = px.tail(1)
        last_row = tail.iloc[0].to_dict()
    return {
        "ticker": ticker.upper(),
        "price_frame": px,
        "last_bar": last_row,
        "fundamentals": get_fundamental_snapshot(ticker),
        "filings": get_recent_filings(ticker),
        "earnings": get_earnings_context(ticker),
    }


def price_summary_for_llm(bundle: dict[str, Any], max_rows: int = 8) -> str:
    """Compact string for prompts."""
    px = bundle.get("price_frame")
    if isinstance(px, pd.DataFrame) and not px.empty and "error" not in px.columns:
        tail = px.tail(max_rows)
        return tail.to_string(index=False)
    return str(px)

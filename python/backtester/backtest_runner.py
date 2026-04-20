"""
90-day track record generator (rule-based signal using OpenBB prices).

This is a **deterministic research harness**, not a replay of the full LLM swarm
(which would require hundreds of costly calls). Use it to sanity-check data feeds
and produce monthly P&L markdown for decks / YC appendix.
"""

from __future__ import annotations

import argparse
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Optional

import numpy as np
import pandas as pd

import sys

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from cortex_tools.openbb_tools import get_price_history


def _ensure_dt_index(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    if "date" in out.columns:
        out["date"] = pd.to_datetime(out["date"], utc=True, errors="coerce")
        out = out.set_index("date")
    out = out.sort_index()
    return out


def momentum_signal(close: pd.Series, fast: int = 10, slow: int = 30) -> pd.Series:
    """Long when fast MA > slow MA, else flat."""
    f = close.rolling(fast).mean()
    s = close.rolling(slow).mean()
    return (f > s).astype(float)


def run_backtest(
    ticker: str,
    *,
    days: int = 90,
    fast: int = 10,
    slow: int = 30,
    report_dir: Optional[Path] = None,
) -> dict[str, Any]:
    ticker = ticker.upper()
    raw = get_price_history(ticker, days=max(days + slow + 5, 120))
    if raw is None or raw.empty or "close" not in raw.columns:
        raise RuntimeError(f"No price data for {ticker}")
    if "error" in raw.columns:
        raise RuntimeError(raw.iloc[0].to_string())

    df = _ensure_dt_index(raw)
    df = df.tail(days + slow + 5)
    close = df["close"].astype(float)
    sig = momentum_signal(close, fast=fast, slow=slow)
    ret = close.pct_change().fillna(0.0)
    strat_ret = sig.shift(1).fillna(0.0) * ret
    equity = (1.0 + strat_ret).cumprod()
    bh = (1.0 + ret).cumprod()

    out_df = pd.DataFrame(
        {
            "close": close,
            "signal": sig,
            "strategy_daily": strat_ret,
            "strategy_equity": equity,
            "buy_hold_equity": bh,
        }
    ).iloc[-days:]

    report_dir = report_dir or _ROOT / "reports"
    report_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M")
    csv_path = report_dir / f"backtest_{ticker}_{days}d_{stamp}.csv"
    out_df.reset_index().to_csv(csv_path, index=False)

    total = float(equity.iloc[-1] / equity.iloc[0] - 1.0)
    bh_total = float(bh.iloc[-1] / bh.iloc[0] - 1.0)

    summary = {
        "ticker": ticker,
        "days": days,
        "strategy_total_return": round(total * 100, 2),
        "buy_hold_total_return": round(bh_total * 100, 2),
        "csv_path": str(csv_path),
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
    }
    md_path = write_monthly_report(out_df, ticker=ticker, report_dir=report_dir, stamp=stamp)
    summary["monthly_report_md"] = str(md_path)
    return summary


def write_monthly_report(
    df: pd.DataFrame,
    *,
    ticker: str,
    report_dir: Path,
    stamp: str,
) -> Path:
    """Aggregate daily strategy returns by calendar month."""
    work = df.copy()
    if work.index.name != "date" and "date" in work.columns:
        work["date"] = pd.to_datetime(work["date"], utc=True)
        work = work.set_index("date")
    work = work.sort_index()
    idx = work.index
    if isinstance(idx, pd.DatetimeIndex) and idx.tz is not None:
        work.index = idx.tz_convert("UTC").tz_localize(None)
    work["month"] = work.index.to_period("M")
    rows = []
    for m, g in work.groupby("month"):
        r = g["strategy_daily"].sum()
        rows.append({"month": str(m), "simple_sum_daily": float(r)})
    rep = pd.DataFrame(rows)
    path = report_dir / f"monthly_pnl_{ticker}_{stamp}.md"
    lines = [
        f"# Monthly P&L snapshot — {ticker}",
        "",
        f"_Generated {datetime.now(timezone.utc).isoformat()} UTC_",
        "",
        "| Month | Sum of daily strategy returns |",
        "|-------|--------------------------------|",
    ]
    for _, row in rep.iterrows():
        lines.append(f"| {row['month']} | {row['simple_sum_daily']*100:.2f}% |")
    lines.append("")
    lines.append(
        "> Note: sums of daily returns approximate performance for reporting sketches; "
        "use compounded equity for precise attribution."
    )
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def main() -> None:
    p = argparse.ArgumentParser(description="Cortex Capital 90-day backtest harness")
    p.add_argument("--ticker", default="SPY")
    p.add_argument("--days", type=int, default=90)
    args = p.parse_args()
    s = run_backtest(args.ticker, days=args.days)
    print(s)


if __name__ == "__main__":
    main()

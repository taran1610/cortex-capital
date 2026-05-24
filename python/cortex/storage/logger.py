"""Append-only trade log (CSV) — upgrade to Parquet/SQLite as you scale."""

from __future__ import annotations

import csv
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class TradeLogger:
    def __init__(self, file: str | Path | None = None) -> None:
        base = Path(__file__).resolve().parent.parent.parent / "data"
        base.mkdir(parents=True, exist_ok=True)
        self.file = Path(file) if file else base / "trades.csv"
        if not self.file.exists():
            self.file.write_text(
                "ts_utc,symbol,side,size,stop_loss,take_profit,notes\n",
                encoding="utf-8",
            )

    def log(self, trade: dict[str, Any]) -> None:
        ts = datetime.now(timezone.utc).isoformat()
        notes = trade.get("notes", "") or ""
        with self.file.open("a", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(
                [
                    ts,
                    trade.get("symbol", ""),
                    trade.get("side", ""),
                    trade.get("size", ""),
                    trade.get("stop_loss", ""),
                    trade.get("take_profit", ""),
                    notes,
                ]
            )

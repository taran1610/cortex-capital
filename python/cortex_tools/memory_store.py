"""
SQLite decision memory with optional sqlite-vec for similarity.

If sqlite-vec cannot load, we still persist JSON rows and return recent matches.
"""

from __future__ import annotations

import hashlib
import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv

load_dotenv()


def _db_path() -> Path:
    raw = os.getenv("CORTEX_MEMORY_PATH", "./data/cortex_memory.db")
    p = Path(raw)
    if not p.is_absolute():
        p = Path(__file__).resolve().parent.parent / raw
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def _embedding_stub(text: str, dim: int = 64) -> bytes:
    """Deterministic pseudo-embedding so sqlite-vec path works without extra models."""
    h = hashlib.sha256(text.encode("utf-8")).digest()
    vec = []
    for i in range(dim):
        vec.append(((h[i % len(h)] + i * 13) % 255) / 255.0 - 0.5)
    import struct

    return struct.pack(f"{dim}f", *vec)


class DecisionMemory:
    def __init__(self, path: Optional[Path] = None) -> None:
        self.path = path or _db_path()
        self._conn = sqlite3.connect(str(self.path), check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._vec_enabled = False
        try:
            self._conn.enable_load_extension(True)
            import sqlite_vec  # type: ignore

            sqlite_vec.load(self._conn)
            self._vec_enabled = True
        except Exception:
            self._vec_enabled = False
        self._init_schema()

    def _init_schema(self) -> None:
        cur = self._conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS decisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ts TEXT NOT NULL,
                ticker TEXT NOT NULL,
                action TEXT,
                confidence REAL,
                payload TEXT NOT NULL
            );
            """
        )
        if self._vec_enabled:
            try:
                cur.execute(
                    """
                    CREATE VIRTUAL TABLE IF NOT EXISTS decision_vec USING vec0(
                        embedding float[64],
                        +decision_id INTEGER
                    );
                    """
                )
            except sqlite3.OperationalError:
                self._vec_enabled = False
        self._conn.commit()

    def save(
        self,
        *,
        ticker: str,
        portfolio_decision: dict[str, Any],
        full_state_snapshot: Optional[dict[str, Any]] = None,
    ) -> None:
        ts = datetime.now(timezone.utc).isoformat()
        action = str(portfolio_decision.get("action", "")).upper()
        conf = float(portfolio_decision.get("confidence", 0) or 0)
        payload = json.dumps(
            {
                "portfolio_decision": portfolio_decision,
                "snapshot": full_state_snapshot,
            },
            default=str,
        )
        cur = self._conn.cursor()
        cur.execute(
            "INSERT INTO decisions (ts, ticker, action, confidence, payload) VALUES (?,?,?,?,?)",
            (ts, ticker.upper(), action, conf, payload),
        )
        rid = cur.lastrowid
        if self._vec_enabled and rid is not None:
            emb = _embedding_stub(ticker + "|" + action + "|" + payload[:2000])
            try:
                cur.execute(
                    "INSERT INTO decision_vec (embedding, decision_id) VALUES (?, ?)",
                    (emb, rid),
                )
            except sqlite3.OperationalError:
                pass
        self._conn.commit()

    def recent_similar(
        self, ticker: str, *, limit: int = 5
    ) -> list[dict[str, Any]]:
        cur = self._conn.cursor()
        cur.execute(
            """
            SELECT ts, ticker, action, confidence, payload
            FROM decisions
            WHERE ticker = ?
            ORDER BY id DESC
            LIMIT ?
            """,
            (ticker.upper(), limit),
        )
        rows = cur.fetchall()
        return [dict(r) for r in rows]

    def recent_feed(self, *, limit: int = 20) -> list[dict[str, Any]]:
        """Latest decisions across all tickers (for console activity feed)."""
        cur = self._conn.cursor()
        cur.execute(
            """
            SELECT ts, ticker, action, confidence, payload
            FROM decisions
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = cur.fetchall()
        return [dict(r) for r in rows]

    def close(self) -> None:
        self._conn.close()

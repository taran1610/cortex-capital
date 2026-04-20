"""HTTP bridge to local Crucix OSINT server (FRED, GDELT, satellites, etc.)."""

from __future__ import annotations

import os
from typing import Any

import requests
from dotenv import load_dotenv

load_dotenv()


def get_macro_signals(timeout: float = 12.0) -> dict[str, Any]:
    """
    Pulls Crucix `/api/data` JSON. When offline, returns a structured stub so UIs
    and agents degrade gracefully.
    """
    base = os.getenv("CRUCIX_URL", "http://127.0.0.1:3117").rstrip("/")
    url = f"{base}/api/data"
    try:
        r = requests.get(url, timeout=timeout)
        r.raise_for_status()
        data = r.json()
        if not isinstance(data, dict):
            return {"status": "unexpected_shape", "raw": data}
        return {
            "source": "crucix",
            "url": url,
            "delta": data.get("sweep_delta", data.get("delta", {})),
            "macro": data.get("risk_gauges", data.get("macro", {})),
            "ideas": data.get("llm_trade_ideas", data.get("ideas", [])),
            "meta": {k: data[k] for k in data if k in ("ts", "timestamp", "version")},
        }
    except requests.RequestException as exc:
        return {
            "status": "Crucix offline — macro layer skipped",
            "error": str(exc),
            "url": url,
            "delta": {},
            "macro": {},
            "ideas": [],
        }

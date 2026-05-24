"""JSON-safe views of LangGraph `CortexState` for HTTP clients (Next.js dashboard)."""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any

import numpy as np
import pandas as pd


def _jsonable(obj: Any) -> Any:
    if obj is None or isinstance(obj, (bool, int, float, str)):
        return obj
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {str(k): _jsonable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_jsonable(v) for v in obj]
    if isinstance(obj, np.generic):
        try:
            return obj.item()
        except Exception:
            return str(obj)
    if isinstance(obj, pd.DataFrame):
        if obj.empty:
            return []
        # Cap rows for API payload size
        return obj.tail(400).replace({np.nan: None}).to_dict(orient="records")
    if isinstance(obj, pd.Series):
        return obj.head(500).replace({np.nan: None}).to_dict()
    return str(obj)


def swarm_state_for_api(state: dict[str, Any]) -> dict[str, Any]:
    """
    Return a deep JSON-friendly copy of the graph output.
    Strips/replaces non-serializable objects (e.g. price DataFrames).
    """
    out: dict[str, Any] = {}
    for k, v in state.items():
        if k == "research_bundle" and isinstance(v, dict):
            rb = dict(v)
            if isinstance(rb.get("price_frame"), pd.DataFrame):
                rb["price_frame"] = _jsonable(rb["price_frame"])
            out[k] = _jsonable(rb)
        else:
            out[k] = _jsonable(v)
    return _jsonable(out)

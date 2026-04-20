"""
Cortex Capital — entry point for the LangGraph swarm (CLI).

The Streamlit dashboard imports `graph.workflow` directly so this file stays
thin and free of circular imports.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from dotenv import load_dotenv

_ROOT = Path(__file__).resolve().parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

load_dotenv(_ROOT / ".env")

from graph.workflow import run_swarm  # noqa: E402


def main() -> None:
    p = argparse.ArgumentParser(
        description="Run the Cortex Capital AI-native hedge fund swarm for one ticker."
    )
    p.add_argument("--ticker", default="NVDA", help="US equity symbol")
    p.add_argument("--json", action="store_true", help="Print full state as JSON")
    args = p.parse_args()

    result = run_swarm(args.ticker)
    if args.json:
        # Drop non-serializable / bulky keys
        slim = {k: v for k, v in result.items() if k != "research_bundle"}
        rb = result.get("research_bundle") or {}
        if isinstance(rb, dict):
            slim["research_bundle"] = {
                k: v
                for k, v in rb.items()
                if k != "price_frame"
            }
            px = rb.get("price_frame")
            if hasattr(px, "tail"):
                slim["research_bundle"]["price_tail"] = px.tail(5).to_dict(orient="records")
        print(json.dumps(slim, default=str, indent=2))
        return

    print("CORTEX CAPITAL — portfolio decision")
    print(json.dumps(result.get("portfolio_decision"), indent=2, default=str))
    print("\nMacro (Crucix):", result.get("macro", {}).get("status") or "live JSON")
    for line in result.get("log") or []:
        print(" ·", line)


if __name__ == "__main__":
    main()

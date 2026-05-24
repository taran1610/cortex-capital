"""python -m cortex — run the Phase-1 modular kernel demo."""

from __future__ import annotations

import argparse
import json

from cortex.orchestrator import run


def main() -> None:
    p = argparse.ArgumentParser(description="Cortex modular kernel (Phase 1)")
    p.add_argument("--symbol", default="GC=F", help="Ticker (equities or yfinance-style futures e.g. GC=F)")
    p.add_argument("--period", default="3mo")
    p.add_argument("--balance", type=float, default=10_000.0)
    p.add_argument(
        "--execution",
        choices=("mock", "ibkr"),
        default=None,
        help="Override CORTEX_EXECUTION_BACKEND (default mock; ibkr needs TWS paper + IBKR_AUTO_TRADE for live orders)",
    )
    args = p.parse_args()
    result = run(
        symbol=args.symbol,
        period=args.period,
        balance=args.balance,
        execution_backend=args.execution,
    )
    print(json.dumps(result, indent=2, default=str))


if __name__ == "__main__":
    main()

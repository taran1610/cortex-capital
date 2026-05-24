import pandas as pd

import cortex.orchestrator as orch


def test_run_no_data(monkeypatch):
    monkeypatch.setattr(
        "cortex.orchestrator.MarketData.fetch",
        lambda self, period="3mo": pd.DataFrame(),
    )
    out = orch.run(symbol="ZZZZZ", period="3mo", execution_backend="mock")
    assert out["status"] == "no_data"


def test_run_mock_hold(monkeypatch):
    df = pd.DataFrame({"Close": [100.0] * 30})
    monkeypatch.setattr(
        "cortex.orchestrator.MarketData.fetch",
        lambda self, period="3mo": df,
    )
    out = orch.run(symbol="SPY", period="3mo", execution_backend="mock")
    assert out["status"] == "ok"
    assert out["execution_backend"] == "mock"
    assert out["signal"] == "HOLD"


def test_run_ibkr_without_tws(monkeypatch):
    """IBKR path returns structured failure when TWS is not reachable."""
    df = pd.DataFrame({"Close": [20.0] * 30})  # flat → HOLD actually
    # Force a BUY: last RSI oversold — use declining closes
    closes = [100 - i * 2 for i in range(30)][::-1]
    df = pd.DataFrame({"Close": closes})
    monkeypatch.setattr(
        "cortex.orchestrator.MarketData.fetch",
        lambda self, period="3mo": df,
    )

    def fake_signal(self, frame):
        return "BUY"

    monkeypatch.setattr("cortex.orchestrator.RSIStrategy.generate_signal", fake_signal)

    out = orch.run(symbol="SPY", period="3mo", execution_backend="ibkr")
    assert out["status"] == "ok"
    assert out["execution_backend"] == "ibkr"
    trade = out.get("trade", {})
    assert trade.get("placed") is False or "reason" in trade

import pandas as pd

from cortex.data.market_data import MarketData, _normalize_ohlcv_df


def test_normalize_ohlcv_df_lowercase_close():
    df = pd.DataFrame({"close": [1.0, 2.0, 3.0]})
    out = _normalize_ohlcv_df(df)
    assert "Close" in out.columns
    assert len(out) == 3


def test_normalize_ohlcv_df_empty():
    assert _normalize_ohlcv_df(pd.DataFrame()).empty


def test_market_data_fetch_monkeypatched(monkeypatch):
    def fake_history(sym: str, days: int, provider: str = "yfinance"):
        return pd.DataFrame(
            {
                "date": pd.date_range("2024-01-01", periods=40, freq="D"),
                "close": range(40),
            }
        )

    monkeypatch.setattr(
        "cortex_tools.openbb_tools.get_price_history",
        fake_history,
    )
    md = MarketData(symbol="SPY")
    df = md.fetch(period="3mo")
    assert not df.empty
    assert "Close" in df.columns

from cortex.data.symbols import (
    ibkr_kernel_equity_symbol,
    infer_asset_kind,
    normalize_feed_symbol,
    period_to_lookback_days,
)


def test_normalize_feed_symbol():
    assert normalize_feed_symbol("  spy  ") == "SPY"
    assert normalize_feed_symbol("gc=f") == "GC=F"


def test_infer_asset_kind():
    assert infer_asset_kind("SPY") == "equity"
    assert infer_asset_kind("BRK.B") == "equity"
    assert infer_asset_kind("GC=F") == "yf_continuous_future"


def test_ibkr_kernel_equity_symbol():
    assert ibkr_kernel_equity_symbol("SPY") == "SPY"
    assert ibkr_kernel_equity_symbol("GC=F") is None


def test_period_to_lookback_days():
    assert period_to_lookback_days("3mo") >= 90
    assert period_to_lookback_days("30d") >= 30

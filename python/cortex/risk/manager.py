"""Position sizing — risk budget per trade (generic units)."""


class RiskManager:
    def __init__(self, risk_per_trade: float = 0.01):
        """
        risk_per_trade: fraction of balance to risk (e.g. 0.01 = 1%).
        stop_loss_pips * pip_value: dollars (or contract $) at risk per unit.
        """

        self.risk_per_trade = risk_per_trade

    def position_size(self, balance: float, stop_loss_pips: float, pip_value: float) -> float:
        if stop_loss_pips <= 0 or pip_value <= 0:
            return 0.0
        risk_amount = balance * self.risk_per_trade
        size = risk_amount / (stop_loss_pips * pip_value)
        return round(size, 4)

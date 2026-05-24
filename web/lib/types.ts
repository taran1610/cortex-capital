export interface TradeRow {
  id: string;
  ts: number;
  symbol: string;
  direction: "LONG" | "SHORT";
  size: string;
  status: "FILLED" | "REJECTED" | "PENDING";
  pnl: number;
  scenarioId: string;
}

export interface PersonaScore {
  id: string;
  name: string;
  archetype: string;
  emoji: string;
  winRate: number;
  debates: number;
}

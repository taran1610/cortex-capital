import type { ChatMessage, ProposedTrade } from "@/lib/mockData";
import type { TradeRow } from "@/lib/types";
import { LEGEND_DISPLAY } from "@/lib/legendMappings";

export type PythonSwarmResponse = {
  ok: boolean;
  ticker: string;
  state: Record<string, unknown>;
  meta?: Record<string, unknown>;
  error?: string;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function summarizeResearch(rb: Record<string, unknown> | null): string {
  if (!rb) return "Research bundle empty.";
  const keys = Object.keys(rb).filter((k) => k !== "price_frame");
  const status = rb.status ?? rb.error;
  return (
    `OpenBB / yfinance research keys: ${keys.slice(0, 12).join(", ")}` +
    (keys.length > 12 ? "…" : "") +
    (status != null ? `\nStatus: ${String(status)}` : "")
  );
}

export function mapPythonSwarmToClient(
  res: PythonSwarmResponse
): {
  messages: ChatMessage[];
  proposedTrades: ProposedTrade[];
  riskApproved: boolean | null;
  riskNote: string;
  varImpact: string;
  marginNote: string;
  correlationNote: string;
  tradeRow: TradeRow | null;
  pnlDelta: number;
} {
  const st = res.state || {};
  const ticker = String(res.ticker || st.ticker || "TICKER").toUpperCase();
  const messages: ChatMessage[] = [];

  const rb = asRecord(st.research_bundle as unknown);
  const macro = asRecord(st.macro as unknown);

  messages.push({
    id: uid(),
    ts: Date.now(),
    agentId: "researcher",
    agentName: "Researcher",
    role: "OpenBB + Crucix",
    content:
      summarizeResearch(rb) +
      (macro
        ? `\n\nMacro / OSINT (Crucix): ${JSON.stringify(macro).slice(0, 2800)}`
        : ""),
    variant: "researcher",
  });

  const rounds = Array.isArray(st.debate_rounds) ? st.debate_rounds : [];
  for (const rnd of rounds) {
    const r = asRecord(rnd as unknown);
    const votes = Array.isArray(r?.votes) ? r!.votes : [];
    for (const v of votes) {
      const vr = asRecord(v as unknown);
      const key = String(vr?.persona_key ?? "persona");
      const name = LEGEND_DISPLAY[key] ?? key.replace(/_/g, " ");
      const stance = String(vr?.stance ?? "HOLD");
      const conf = Number(vr?.confidence ?? 0);
      const reason = String(vr?.reason ?? "");
      messages.push({
        id: uid(),
        ts: Date.now(),
        agentId: key,
        agentName: name,
        role: stance,
        content: `${stance} (${conf}%) — ${reason}`,
        variant: "debater",
      });
    }
  }

  const critique = String(st.dexter_critique ?? "");
  if (critique) {
    messages.push({
      id: uid(),
      ts: Date.now(),
      agentId: "dexter-critic",
      agentName: "Dexter · Critic",
      role: "Reflection (virattt/dexter-style)",
      content: critique.slice(0, 12000),
      variant: "debater",
    });
  }
  const revisionRaw = String(st.dexter_revision ?? "");
  if (revisionRaw) {
    messages.push({
      id: uid(),
      ts: Date.now(),
      agentId: "dexter-revise",
      agentName: "Dexter · Revised thesis",
      role: "Synthesis",
      content: revisionRaw.slice(0, 12000),
      variant: "debater",
    });
  }

  const proposal = asRecord(st.trader_proposal as unknown) ?? {};
  messages.push({
    id: uid(),
    ts: Date.now(),
    agentId: "trader",
    agentName: "Trader",
    role: "LangGraph node",
    content: `Proposal: ${JSON.stringify(proposal, null, 2).slice(0, 8000)}`,
    variant: "trader",
  });

  const risk = asRecord(st.risk_assessment as unknown) ?? {};
  const vol = Number(risk.annualized_vol ?? 0);
  const notes = Array.isArray(risk.notes)
    ? (risk.notes as unknown[]).map(String).join(" ")
    : "";
  const approved = Boolean(risk.approved ?? true);
  messages.push({
    id: uid(),
    ts: Date.now(),
    agentId: "risk",
    agentName: "Risk Manager",
    role: "Vol + macro overlay",
    content: `Approved=${approved}. Adj action ${String(risk.adjusted_action ?? proposal.action)} @ ${String(risk.adjusted_confidence ?? proposal.confidence)}. Vol=${vol}. ${notes}`,
    variant: "risk",
  });

  const pm = asRecord(st.portfolio_decision as unknown) ?? {};
  const finalAction = String(pm.action ?? proposal.action ?? "HOLD").toUpperCase();
  const conf = Number(pm.confidence ?? proposal.confidence ?? 50);
  messages.push({
    id: uid(),
    ts: Date.now(),
    agentId: "pm",
    agentName: "Portfolio Manager",
    role: "Final book",
    content: String(st.decision ?? JSON.stringify(pm, null, 2)).slice(0, 12000),
    variant: "system",
  });

  const proposedTrades: ProposedTrade[] = [];
  if (finalAction === "BUY" || finalAction === "SELL") {
    proposedTrades.push({
      symbol: ticker,
      direction: finalAction === "BUY" ? "LONG" : "SHORT",
      instrument: "Equity (paper)",
      size: "1x notional sleeve",
      price: "MKT",
      conviction: Math.min(95, Math.max(35, Math.round(conf))),
      rationale: String(pm.reasoning ?? proposal.execution_notes ?? "LangGraph PM output"),
    });
  }

  const riskApproved = finalAction === "BUY" || finalAction === "SELL";
  const riskNote = notes || (riskApproved ? "Book within policy." : "Flat / HOLD — no directional risk.");

  const log = Array.isArray(st.log) ? st.log.map(String) : [];
  messages.push({
    id: uid(),
    ts: Date.now(),
    agentId: "system",
    agentName: "Execution",
    role: "SQLite memory + log",
    content: `Graph log:\n${log.slice(-12).join("\n")}`,
    variant: "system",
  });

  let tradeRow: TradeRow | null = null;
  let pnlDelta = 0;
  if (riskApproved && proposedTrades.length) {
    pnlDelta = Math.round((conf / 100) * 4000 * (finalAction === "SELL" ? -0.4 : 1));
    tradeRow = {
      id: uid(),
      ts: Date.now(),
      symbol: ticker,
      direction: proposedTrades[0]!.direction,
      size: proposedTrades[0]!.size,
      status: "FILLED",
      pnl: pnlDelta,
      scenarioId: "langgraph",
    };
  }

  return {
    messages,
    proposedTrades,
    riskApproved,
    riskNote,
    varImpact: `Est. ann. vol ${(vol * 100).toFixed(1)}%`,
    marginNote: "See IBKR / SPAN when wired",
    correlationNote: "Cross-asset correlation from macro blob (Crucix)",
    tradeRow,
    pnlDelta,
  };
}

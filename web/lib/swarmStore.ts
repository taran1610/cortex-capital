"use client";

import { create } from "zustand";
import {
  type ChatMessage,
  type CycleStep,
  type ProposedTrade,
  PERSONAS,
  scenarioAtIndex,
  buildEquitySeries,
  INITIAL_METRICS,
  SEED_TRADES,
} from "@/lib/mockData";
import { mapPythonSwarmToClient, type PythonSwarmResponse } from "@/lib/mapPythonSwarm";
import type { PersonaScore, TradeRow } from "@/lib/types";

export type { PersonaScore, TradeRow } from "@/lib/types";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface SwarmState {
  cycleStep: CycleStep;
  isRunning: boolean;
  /** When true, POST /api/swarm → Python LangGraph (`graph/workflow.py`). */
  realLlmMode: boolean;
  /** Ticker sent to Python `/swarm/run` in real mode. */
  backendTicker: string;
  scenarioIndex: number;
  messages: ChatMessage[];
  proposedTrades: ProposedTrade[];
  riskApproved: boolean | null;
  riskNote: string;
  varImpact: string;
  marginNote: string;
  correlationNote: string;
  equitySeries: { day: string; eq: number; dd: number }[];
  todayPnl: number;
  sharpe30: number;
  maxDrawdown: number;
  winRate: number;
  nav: number;
  tradeHistory: TradeRow[];
  personaScores: PersonaScore[];
  cyclesCompleted: number;
  sidebarOpen: boolean;
  lastBackendMeta: Record<string, unknown> | null;

  setRealLlmMode: (v: boolean) => void;
  setBackendTicker: (t: string) => void;
  setSidebarOpen: (v: boolean) => void;
  pushMessage: (m: Omit<ChatMessage, "id" | "ts">) => void;
  resetCycleUi: () => void;
  runFullSwarmCycle: () => Promise<void>;
  bumpTickerNav: () => void;
}

function initialPersonaScores(): PersonaScore[] {
  return PERSONAS.map((p, i) => ({
    id: p.id,
    name: p.name,
    archetype: p.archetype,
    emoji: p.emoji,
    debates: 40 + (i * 3) % 25,
    winRate: 44 + (i * 7) % 18,
  }));
}

export const useSwarmStore = create<SwarmState>((set, get) => ({
  cycleStep: "idle",
  isRunning: false,
  realLlmMode: false,
  backendTicker: "SPY",
  scenarioIndex: 0,
  messages: [],
  proposedTrades: [],
  riskApproved: null,
  riskNote: "",
  varImpact: "—",
  marginNote: "—",
  correlationNote: "—",
  equitySeries: buildEquitySeries(7),
  todayPnl: INITIAL_METRICS.todayPnl,
  sharpe30: INITIAL_METRICS.sharpe30,
  maxDrawdown: INITIAL_METRICS.maxDrawdown,
  winRate: INITIAL_METRICS.winRate,
  nav: INITIAL_METRICS.nav,
  tradeHistory: SEED_TRADES,
  personaScores: initialPersonaScores(),
  cyclesCompleted: 0,
  sidebarOpen: false,
  lastBackendMeta: null,

  setRealLlmMode: (v) => set({ realLlmMode: v }),
  setBackendTicker: (t) =>
    set({ backendTicker: t.trim().toUpperCase() || "SPY" }),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),

  pushMessage: (m) =>
    set((s) => ({
      messages: [...s.messages, { ...m, id: uid(), ts: Date.now() }],
    })),

  resetCycleUi: () =>
    set({
      messages: [],
      proposedTrades: [],
      riskApproved: null,
      riskNote: "",
      varImpact: "—",
      marginNote: "—",
      correlationNote: "—",
    }),

  bumpTickerNav: () =>
    set((s) => {
      const wiggle = (Math.random() - 0.5) * 0.0004 * s.nav;
      return { nav: Math.round(s.nav + wiggle) };
    }),

  runFullSwarmCycle: async () => {
    if (get().isRunning) return;

    if (get().realLlmMode) {
      get().resetCycleUi();
      set({
        isRunning: true,
        cycleStep: "researcher",
        lastBackendMeta: null,
      });
      get().pushMessage({
        agentId: "system",
        agentName: "Orchestrator",
        role: "Next.js → Python",
        content: `POST /api/swarm with ticker **${get().backendTicker}** → FastAPI \`POST /swarm/run\` (LangGraph: researcher → 18-persona debate → Dexter reflection → trader → risk → PM → memory).`,
        variant: "system",
      });

      try {
        const res = await fetch("/api/swarm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker: get().backendTicker }),
          signal: AbortSignal.timeout(240_000),
        });
        const raw = (await res.json()) as PythonSwarmResponse & {
          detail?: unknown;
          error?: string;
        };
        if (!res.ok || raw.ok === false) {
          const d = raw.detail;
          const detail =
            typeof d === "string"
              ? d
              : d != null
                ? JSON.stringify(d)
                : raw.error ||
                  (typeof raw === "object" ? JSON.stringify(raw) : res.statusText);
          throw new Error(detail);
        }

        set({ cycleStep: "debate" });
        await delay(200);
        set({ cycleStep: "trader" });
        await delay(150);
        set({ cycleStep: "risk" });
        await delay(150);
        set({ cycleStep: "executed" });
        await delay(200);

        const mapped = mapPythonSwarmToClient(raw);
        const head = get().messages.slice();
        const extra: ChatMessage[] = [];
        if (mapped.tradeRow) {
          extra.push({
            id: uid(),
            ts: Date.now(),
            agentId: "system",
            agentName: "Execution",
            role: "Paper broker",
            content:
              "Paper fill simulated from LangGraph PM action. TODO: IBKR adapter for real paper.",
            variant: "system",
          });
        }

        set((s) => {
          const approved = Boolean(mapped.riskApproved);
          const boost = approved ? 1 : 0.12;
          const pnl = mapped.pnlDelta * boost;
          const rows = mapped.tradeRow
            ? [mapped.tradeRow, ...s.tradeHistory]
            : s.tradeHistory;

          const personaScores = s.personaScores.map((ps) => ({
            ...ps,
            debates: ps.debates + 1,
            winRate: Math.min(
              74,
              Math.max(36, ps.winRate + (approved ? 0.35 : -0.08))
            ),
          }));

          return {
            messages: [...head, ...mapped.messages, ...extra],
            proposedTrades: mapped.proposedTrades,
            riskApproved: mapped.riskApproved,
            riskNote: mapped.riskNote,
            varImpact: mapped.varImpact,
            marginNote: mapped.marginNote,
            correlationNote: mapped.correlationNote,
            tradeHistory: rows.slice(0, 80),
            todayPnl: Math.round(s.todayPnl + pnl),
            winRate: Math.round((s.winRate + (approved ? 0.25 : -0.05)) * 10) / 10,
            sharpe30: Math.round((s.sharpe30 + (approved ? 0.015 : -0.008)) * 1000) / 1000,
            maxDrawdown: Math.round((s.maxDrawdown + (approved ? 0.04 : -0.01)) * 10) / 10,
            nav: s.nav + Math.round(pnl * 0.9),
            equitySeries: buildEquitySeries(s.scenarioIndex + s.cyclesCompleted + 19),
            personaScores,
            cyclesCompleted: s.cyclesCompleted + 1,
            lastBackendMeta: (raw.meta as Record<string, unknown>) ?? null,
            isRunning: false,
            cycleStep: "idle",
          };
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        get().pushMessage({
          agentId: "system",
          agentName: "Orchestrator",
          role: "Error",
          content: `**LangGraph backend failed.** ${msg}\n\nUncheck *Real LLM mode* to run the browser mock, or start Python: \`cd python && uvicorn api.app:app --host 0.0.0.0 --port 8800\`.`,
          variant: "system",
        });
        set({ isRunning: false, cycleStep: "idle" });
      }
      return;
    }

    /* ——— Mock swarm (Dexter / ai-hedge-fund–style UX without Python) ——— */
    set({
      isRunning: true,
      cycleStep: "researcher",
    });
    get().resetCycleUi();

    const idx = get().scenarioIndex;
    const scenario = scenarioAtIndex(idx);

    await delay(3000);

    get().pushMessage({
      agentId: "researcher",
      agentName: "Researcher",
      role: "Market intelligence",
      content: scenario.researcherBrief,
      variant: "researcher",
    });
    set({ cycleStep: "debate" });

    const debateMap = new Map(scenario.debateLines.map((d) => [d.personaId, d.content]));
    for (let i = 0; i < PERSONAS.length; i++) {
      const p = PERSONAS[i]!;
      const content = debateMap.get(p.id) ?? p.oneLiner;
      get().pushMessage({
        agentId: p.id,
        agentName: p.name,
        role: p.archetype,
        content,
        variant: "debater",
      });
      await delay(160 + (i % 4) * 20);
    }

    set({ cycleStep: "trader" });
    await delay(600);

    for (const t of scenario.trades) {
      get().pushMessage({
        agentId: "trader",
        agentName: "Trader",
        role: "Execution desk",
        content: `${t.direction} ${t.size} ${t.instrument} (${t.symbol}) @ ${t.price} — ${t.rationale} (conviction ${t.conviction}%)`,
        variant: "trader",
      });
    }
    set({ proposedTrades: scenario.trades });

    await delay(700);
    set({ cycleStep: "risk" });

    const approved = scenario.riskApproved;
    get().pushMessage({
      agentId: "risk",
      agentName: "Risk Manager",
      role: "Desk limits",
      content: `${approved ? "✅ APPROVED" : "⛔ REJECTED"} — ${scenario.riskNote}`,
      variant: "risk",
    });
    set({
      riskApproved: approved,
      riskNote: scenario.riskNote,
      varImpact: scenario.varImpact,
      marginNote: scenario.marginNote,
      correlationNote: scenario.correlationNote,
    });

    await delay(600);
    set({ cycleStep: "executed" });
    await delay(450);

    const ts = Date.now();
    const rows: TradeRow[] = scenario.trades.map((t, j) => ({
      id: `${uid()}-${j}`,
      ts,
      symbol: t.symbol,
      direction: t.direction,
      size: t.size,
      status: approved ? "FILLED" : "REJECTED",
      pnl: approved ? Math.round(scenario.pnlDelta / scenario.trades.length) : 0,
      scenarioId: scenario.id,
    }));

    set((s) => {
      const boost = approved ? 1 : 0.15;
      const newToday = s.todayPnl + scenario.pnlDelta * boost;
      const newWin = s.winRate + (approved ? 0.4 : -0.1);
      const newSharpe = s.sharpe30 + (approved ? 0.02 : -0.01);
      const newMaxDd = s.maxDrawdown + (approved ? 0.05 : -0.02);
      const newNav = s.nav + Math.round(scenario.pnlDelta * boost * 0.85);

      const nextEq = buildEquitySeries(s.scenarioIndex + s.cyclesCompleted + 13);
      const mergedHistory = [...rows, ...s.tradeHistory].slice(0, 80);

      const personaScores = s.personaScores.map((ps) => {
        const debated = scenario.debateLines.some((d) => d.personaId === ps.id);
        const delta = approved ? (debated ? 1.2 : 0.4) : debated ? -0.3 : 0.1;
        const wr = Math.min(72, Math.max(38, ps.winRate + delta));
        return {
          ...ps,
          winRate: Math.round(wr * 10) / 10,
          debates: ps.debates + 1,
        };
      });

      return {
        tradeHistory: mergedHistory,
        todayPnl: Math.round(newToday),
        winRate: Math.round(newWin * 10) / 10,
        sharpe30: Math.round(newSharpe * 100) / 100,
        maxDrawdown: Math.round(newMaxDd * 10) / 10,
        nav: newNav,
        equitySeries: nextEq,
        personaScores,
        cyclesCompleted: s.cyclesCompleted + 1,
        scenarioIndex: s.scenarioIndex + 1,
        isRunning: false,
        cycleStep: "idle",
      };
    });

    get().pushMessage({
      agentId: "system",
      agentName: "Execution",
      role: "Paper broker",
      content: approved
        ? "Paper fills logged to ledger. P&L and risk analytics updated."
        : "No fill — risk rejection. Flat risk; playbook archived.",
      variant: "system",
    });
  },
}));

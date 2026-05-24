"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  PanelLeftClose,
  PanelLeft,
  Play,
  Radio,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHeader } from "@/components/PageHeader";
import { SwarmCycle } from "@/components/SwarmCycle";
import { AgentChat } from "@/components/AgentChat";
import { TradeCard } from "@/components/TradeCard";
import { PerformanceChart } from "@/components/PerformanceChart";
import { DebaterPanel } from "@/components/DebaterPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSwarmStore } from "@/lib/swarmStore";
import { cn } from "@/lib/utils";

type SortKey = "ts" | "symbol" | "pnl";

export default function DashboardPage() {
  const cycleStep = useSwarmStore((s) => s.cycleStep);
  const isRunning = useSwarmStore((s) => s.isRunning);
  const messages = useSwarmStore((s) => s.messages);
  const proposedTrades = useSwarmStore((s) => s.proposedTrades);
  const riskApproved = useSwarmStore((s) => s.riskApproved);
  const varImpact = useSwarmStore((s) => s.varImpact);
  const marginNote = useSwarmStore((s) => s.marginNote);
  const correlationNote = useSwarmStore((s) => s.correlationNote);
  const equitySeries = useSwarmStore((s) => s.equitySeries);
  const personaScores = useSwarmStore((s) => s.personaScores);
  const tradeHistory = useSwarmStore((s) => s.tradeHistory);
  const runFullSwarmCycle = useSwarmStore((s) => s.runFullSwarmCycle);
  const realLlmMode = useSwarmStore((s) => s.realLlmMode);
  const setRealLlmMode = useSwarmStore((s) => s.setRealLlmMode);
  const backendTicker = useSwarmStore((s) => s.backendTicker);
  const setBackendTicker = useSwarmStore((s) => s.setBackendTicker);
  const lastBackendMeta = useSwarmStore((s) => s.lastBackendMeta);
  const cyclesCompleted = useSwarmStore((s) => s.cyclesCompleted);
  const sidebarOpen = useSwarmStore((s) => s.sidebarOpen);
  const setSidebarOpen = useSwarmStore((s) => s.setSidebarOpen);

  const [sortKey, setSortKey] = useState<SortKey>("ts");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sortedTrades = useMemo(() => {
    const arr = [...tradeHistory];
    arr.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortKey === "ts") return (a.ts - b.ts) * mul;
      if (sortKey === "symbol") return a.symbol.localeCompare(b.symbol) * mul;
      return (a.pnl - b.pnl) * mul;
    });
    return arr;
  }, [tradeHistory, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir(k === "symbol" ? "asc" : "desc");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav />
      <main className="relative flex-1 overflow-x-hidden" id="swarm">
        <div
          className="pointer-events-none absolute left-1/4 top-32 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/[0.07] blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-48 h-72 w-72 translate-x-1/3 rounded-full bg-violet-600/[0.09] blur-[110px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1600px] px-4 py-8 md:px-6 md:py-10">
          <PageHeader
            kicker="Command surface"
            title="Swarm console"
            description="Full loop in one view — research, eighteen voices, trader intent, risk, and paper fills. Toggle LangGraph when your Python API is running."
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-expanded={sidebarOpen}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="size-4" />
                ) : (
                  <PanelLeft className="size-4" />
                )}
                Pipeline
              </Button>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#0c1019]/90 px-3.5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-wide text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <input
                  type="checkbox"
                  className="size-3.5 accent-cyan-400"
                  checked={realLlmMode}
                  onChange={(e) => setRealLlmMode(e.target.checked)}
                />
                LangGraph live
              </label>
              {realLlmMode && (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                    Tkr
                  </span>
                  <Input
                    value={backendTicker}
                    onChange={(e) => setBackendTicker(e.target.value)}
                    className="h-9 w-28 uppercase"
                    maxLength={16}
                    placeholder="SPY"
                    aria-label="Backend ticker"
                  />
                </div>
              )}
            </div>
          </PageHeader>

          <p className="-mt-2 mb-8 font-mono text-[10px] text-slate-600">
            Cycles completed this session:{" "}
            <span className="text-slate-400">{cyclesCompleted}</span>
          </p>

          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,260px)_1fr_minmax(0,300px)]">
            <aside className="hidden lg:block">
              <SwarmCycle
                cycleStep={cycleStep}
                isRunning={isRunning}
                cyclesCompleted={cyclesCompleted}
              />
            </aside>

            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-[#06080f]/80 backdrop-blur-sm lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.aside
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="fixed left-0 top-0 z-50 h-full w-[280px] overflow-y-auto border-r border-white/[0.08] bg-[#0a0d14]/98 p-5 shadow-[24px_0_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl lg:hidden"
                >
                  <SwarmCycle
                    cycleStep={cycleStep}
                    isRunning={isRunning}
                    cyclesCompleted={cyclesCompleted}
                  />
                </motion.aside>
              )}
            </AnimatePresence>

            <div className="min-w-0 space-y-4">
              {lastBackendMeta && (
                <details className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/20 to-[#0c1019]/80 px-4 py-3 text-[11px] text-slate-500 shadow-[0_0_40px_-20px_rgba(139,92,246,0.35)]">
                  <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-wider text-violet-300/90">
                    Integration map (last run)
                  </summary>
                  <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-[#06080f]/90 p-3 font-mono text-[10px] text-slate-400 ring-1 ring-white/[0.05]">
                    {JSON.stringify(lastBackendMeta, null, 2)}
                  </pre>
                </details>
              )}
              <DebaterPanel />
              <AgentChat messages={messages} />
            </div>

            <div className="min-w-0 space-y-4">
              <TradeCard trades={proposedTrades} riskApproved={riskApproved} />
              <div className="saas-panel border-emerald-500/15 bg-gradient-to-b from-emerald-950/12 to-transparent p-5 shadow-[0_0_48px_-24px_rgba(16,185,129,0.15)]">
                <p className="saas-kicker text-emerald-300/90">Risk desk</p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-2 border-b border-white/[0.04] pb-2">
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                      VaR
                    </dt>
                    <dd className="font-mono text-slate-100">{varImpact}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-white/[0.04] pb-2">
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                      Margin
                    </dt>
                    <dd className="text-right font-mono text-xs text-slate-300">
                      {marginNote}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                      Corr
                    </dt>
                    <dd className="text-right text-xs leading-snug text-slate-400">
                      {correlationNote}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 font-mono text-[9px] leading-relaxed text-slate-600">
                  Mock risk — swap for live SPAN / cross-margin.
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="perf" className="mt-12">
            <TabsList className="w-full justify-start overflow-x-auto md:w-auto">
              <TabsTrigger value="perf">Performance</TabsTrigger>
              <TabsTrigger value="board">Leaderboard</TabsTrigger>
              <TabsTrigger value="history">Ledger</TabsTrigger>
            </TabsList>
            <TabsContent value="perf" className="saas-panel p-5 md:p-6">
              <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-600">
                30 sessions · equity vs drawdown %
              </p>
              <PerformanceChart data={equitySeries} />
            </TabsContent>
            <TabsContent value="board" className="saas-panel p-5 md:p-6">
              <ul className="max-h-[380px] space-y-4 overflow-y-auto pr-1">
                {personaScores
                  .slice()
                  .sort((a, b) => b.winRate - a.winRate)
                  .map((p) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-[#0c1019]/90 text-lg">
                        {p.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-display text-sm font-semibold tracking-tight text-slate-100">
                            {p.name}
                          </span>
                          <span className="font-mono text-xs font-semibold text-cyan-300">
                            {p.winRate}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-600 via-cyan-500 to-emerald-400"
                            style={{ width: `${p.winRate}%` }}
                          />
                        </div>
                        <p className="mt-1 font-mono text-[10px] text-slate-600">
                          {p.archetype} · {p.debates} debates
                        </p>
                      </div>
                    </li>
                  ))}
              </ul>
            </TabsContent>
            <TabsContent value="history" className="saas-panel p-1">
              <div className="flex flex-wrap gap-2 border-b border-white/[0.06] p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSort("ts")}
                  className="text-xs"
                >
                  Time{" "}
                  {sortKey === "ts" ? (
                    sortDir === "asc" ? (
                      <ArrowUpAZ className="inline size-3" />
                    ) : (
                      <ArrowDownAZ className="inline size-3" />
                    )
                  ) : null}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSort("symbol")}
                  className="text-xs"
                >
                  Symbol
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSort("pnl")}
                  className="text-xs"
                >
                  P&amp;L
                </Button>
              </div>
              <div className="overflow-x-auto p-2">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="px-3 py-3">Time</th>
                      <th className="px-3 py-3">Symbol</th>
                      <th className="px-3 py-3">Dir</th>
                      <th className="px-3 py-3">Size</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3 text-right">P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTrades.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-white/[0.05] transition hover:bg-white/[0.03]"
                      >
                        <td className="px-3 py-2 font-mono text-xs text-slate-400">
                          {new Date(row.ts).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-200">
                          {row.symbol}
                        </td>
                        <td className="px-3 py-2">
                          {row.direction === "LONG" ? (
                            <Badge variant="success">{row.direction}</Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-300">
                              {row.direction}
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-400">
                          {row.size}
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline">{row.status}</Badge>
                        </td>
                        <td
                          className={cn(
                            "px-3 py-2 text-right font-mono text-xs",
                            row.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                          )}
                        >
                          {row.pnl >= 0 ? "+" : ""}
                          {row.pnl.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <motion.button
          type="button"
          layout
          disabled={isRunning}
          onClick={() => void runFullSwarmCycle()}
          className={cn(
            "group fixed bottom-6 right-6 z-30 flex items-center gap-3 rounded-2xl border border-cyan-400/35 bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-400 px-6 py-4 font-display text-sm font-bold tracking-tight text-[#06080f] shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset,0_8px_32px_rgba(34,211,238,0.35),0_0_80px_-20px_rgba(34,211,238,0.45)] transition hover:brightness-110 disabled:opacity-45 md:bottom-10 md:right-10"
          )}
          whileHover={{ scale: isRunning ? 1 : 1.02 }}
          whileTap={{ scale: isRunning ? 1 : 0.98 }}
        >
          {isRunning ? (
            <Radio className="size-5 shrink-0 animate-pulse" strokeWidth={2.5} />
          ) : (
            <Play className="size-5 shrink-0 fill-current" />
          )}
          <span className="hidden text-left leading-tight sm:block">
            Run full
            <br />
            swarm cycle
          </span>
          <span className="sm:hidden">Run cycle</span>
        </motion.button>
      </main>
      <SiteFooter />
    </div>
  );
}

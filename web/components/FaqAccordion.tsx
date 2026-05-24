"use client";

import { Plus } from "lucide-react";

const items = [
  {
    q: "Is this real money?",
    a: "No. Cortex Capital is an educational paper-trading prototype. The console simulates the full research → debate → risk → execution loop with realistic mock data. Production paths to IBKR and live LangGraph orchestration are scaffolded but disabled.",
  },
  {
    q: "What does the swarm actually do?",
    a: "A research agent gathers price, fundamentals, filings, and macro context. Eighteen investor personas debate the thesis in batches. A trader agent proposes a structured book; a risk agent overlays VaR/margin/correlation. The portfolio manager outputs a final BUY/HOLD/SELL with confidence and an audit trail.",
  },
  {
    q: "Why eighteen personas?",
    a: "Different lenses — value, momentum, macro, vol arb, distressed credit, retail flows, etc. — keep any single archetype from dominating. The grid pressure-tests theses and surfaces blind spots before risk sees the trade.",
  },
  {
    q: "Can I plug in a real LLM and broker?",
    a: "Yes. Toggle 'LangGraph live' in the console; it calls a FastAPI bridge in python/api/. The kernel is modular — swap the broker adapter for IBKR (paper or live) and route real orders. Default models are Groq with Anthropic fallback.",
  },
  {
    q: "How is this different from existing AI hedge fund repos?",
    a: "Cortex glues research-debate-risk-execution into one transparent surface with persistent memory, a backtest harness, and a public dashboard. Inspired by TradingAgents, Dexter, ai-hedge-fund, and MiroFish — but it's an independent product surface, not a fork.",
  },
  {
    q: "Where can I follow progress?",
    a: "GitHub at github.com/taran1610/cortex-capital and updates from @taranx0911 on X. The book updates as the public NAV changes per session.",
  },
];

export function FaqAccordion() {
  return (
    <div className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c1019]/60">
      {items.map((item, i) => (
        <details
          key={i}
          className="group [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-5 transition hover:bg-white/[0.02]">
            <span className="font-display text-base font-semibold tracking-tight text-white md:text-lg">
              {item.q}
            </span>
            <Plus
              className="mt-1 size-5 shrink-0 text-cyan-400/80 transition group-open:rotate-45 group-open:text-cyan-300"
              strokeWidth={2}
            />
          </summary>
          <div className="px-5 pb-6">
            <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
              {item.a}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}

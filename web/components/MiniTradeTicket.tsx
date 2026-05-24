"use client";

import { ArrowUpRight } from "lucide-react";

export function MiniTradeTicket() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-[#0c1019]/95 to-cyan-950/10 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-2xl font-bold tracking-tight text-white">
            ESZ6
          </p>
          <p className="mt-0.5 text-xs text-slate-500">E-mini S&amp;P 500</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-cyan-500/12 px-2 py-1 text-cyan-200">
          <ArrowUpRight className="size-4" strokeWidth={2.2} />
          <span className="font-mono text-[10px] font-bold tracking-wide">
            LONG
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
            Size
          </p>
          <p className="mt-0.5 font-mono text-slate-200">3 contracts</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
            Ref
          </p>
          <p className="mt-0.5 font-mono text-slate-200">5,423.50</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400"
          style={{ width: "78%" }}
        />
      </div>
      <p className="mt-2 font-mono text-[10px] text-slate-500">
        Conviction <span className="text-cyan-200">78%</span> · approved
      </p>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { PERSONAS } from "@/lib/mockData";
import { useSwarmStore } from "@/lib/swarmStore";
import { cn } from "@/lib/utils";

export function DebaterPanel() {
  const cycleStep = useSwarmStore((s) => s.cycleStep);
  const isRunning = useSwarmStore((s) => s.isRunning);
  const active = cycleStep === "debate" && isRunning;

  return (
    <div className="saas-panel border-violet-500/12 bg-gradient-to-br from-violet-950/15 via-transparent to-cyan-950/8 p-4 shadow-[0_0_40px_-24px_rgba(139,92,246,0.28)]">
      <div className="mb-3 flex items-end justify-between gap-2">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/90">
          18-persona grid
        </p>
        {active && (
          <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-400/85">
            Live debate
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {PERSONAS.map((p, i) => (
          <motion.div
            key={p.id}
            initial={false}
            animate={
              active
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0.5, y: 0, scale: 1 }
            }
            transition={{
              delay: active ? i * 0.035 : 0,
              type: "spring",
              stiffness: 400,
              damping: 24,
            }}
            className={cn(
              "relative overflow-hidden rounded-xl border px-2 py-2.5 text-center transition-shadow",
              active
                ? "border-cyan-400/35 bg-gradient-to-b from-cyan-500/12 to-[#0c1019]/80 shadow-[0_0_24px_-8px_rgba(34,211,238,0.4)]"
                : "border-white/[0.05] bg-[#0c1019]/50 hover:border-white/[0.09]"
            )}
          >
            {active && (
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
            )}
            <p className="text-lg leading-none drop-shadow-sm">{p.emoji}</p>
            <p className="mt-1 truncate font-display text-[10px] font-semibold tracking-tight text-slate-100">
              {p.name}
            </p>
            <p
              className={cn(
                "mt-0.5 font-mono text-[8px] font-bold uppercase tracking-wider",
                p.stance === "bull" && "text-cyan-400",
                p.stance === "bear" && "text-rose-400",
                p.stance === "neutral" && "text-slate-600"
              )}
            >
              {p.stance}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Check, Circle, Loader2 } from "lucide-react";
import type { CycleStep } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const STEPS: { key: Exclude<CycleStep, "idle">; label: string }[] = [
  { key: "researcher", label: "Researcher" },
  { key: "debate", label: "Debate (18)" },
  { key: "trader", label: "Trader" },
  { key: "risk", label: "Risk" },
  { key: "executed", label: "Executed" },
];

function activeIndex(step: CycleStep): number {
  if (step === "idle") return -1;
  return STEPS.findIndex((s) => s.key === step);
}

export function SwarmCycle({
  cycleStep,
  isRunning,
  cyclesCompleted,
}: {
  cycleStep: CycleStep;
  isRunning: boolean;
  cyclesCompleted: number;
}) {
  const cur = activeIndex(cycleStep);
  const idleShowComplete =
    !isRunning && cycleStep === "idle" && cyclesCompleted > 0;

  return (
    <div className="saas-panel relative p-5">
      <div className="absolute bottom-8 left-[1.35rem] top-10 w-px bg-gradient-to-b from-cyan-500/40 via-violet-500/25 to-transparent" />
      <p className="saas-kicker">Pipeline</p>
      <ul className="relative mt-5 space-y-4">
        {STEPS.map((s, i) => {
          let visual: "done" | "run" | "wait" = "wait";
          if (idleShowComplete) visual = "done";
          else if (cur < 0) visual = "wait";
          else if (i < cur) visual = "done";
          else if (i === cur) visual = "run";
          else visual = "wait";

          return (
            <motion.li
              key={s.key}
              layout
              className="relative flex items-center gap-3 pl-1"
              initial={false}
            >
              <span
                className={cn(
                  "relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs shadow-lg",
                  visual === "done" &&
                    "border-cyan-500/35 bg-cyan-500/15 text-cyan-100 shadow-cyan-500/10",
                  visual === "run" &&
                    "border-cyan-300/55 bg-gradient-to-br from-cyan-500/25 to-violet-600/20 text-white shadow-[0_0_28px_-6px_rgba(34,211,238,0.5)]",
                  visual === "wait" &&
                    "border-white/[0.06] bg-[#0c1019]/80 text-slate-600"
                )}
              >
                {visual === "done" ? (
                  <Check className="size-4" strokeWidth={2.5} />
                ) : visual === "run" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Circle className="size-3 opacity-35" />
                )}
              </span>
              <span
                className={cn(
                  "font-display text-sm tracking-tight",
                  visual === "run" && "font-semibold text-white",
                  visual === "done" && "text-slate-500",
                  visual === "wait" && "text-slate-600"
                )}
              >
                {s.label}
              </span>
            </motion.li>
          );
        })}
      </ul>
      <p className="mt-6 font-mono text-[10px] leading-relaxed text-slate-600">
        Wire LangGraph node events for live step sync.
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Scale, Sparkles, Users, Zap } from "lucide-react";
import type { ChatMessage } from "@/lib/mockData";
import { cn } from "@/lib/utils";

function iconFor(m: ChatMessage) {
  switch (m.variant) {
    case "researcher":
      return Sparkles;
    case "debater":
      return Users;
    case "trader":
      return Zap;
    case "risk":
      return Scale;
    default:
      return Bot;
  }
}

function bubbleStyles(v: ChatMessage["variant"]) {
  switch (v) {
    case "researcher":
      return "border-cyan-500/18 bg-cyan-950/25 border-l-cyan-400/75";
    case "debater":
      return "border-white/[0.06] bg-violet-950/18 border-l-violet-400/65";
    case "trader":
      return "border-amber-500/18 bg-amber-950/22 border-l-amber-400/75";
    case "risk":
      return "border-emerald-500/20 bg-emerald-950/18 border-l-emerald-400/75";
    default:
      return "border-white/[0.06] bg-[#0c1019]/80 border-l-slate-500/45";
  }
}

export function AgentChat({ messages }: { messages: ChatMessage[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex max-h-[min(560px,55vh)] min-h-[320px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0c1019]/90 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="border-b border-white/[0.06] bg-[#06080f]/50 px-4 py-3.5">
        <p className="saas-kicker">Agent feed</p>
        <p className="mt-1 text-[11px] text-slate-500">
          Researcher → 18-persona debate → Trader → Risk → Execution
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const Icon = iconFor(m);
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className={cn(
                  "flex gap-3 rounded-xl border border-l-[3px] p-3.5 shadow-lg shadow-black/25",
                  bubbleStyles(m.variant)
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-[#06080f]/70 shadow-inner">
                  <Icon
                    className="size-4 text-cyan-300/90"
                    aria-hidden
                    strokeWidth={1.75}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                    <span className="font-display text-sm font-semibold tracking-tight text-white">
                      {m.agentName}
                    </span>
                    <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-slate-500">
                      {m.role}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {m.content}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

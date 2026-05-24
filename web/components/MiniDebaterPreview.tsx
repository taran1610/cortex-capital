"use client";

import { motion } from "framer-motion";
import { PERSONAS } from "@/lib/mockData";

export function MiniDebaterPreview() {
  const grid = PERSONAS.slice(0, 12);
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0c1019]/80 p-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/90">
          Persona grid
        </p>
        <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-400/80">
          live debate
        </span>
      </div>
      <div className="mt-3 grid grid-cols-6 gap-1.5">
        {grid.map((p, i) => {
          const stance =
            p.stance === "bull"
              ? "border-cyan-400/35 bg-cyan-500/10"
              : p.stance === "bear"
                ? "border-rose-400/30 bg-rose-500/10"
                : "border-white/[0.06] bg-white/[0.03]";
          return (
            <motion.div
              key={p.id}
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{
                duration: 2.4,
                delay: i * 0.07,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`flex h-9 items-center justify-center rounded-lg border text-base ${stance}`}
            >
              <span aria-hidden>{p.emoji}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

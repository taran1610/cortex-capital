"use client";

import { motion } from "framer-motion";
import { PERSONAS } from "@/lib/mockData";

const RING_COUNT = 3;
const PER_RING = 6;

export function AgentConstellation() {
  const items = PERSONAS.slice(0, RING_COUNT * PER_RING);

  return (
    <div className="relative aspect-square w-full max-w-[460px]">
      <div
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18),transparent_55%)] blur-2xl"
        aria-hidden
      />

      {Array.from({ length: RING_COUNT }).map((_, ringIdx) => {
        const radiusPct = 28 + ringIdx * 14;
        const direction = ringIdx % 2 === 0 ? 1 : -1;
        const duration = 32 + ringIdx * 14;
        return (
          <motion.div
            key={ringIdx}
            className="absolute inset-0"
            animate={{ rotate: 360 * direction }}
            transition={{ duration, ease: "linear", repeat: Infinity }}
          >
            <div
              className="absolute rounded-full border border-white/[0.05]"
              style={{
                top: `${50 - radiusPct}%`,
                left: `${50 - radiusPct}%`,
                width: `${radiusPct * 2}%`,
                height: `${radiusPct * 2}%`,
              }}
            />
            {Array.from({ length: PER_RING }).map((_, i) => {
              const persona = items[ringIdx * PER_RING + i];
              if (!persona) return null;
              const angle = (i / PER_RING) * Math.PI * 2;
              const x = 50 + Math.cos(angle) * radiusPct;
              const y = 50 + Math.sin(angle) * radiusPct;
              const stanceColor =
                persona.stance === "bull"
                  ? "border-cyan-400/45 bg-cyan-400/12 text-cyan-100"
                  : persona.stance === "bear"
                    ? "border-rose-400/40 bg-rose-500/10 text-rose-100"
                    : "border-white/[0.1] bg-white/[0.04] text-slate-200";
              return (
                <motion.div
                  key={persona.id}
                  className="absolute"
                  style={{
                    top: `${y}%`,
                    left: `${x}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  animate={{ rotate: -360 * direction }}
                  transition={{
                    duration,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border text-base shadow-[0_0_18px_-6px_rgba(34,211,238,0.35)] backdrop-blur ${stanceColor}`}
                    title={persona.name}
                  >
                    <span aria-hidden>{persona.emoji}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        );
      })}

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.04, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity }}
          className="relative flex h-[28%] w-[28%] items-center justify-center rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/20 via-violet-500/15 to-transparent shadow-[0_0_60px_-10px_rgba(34,211,238,0.45)] backdrop-blur-xl"
        >
          <span
            className="font-display text-lg font-extrabold tracking-tight text-white"
            style={{ textShadow: "0 0 16px rgba(34,211,238,0.45)" }}
          >
            CC
          </span>
          <div
            className="pointer-events-none absolute -inset-3 rounded-[28px] border border-white/[0.06]"
            aria-hidden
          />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-0">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-[1px] w-[55%] origin-left bg-gradient-to-r from-cyan-400/0 via-cyan-300/45 to-transparent"
            initial={{ rotate: i * 120, opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{
              duration: 2.6,
              delay: i * 0.9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ rotate: `${i * 120}deg` }}
          />
        ))}
      </div>
    </div>
  );
}

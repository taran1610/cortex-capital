"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

function torontoNow() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function sessionLabel(d: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Toronto",
    hour: "numeric",
    hour12: false,
    weekday: "short",
  }).formatToParts(d);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "12");
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const weekend = wd === "Sat" || wd === "Sun";
  if (weekend) return "Closed · YYZ";
  if (hour >= 9 && hour < 16) return "Live · YYZ";
  if (hour >= 4 && hour < 9) return "Pre · YYZ";
  return "Post · YYZ";
}

export function MarketClock() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const d = new Date();
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-[#0c1019]/90 px-3.5 py-1.5 font-mono text-[11px] text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <Activity className="size-3.5 text-cyan-400" aria-hidden />
      <span className="font-medium text-cyan-100/90">{sessionLabel(d)}</span>
      <span className="text-slate-700">/</span>
      <span className="text-slate-500" suppressHydrationWarning>
        {torontoNow()}
      </span>
    </div>
  );
}

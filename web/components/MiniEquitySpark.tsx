"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { buildEquitySeries } from "@/lib/mockData";

const data = buildEquitySeries(7);

export function MiniEquitySpark() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0c1019]/80 p-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/90">
          Equity · 30d
        </p>
        <span className="font-mono text-[10px] text-emerald-300/90">
          +2.34%
        </span>
      </div>
      <div className="mt-2 h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="miniSpark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="eq"
              stroke="#22d3ee"
              strokeWidth={1.5}
              fill="url(#miniSpark)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

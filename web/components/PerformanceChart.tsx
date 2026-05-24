"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function PerformanceChart({
  data,
}: {
  data: { day: string; eq: number; dd: number }[];
}) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="eqFillCortex" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.38} />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(148,163,184,0.07)" />
          <XAxis
            dataKey="day"
            tick={{ fill: "#64748b", fontSize: 10, fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: "rgba(148,163,184,0.1)" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#64748b", fontSize: 10, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmt}
            width={48}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={36}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(10,13,20,0.96)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              fontSize: 12,
              boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
            }}
            labelStyle={{ color: "#94a3b8", fontFamily: "var(--font-mono)", fontSize: 10 }}
            formatter={(value: number, name: string) => [
              name === "eq" ? fmt(value) : `${value}%`,
              name === "eq" ? "Equity" : "Drawdown",
            ]}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="eq"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#eqFillCortex)"
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="dd"
            stroke="#a78bfa"
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

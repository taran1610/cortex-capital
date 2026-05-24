"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Gauge } from "lucide-react";
import type { ProposedTrade } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TradeCard({
  trades,
  riskApproved,
}: {
  trades: ProposedTrade[];
  riskApproved: boolean | null;
}) {
  const t = trades[0];
  return (
    <Card className="overflow-hidden border-white/[0.06]">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 font-display text-base tracking-tight">
          <span>Proposed book</span>
          {riskApproved === true && (
            <Badge variant="success">Approved</Badge>
          )}
          {riskApproved === false && (
            <Badge variant="destructive">Rejected</Badge>
          )}
          {riskApproved === null && <Badge variant="outline">Pending</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!t ? (
          <p className="text-sm leading-relaxed text-slate-500">
            Run a swarm cycle — trade ideas surface here with conviction and
            size.
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {trades.map((x) => (
              <div
                key={x.symbol + x.direction}
                className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-[#0c1019]/90 to-cyan-950/10 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-2xl font-bold tracking-tight text-white">
                      {x.symbol}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{x.instrument}</p>
                  </div>
                  <div
                    className={
                      x.direction === "LONG"
                        ? "flex items-center gap-1 rounded-lg bg-cyan-500/12 px-2 py-1 text-cyan-300"
                        : "flex items-center gap-1 rounded-lg bg-rose-500/12 px-2 py-1 text-rose-300"
                    }
                  >
                    {x.direction === "LONG" ? (
                      <ArrowUpRight className="size-5" strokeWidth={2} />
                    ) : (
                      <ArrowDownRight className="size-5" strokeWidth={2} />
                    )}
                    <span className="font-mono text-xs font-bold">{x.direction}</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                      Size
                    </p>
                    <p className="mt-0.5 font-mono text-slate-200">{x.size}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                      Ref
                    </p>
                    <p className="mt-0.5 font-mono text-slate-200">{x.price}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Gauge className="size-4 text-cyan-400/90" strokeWidth={2} />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 via-cyan-500 to-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${x.conviction}%` }}
                      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="font-mono text-xs font-semibold text-cyan-200">
                    {x.conviction}%
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  {x.rationale}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

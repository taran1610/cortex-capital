"use client";

import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSwarmStore } from "@/lib/swarmStore";
import { cn } from "@/lib/utils";

export default function TradesPage() {
  const tradeHistory = useSwarmStore((s) => s.tradeHistory);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav />
      <main className="relative mx-auto w-full max-w-[1600px] flex-1 px-4 py-10 md:px-6">
        <PageHeader
          kicker="Ledger"
          title="Trades"
          description="Full paper tape from the swarm. Sort and slice from the console when you need tighter controls."
        >
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to console</Link>
          </Button>
        </PageHeader>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0c1019]/90 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-white/[0.06] bg-[#06080f]/60 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3.5">Time</th>
                <th className="px-4 py-3.5">Symbol</th>
                <th className="px-4 py-3.5">Dir</th>
                <th className="px-4 py-3.5">Size</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {tradeHistory.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-white/[0.04] transition hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">
                    {new Date(row.ts).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-100">
                    {row.symbol}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge
                      variant={
                        row.direction === "LONG" ? "success" : "outline"
                      }
                      className={
                        row.direction === "SHORT" ? "text-orange-300" : ""
                      }
                    >
                      {row.direction}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-400">{row.size}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline">{row.status}</Badge>
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-right font-mono text-xs font-medium",
                      row.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {row.pnl >= 0 ? "+" : ""}
                    {row.pnl.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

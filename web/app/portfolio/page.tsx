"use client";

import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSwarmStore } from "@/lib/swarmStore";

export default function PortfolioPage() {
  const nav = useSwarmStore((s) => s.nav);
  const todayPnl = useSwarmStore((s) => s.todayPnl);
  const sharpe30 = useSwarmStore((s) => s.sharpe30);
  const maxDrawdown = useSwarmStore((s) => s.maxDrawdown);
  const winRate = useSwarmStore((s) => s.winRate);
  const cyclesCompleted = useSwarmStore((s) => s.cyclesCompleted);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav />
      <main className="relative mx-auto w-full max-w-[1600px] flex-1 px-4 py-10 md:px-6">
        <div
          className="pointer-events-none absolute right-0 top-20 h-56 w-56 rounded-full bg-violet-600/[0.06] blur-[90px]"
          aria-hidden
        />
        <PageHeader
          kicker="Book"
          title="Portfolio"
          description="Paper snapshot tied to the swarm-approved risk envelope. Numbers reflect client session state."
        >
          <Button asChild variant="outline">
            <Link href="/trades">View ledger</Link>
          </Button>
        </PageHeader>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-cyan-400/10">
            <CardHeader>
              <CardTitle className="text-base font-display">Net asset value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-semibold tracking-tight text-cyan-100">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(nav)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display">Swarm cycles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-semibold tracking-tight text-slate-100">
                {cyclesCompleted}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Completed this session (client state)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display">Today P&amp;L</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`font-mono text-2xl font-semibold ${
                  todayPnl >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {todayPnl >= 0 ? "+" : ""}
                {todayPnl.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display">Quality metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-400">
              <div className="flex justify-between border-b border-white/[0.04] pb-2">
                <span>30d Sharpe</span>
                <span className="font-mono text-slate-200">{sharpe30}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.04] pb-2">
                <span>Max DD</span>
                <span className="font-mono text-slate-200">{maxDrawdown}%</span>
              </div>
              <div className="flex justify-between">
                <span>Win rate</span>
                <span className="font-mono text-slate-200">{winRate}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button asChild className="mt-12">
          <Link href="/dashboard">Open swarm console</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}

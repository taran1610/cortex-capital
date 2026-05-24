"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Layers,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { useSwarmStore } from "@/lib/swarmStore";

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function HomePage() {
  const nav = useSwarmStore((s) => s.nav);
  const todayPnl = useSwarmStore((s) => s.todayPnl);
  const sharpe30 = useSwarmStore((s) => s.sharpe30);
  const maxDrawdown = useSwarmStore((s) => s.maxDrawdown);
  const winRate = useSwarmStore((s) => s.winRate);
  const bumpTickerNav = useSwarmStore((s) => s.bumpTickerNav);

  useEffect(() => {
    const id = setInterval(() => bumpTickerNav(), 10000);
    return () => clearInterval(id);
  }, [bumpTickerNav]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav />

      <main className="relative flex-1">
        <div
          className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[min(90vw,720px)] -translate-x-1/2 rounded-full bg-cyan-500/[0.06] blur-[120px]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-[1600px] px-4 pb-24 pt-10 md:px-6 md:pt-14">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-12 lg:grid-cols-[1.05fr_minmax(0,420px)] lg:items-center lg:gap-16"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/95">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  </span>
                  Live swarm · Paper book
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
                  YC S26 thesis lab
                </span>
              </div>

              <h1 className="font-display mt-8 text-[2rem] font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl sm:leading-[1.08] lg:text-[3.25rem] lg:leading-[1.06]">
                The operating system for{" "}
                <span className="text-gradient-mint">AI-native</span> funds.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
                Research, eighteen-voice debate, risk, and execution — one
                transparent console. Built to demo how autonomous agents ship
                institutional-grade decisions with an audit trail.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/dashboard#swarm">
                    <Sparkles className="size-4" />
                    Open console
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/portfolio">
                    View portfolio
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>

              <p className="mt-10 text-sm text-slate-600">
                Built by{" "}
                <span className="text-slate-400">Taranpreet Singh</span> ·{" "}
                <a
                  href="https://x.com/taranx0911"
                  className="text-cyan-400/90 underline-offset-4 hover:underline"
                >
                  @taranx0911
                </a>
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.5 }}
              className="saas-panel overflow-hidden p-6 lg:p-8"
            >
              <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                <div>
                  <p className="saas-kicker">NAV snapshot</p>
                  <p className="mt-1 text-xs text-slate-500">Paper · streaming</p>
                </div>
                <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-emerald-300/90">
                  Healthy
                </span>
              </div>
              <div className="mt-6">
                <p
                  className="font-mono text-4xl font-semibold tracking-tight text-white sm:text-5xl"
                  suppressHydrationWarning
                >
                  {fmtMoney(nav)}
                </p>
                <p
                  className={`mt-2 font-mono text-lg font-medium ${
                    todayPnl >= 0 ? "text-cyan-400" : "text-rose-400"
                  }`}
                >
                  Day Δ {todayPnl >= 0 ? "+" : ""}
                  {fmtMoney(todayPnl)}
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-[#0c1019]/80 px-3 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                    Sharpe 30d
                  </p>
                  <p className="mt-1 font-mono text-lg text-slate-100">
                    {sharpe30.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-[#0c1019]/80 px-3 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                    Win rate
                  </p>
                  <p className="mt-1 font-mono text-lg text-slate-100">{winRate}%</p>
                </div>
              </div>
            </motion.div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.5 }}
            className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <MetricCard
              label="Today P&L"
              value={fmtMoney(todayPnl)}
              sub="Updates each swarm cycle"
              accent="cyan"
            />
            <MetricCard
              label="30d Sharpe"
              value={sharpe30.toFixed(2)}
              sub="Risk-adjusted output"
              accent="violet"
            />
            <MetricCard
              label="Max drawdown"
              value={`${maxDrawdown}%`}
              sub="Peak-to-trough (paper)"
              accent="amber"
            />
            <MetricCard
              label="Win rate"
              value={`${winRate}%`}
              sub="Approved books"
              accent="cyan"
            />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mt-20"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="saas-kicker">Platform</p>
                <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Everything in one product surface
                </h2>
                <p className="mt-2 max-w-lg text-sm text-slate-500">
                  Modular kernel + LangGraph swarm — ship demos fast, swap in
                  live brokers when you are ready.
                </p>
              </div>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <BentoCard
                icon={<Brain className="size-5 text-cyan-300" />}
                title="Multi-agent research"
                desc="Filings, price action, and macro context synthesized before debate."
                className="md:col-span-2"
              />
              <BentoCard
                icon={<Layers className="size-5 text-violet-300" />}
                title="Persona debate"
                desc="Eighteen investor lenses challenge the thesis in batches."
              />
              <BentoCard
                icon={<Shield className="size-5 text-emerald-300" />}
                title="Risk overlay"
                desc="VaR, margin, and correlation notes before anything hits the book."
              />
              <BentoCard
                icon={<BarChart3 className="size-5 text-amber-300" />}
                title="Performance"
                desc="Equity and drawdown sessions with exportable context."
                className="lg:col-span-2"
              />
              <BentoCard
                icon={<Zap className="size-5 text-cyan-300" />}
                title="Execution path"
                desc="Paper today — IBKR and LangGraph hooks when you flip production."
              />
            </div>
          </motion.section>

          <p className="mx-auto mt-20 max-w-2xl text-center text-xs leading-relaxed text-slate-600">
            Built in conversation with ideas from{" "}
            <Repo href="https://github.com/TauricResearch/TradingAgents">
              TradingAgents
            </Repo>
            ,{" "}
            <Repo href="https://github.com/virattt/dexter">Dexter</Repo>,{" "}
            <Repo href="https://github.com/virattt/ai-hedge-fund">
              ai-hedge-fund
            </Repo>
            , <Repo href="https://github.com/666ghj/MiroFish">MiroFish</Repo>.
            Cortex is an independent surface.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Repo({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-cyan-500/85 transition hover:text-cyan-300"
    >
      {children}
    </a>
  );
}

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "cyan" | "violet" | "amber";
}) {
  const bar =
    accent === "cyan"
      ? "from-cyan-400 to-sky-400"
      : accent === "violet"
        ? "from-violet-500 to-fuchsia-400"
        : "from-amber-500 to-orange-400";
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
    >
      <Card className="group h-full transition hover:border-cyan-400/15 hover:shadow-[0_0_40px_-18px_rgba(34,211,238,0.22)]">
        <CardContent className="p-5">
          <div className={`h-0.5 w-10 rounded-full bg-gradient-to-r ${bar} opacity-90`} />
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-white">
            {value}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{sub}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BentoCard({
  icon,
  title,
  desc,
  className,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  className?: string;
}) {
  return (
    <div
      className={`saas-panel group flex flex-col p-6 transition hover:border-cyan-400/12 ${className ?? ""}`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0c1019]/90 shadow-inner">
        {icon}
      </div>
      <h3 className="font-display mt-4 text-lg font-bold tracking-tight text-white">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{desc}</p>
    </div>
  );
}

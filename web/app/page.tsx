"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  GitBranch,
  Layers,
  Network,
  Shield,
  Sparkles,
  Telescope,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { AgentConstellation } from "@/components/AgentConstellation";
import { MiniDebaterPreview } from "@/components/MiniDebaterPreview";
import { MiniTradeTicket } from "@/components/MiniTradeTicket";
import { MiniEquitySpark } from "@/components/MiniEquitySpark";
import { FaqAccordion } from "@/components/FaqAccordion";
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
        <BgGlow />

        {/* HERO */}
        <section className="relative mx-auto max-w-[1600px] px-4 pb-20 pt-12 md:px-6 md:pt-16">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_minmax(0,520px)] lg:items-center lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/95">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  </span>
                  Live swarm · Paper book
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
                  YC S26 thesis lab · Toronto
                </span>
              </div>

              <h1 className="font-display mt-8 text-[2.15rem] font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl sm:leading-[1.05] lg:text-[3.4rem] lg:leading-[1.04]">
                The operating system for{" "}
                <span className="text-gradient-mint">AI-native</span>
                <br className="hidden sm:block" /> hedge funds.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
                Eighteen autonomous investor personas debate every trade.
                Research, risk, and execution flow through one transparent
                console — built to ship a believable fund OS, not a chatbot.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/dashboard#swarm">
                    <Sparkles className="size-4" />
                    Open the console
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#how-it-works">
                    See how it works
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>

              <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-slate-400 sm:grid-cols-3">
                <FeatureBullet>Multi-agent debate</FeatureBullet>
                <FeatureBullet>Risk-aware execution</FeatureBullet>
                <FeatureBullet>Audit trail by default</FeatureBullet>
                <FeatureBullet>LangGraph + FastAPI</FeatureBullet>
                <FeatureBullet>IBKR paper hooks</FeatureBullet>
                <FeatureBullet>90-day backtests</FeatureBullet>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-[480px]"
            >
              <div className="saas-panel relative overflow-hidden p-6 lg:p-8">
                <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                  <div>
                    <p className="saas-kicker">Live constellation</p>
                    <p className="mt-1 text-xs text-slate-500">
                      18 personas · 1 thesis
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-emerald-300/90">
                    Healthy
                  </span>
                </div>
                <div className="mt-6 flex justify-center">
                  <AgentConstellation />
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-5">
                  <MiniStat
                    label="NAV"
                    value={fmtMoney(nav)}
                    accent="text-cyan-200"
                  />
                  <MiniStat
                    label="Day"
                    value={`${todayPnl >= 0 ? "+" : ""}${fmtMoney(todayPnl)}`}
                    accent={todayPnl >= 0 ? "text-emerald-300" : "text-rose-300"}
                  />
                  <MiniStat
                    label="Win"
                    value={`${winRate}%`}
                    accent="text-violet-200"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="relative border-y border-white/[0.05] bg-[#080b13]/60">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 text-center md:px-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-600">
              Inspired by
            </span>
            <RepoTag href="https://github.com/TauricResearch/TradingAgents">
              TradingAgents
            </RepoTag>
            <RepoTag href="https://github.com/virattt/dexter">Dexter</RepoTag>
            <RepoTag href="https://github.com/virattt/ai-hedge-fund">
              ai-hedge-fund
            </RepoTag>
            <RepoTag href="https://github.com/666ghj/MiroFish">MiroFish</RepoTag>
          </div>
        </section>

        {/* METRICS */}
        <section className="relative mx-auto max-w-[1600px] px-4 py-20 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="saas-kicker">Public book</p>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
                Numbers update with every cycle
              </h2>
              <p className="mt-2 max-w-lg text-sm text-slate-500">
                The same metrics every cycle: P&amp;L, Sharpe, drawdown, win
                rate. Nothing hidden behind a portal.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/portfolio">
                Full portfolio
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="relative mx-auto max-w-[1600px] px-4 py-20 md:px-6"
        >
          <div className="max-w-2xl">
            <p className="saas-kicker">How it works</p>
            <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-white md:text-4xl">
              From thesis to execution in five deterministic steps
            </h2>
            <p className="mt-3 max-w-xl text-sm text-slate-500 md:text-base">
              Each step is its own agent — small, observable, and replayable.
              The console streams them in order so you can see the decision
              form.
            </p>
          </div>

          <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Step
              n="01"
              icon={<Telescope className="size-5 text-cyan-300" />}
              title="Researcher"
              desc="Pulls price, fundamentals, filings, and macro context — assembles a structured brief."
            />
            <Step
              n="02"
              icon={<Network className="size-5 text-violet-300" />}
              title="Persona debate"
              desc="Eighteen archetypes argue in batches. Bull, bear, neutral — with one-line rationale."
            />
            <Step
              n="03"
              icon={<Brain className="size-5 text-cyan-300" />}
              title="Reflection"
              desc="A Dexter-style critic challenges the synthesis and surfaces missing context."
            />
            <Step
              n="04"
              icon={<Shield className="size-5 text-emerald-300" />}
              title="Risk overlay"
              desc="VaR, margin, and correlation notes. Trades that breach policy get rejected, not approved."
            />
            <Step
              n="05"
              icon={<Zap className="size-5 text-amber-300" />}
              title="Execution"
              desc="Paper fills today, IBKR + live LangGraph when you flip production. Memory persists for audit."
            />
          </ol>
        </section>

        {/* INSIDE THE CONSOLE — bento with mini previews */}
        <section className="relative mx-auto max-w-[1600px] px-4 py-20 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="saas-kicker">Inside the console</p>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-white md:text-4xl">
                Every surface is the product
              </h2>
            </div>
            <Button asChild size="sm">
              <Link href="/dashboard">
                Launch console
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <BentoCard
              icon={<Layers className="size-5 text-violet-300" />}
              title="Persona debate grid"
              desc="See the 18 voices light up as they vote. Bull / bear / neutral surfaces immediately."
              className="lg:col-span-2"
              preview={<MiniDebaterPreview />}
            />
            <BentoCard
              icon={<Zap className="size-5 text-cyan-300" />}
              title="Trade tickets"
              desc="Symbol, size, conviction, rationale — risk-approved before they hit the book."
              preview={<MiniTradeTicket />}
            />
            <BentoCard
              icon={<BarChart3 className="size-5 text-amber-300" />}
              title="Performance"
              desc="Equity vs. drawdown, exportable. The same numbers that drive the public book."
              preview={<MiniEquitySpark />}
            />
            <BentoCard
              icon={<Shield className="size-5 text-emerald-300" />}
              title="Risk desk"
              desc="VaR, margin, correlation — the kind of pre-trade check banks expect."
            />
            <BentoCard
              icon={<GitBranch className="size-5 text-cyan-300" />}
              title="Audit memory"
              desc="Every decision persisted. Replay why the swarm went long when it did."
            />
          </div>
        </section>

        {/* PRINCIPLES */}
        <section className="relative mx-auto max-w-[1600px] px-4 py-20 md:px-6">
          <div className="max-w-2xl">
            <p className="saas-kicker">Principles</p>
            <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-white md:text-4xl">
              How we&rsquo;re building this fund
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Principle
              title="Transparent by default"
              desc="Public book, public dashboard, public commits. The audit trail is the product."
            />
            <Principle
              title="Multi-agent over monolith"
              desc="Specialized agents beat one giant prompt. Each role is small, replaceable, observable."
            />
            <Principle
              title="Risk before edge"
              desc="No trade ships without an explicit VaR / margin / correlation check."
            />
            <Principle
              title="Ship the surface"
              desc="A believable fund OS today, broker-live tomorrow. Demos before deck slides."
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="relative mx-auto max-w-[1100px] px-4 py-20 md:px-6">
          <div className="text-center">
            <p className="saas-kicker">FAQ</p>
            <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-white md:text-4xl">
              Common questions
            </h2>
          </div>
          <div className="mt-10">
            <FaqAccordion />
          </div>
        </section>

        {/* CTA */}
        <section className="relative mx-auto max-w-[1600px] px-4 pb-24 md:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-cyan-500/[0.08] via-violet-500/[0.06] to-transparent p-10 text-center md:p-16">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.18),transparent_55%)]"
              aria-hidden
            />
            <div className="relative">
              <p className="saas-kicker">Now live</p>
              <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-white md:text-5xl md:leading-[1.05]">
                Watch the swarm decide.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400 md:text-base">
                Open the console, run a cycle, and see eighteen agents debate
                a thesis in seconds. No login. No friction.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/dashboard#swarm">
                    <Sparkles className="size-4" />
                    Open the console
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/about">Read the thesis</Link>
                </Button>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-slate-600">
            Educational paper-trading prototype. Not investment advice. Past
            performance does not indicate future results.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function BgGlow() {
  return (
    <>
      <div
        className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[min(95vw,820px)] -translate-x-1/2 rounded-full bg-cyan-500/[0.07] blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-[420px] h-[360px] w-[360px] rounded-full bg-violet-600/[0.07] blur-[110px]"
        aria-hidden
      />
    </>
  );
}

function FeatureBullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle2 className="size-4 shrink-0 text-cyan-400/85" strokeWidth={2} />
      <span>{children}</span>
    </li>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#0c1019]/80 px-3 py-2.5">
      <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-sm font-semibold ${accent}`}
        suppressHydrationWarning
      >
        {value}
      </p>
    </div>
  );
}

function RepoTag({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-display text-sm font-semibold text-slate-400 transition hover:text-cyan-200"
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
          <p
            className="mt-2 font-mono text-2xl font-semibold tracking-tight text-white"
            suppressHydrationWarning
          >
            {value}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{sub}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Step({
  n,
  icon,
  title,
  desc,
}: {
  n: string;
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="saas-panel relative flex flex-col p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/80">
          {n}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-[#0c1019]/80">
          {icon}
        </div>
      </div>
      <h3 className="font-display mt-5 text-base font-bold tracking-tight text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
    </div>
  );
}

function BentoCard({
  icon,
  title,
  desc,
  className,
  preview,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  className?: string;
  preview?: ReactNode;
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
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
      {preview ? <div className="mt-5">{preview}</div> : null}
    </div>
  );
}

function Principle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="saas-panel p-5">
      <h3 className="font-display text-base font-bold tracking-tight text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
    </div>
  );
}

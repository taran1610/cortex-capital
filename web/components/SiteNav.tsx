"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MarketClock } from "@/components/MarketClock";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Swarm" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/trades", label: "Trades" },
  { href: "/about", label: "About" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#06080f]/75 backdrop-blur-2xl backdrop-saturate-150">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-6 md:gap-10">
          <Link href="/" className="group flex shrink-0 items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-cyan-400/15 to-violet-500/10 shadow-[0_0_24px_-10px_rgba(34,211,238,0.45)] transition group-hover:border-cyan-400/25">
              <span className="font-display text-xs font-extrabold tracking-tight text-white">
                CC
              </span>
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-[15px] font-bold tracking-tight text-white">
                Cortex
              </span>
              <span className="mt-0.5 text-[11px] font-medium tracking-wide text-slate-500">
                Capital
              </span>
            </span>
          </Link>
          <nav className="hidden items-center rounded-xl border border-white/[0.05] bg-[#0c1019]/60 p-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  pathname === l.href
                    ? "bg-white/[0.09] text-cyan-100 shadow-[0_0_20px_-8px_rgba(34,211,238,0.35)]"
                    : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <MarketClock />
          </div>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/dashboard">Launch console</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/[0.06] bg-[#0a0d14]/98 px-4 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
            >
              Home
            </Link>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  pathname === l.href
                    ? "bg-white/[0.08] text-cyan-100"
                    : "text-slate-400"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            <MarketClock />
            <Button asChild className="w-full">
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                Launch console
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

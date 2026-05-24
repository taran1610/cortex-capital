import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav />
      <main className="relative mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-6">
        <PageHeader
          kicker="Company"
          title="About Cortex Capital"
          description="A public, transparent interface for an autonomous AI-native trading swarm. The MVP runs in the browser with realistic paper simulations; production connects LangGraph and broker adapters."
        />

        <div className="mt-10 max-w-none space-y-6">
          <h2 className="font-display text-lg font-bold tracking-tight text-white">
            Founder
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Built by <span className="text-slate-200">Taranpreet Singh</span> (
            <a
              href="https://x.com/taranx0911"
              className="text-cyan-400 hover:underline"
            >
              @taranx0911
            </a>
            ) — targeting <span className="text-slate-200">YC Summer 2026</span>.
          </p>

          <section
            id="yc-application-video"
            className="mt-12 rounded-2xl border border-dashed border-white/[0.12] bg-[#0c1019]/50 p-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <p className="text-sm font-semibold text-slate-200">
              YC application video
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Placeholder — drop an embed or link when the cut is ready.
            </p>
          </section>

          <p className="mt-6 text-sm text-slate-600">
            <a
              href="/api/swarm/integrations"
              className="text-cyan-500 hover:underline"
            >
              Repo integration map (JSON)
            </a>{" "}
            — proxied to Python when the API is running.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard">Live console</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

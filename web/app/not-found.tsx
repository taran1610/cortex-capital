import Link from "next/link";
import { ArrowLeft, Orbit } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.07),transparent_55%)]"
        aria-hidden
      />
      <div className="relative text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/22 bg-cyan-400/10 shadow-[0_0_40px_-12px_rgba(34,211,238,0.45)]">
          <Orbit className="size-8 text-cyan-400" strokeWidth={1.5} />
        </div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-400/90">
          404
        </p>
        <h1 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
          Off the tape
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500">
          This route is not in the public book. Jump back to home or the swarm
          console.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Console</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

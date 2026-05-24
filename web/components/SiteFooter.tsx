import Link from "next/link";
import { Github } from "lucide-react";

const product = [
  { href: "/dashboard", label: "Swarm console" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/trades", label: "Trade ledger" },
];

const company = [
  { href: "/about", label: "About" },
  {
    href: "https://x.com/taranx0911",
    label: "X / Twitter",
    external: true,
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-white/[0.06] bg-[#06080f]/95">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-violet-500/0 via-cyan-400/25 to-violet-500/0"
        aria-hidden
      />
      <div className="mx-auto grid max-w-[1600px] gap-12 px-4 py-14 md:grid-cols-2 md:px-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-xl font-bold tracking-tight text-white">
            Cortex Capital
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
            AI-native research and execution stack — multi-agent debate, risk,
            and paper trading in one transparent surface. Educational demo; not
            investment advice.
          </p>
          <a
            href="https://github.com/taran1610/cortex-capital"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:border-cyan-400/25 hover:text-cyan-200"
          >
            <Github className="size-4 opacity-80" />
            View on GitHub
          </a>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Product
          </p>
          <ul className="mt-4 space-y-2.5 text-sm font-medium">
            {product.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-slate-500 transition hover:text-cyan-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Company
          </p>
          <ul className="mt-4 space-y-2.5 text-sm font-medium">
            {company.map((item) => (
              <li key={item.href}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 transition hover:text-cyan-200"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="text-slate-500 transition hover:text-cyan-200"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <Link
                href="/about#yc-application-video"
                className="text-slate-500 transition hover:text-cyan-200"
              >
                YC video (placeholder)
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/[0.04] py-6">
        <p className="mx-auto max-w-[1600px] px-4 text-center text-xs text-slate-600 md:px-6">
          © {new Date().getFullYear()} Cortex Capital · Past performance does not
          indicate future results.
        </p>
      </div>
    </footer>
  );
}

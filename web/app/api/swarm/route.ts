import { NextResponse } from "next/server";

/**
 * Proxies to the Cortex Python FastAPI (`python/api/app.py`).
 * Set CORTEX_PYTHON_API_URL in Vercel (e.g. your Fly.io / Railway / private VPC URL).
 *
 * TODO: Add SSE streaming when LangGraph exposes incremental events.
 */
const UPSTREAM =
  process.env.CORTEX_PYTHON_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8800";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    /* empty body */
  }
  const b = body as { ticker?: string };
  const ticker = typeof b.ticker === "string" && b.ticker.trim() ? b.ticker : "SPY";

  try {
    const r = await fetch(`${UPSTREAM}/swarm/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker }),
      signal: AbortSignal.timeout(240_000),
    });
    const text = await r.text();
    let json: unknown;
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = { ok: false, error: text || r.statusText };
    }
    if (!r.ok) {
      return NextResponse.json(json, { status: r.status });
    }
    return NextResponse.json(json);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        error: msg,
        hint: `Could not reach Python API at ${UPSTREAM}. Run: cd python && uvicorn api.app:app --host 0.0.0.0 --port 8800`,
      },
      { status: 502 }
    );
  }
}

import { NextResponse } from "next/server";

const UPSTREAM =
  process.env.CORTEX_PYTHON_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8800";

export const runtime = "nodejs";

/** Proxies GET /swarm/integrations — how vendored / referenced repos map into Cortex. */
export async function GET() {
  try {
    const r = await fetch(`${UPSTREAM}/swarm/integrations`, {
      signal: AbortSignal.timeout(15_000),
    });
    const text = await r.text();
    let json: unknown;
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = { error: text };
    }
    return NextResponse.json(json, { status: r.ok ? 200 : r.status });
  } catch (e) {
    return NextResponse.json(
      {
        error: String(e),
        hint: "Start Python API: cd python && uvicorn api.app:app --port 8800",
        repos: {
          note: "Fallback meta when Python is offline — see python/api/app.py:_integrations_meta",
        },
      },
      { status: 502 }
    );
  }
}

# Cortex Capital (web)

Production-style MVP for **Cortex Capital** — a public dashboard for an autonomous AI-native hedge fund swarm (research → 18-persona debate → trader → risk → paper execution).

## Stack

- Next.js 15 (App Router) + TypeScript  
- Tailwind CSS v4 + shadcn-style primitives + `lucide-react`  
- Recharts, Zustand, Framer Motion  
- Vercel-ready (`vercel.json` included)

## Run locally

**1. Python API (required for *Real LLM mode* / LangGraph)**

```bash
cd python
uvicorn api.app:app --host 0.0.0.0 --port 8800
```

**2. Next.js**

```bash
cd web
npm install
npm run dev
```

Copy `web/.env.example` → `web/.env.local` if you need a non-default API URL.

Open [http://localhost:3000](http://localhost:3000). On `/dashboard`, leave *Real LLM mode* off for the instant browser mock, or turn it on to run **`python/graph/workflow.py`** end-to-end (OpenBB + Groq/Anthropic per `llm_client.py`).

**Repo map (from Python):** [http://127.0.0.1:8800/swarm/integrations](http://127.0.0.1:8800/swarm/integrations) — mirrored through Next at `/api/swarm/integrations` when the proxy can reach Python.

## One-click deploy (Vercel)

1. Push this repo to GitHub (`taran1610/cortex-capital` or your fork).  
2. In [Vercel](https://vercel.com/new), **Import** the repository.  
3. **Important:** Set **Root Directory** to `web` (Project Settings → General → Root Directory).  
   - If you deploy from the repo root instead, the root `vercel.json` also builds `web/` via `@vercel/next`.  
4. Framework preset: **Next.js**. Build: `npm run build`, Output: default.  
5. Deploy — no environment variables are required for the mock UI.

If you see `404: NOT_FOUND` on your Vercel URL, the project is almost always pointed at the wrong root — set Root Directory to `web` and redeploy.

## How to connect real agents

1. **LangGraph / Python backend (wired)**  
   - `app/api/swarm/route.ts` proxies `POST` to Python `POST /swarm/run` (`CORTEX_PYTHON_API_URL`, default `http://127.0.0.1:8800`).  
   - `lib/swarmStore.ts`: with *Real LLM mode*, the store calls `/api/swarm` and maps the JSON state via `lib/mapPythonSwarm.ts`.  
   - Optional: add SSE in the same route family when you stream LangGraph events.

2. **LLM providers (Grok / OpenAI / etc.)**  
   - Uncomment the `fetch("/api/swarm", ...)` placeholder in `runFullSwarmCycle` when `realLlmMode` is on.  
   - Implement the route with your provider SDK and stream tool calls back into `messages`.

3. **Market data (yfinance / OpenBB)**  
   - Reuse the repo’s Python stack under `python/cortex_tools/` for live quotes and fundamentals.  
   - Expose a thin read-only API and call it from the Researcher step instead of static `SCENARIOS` text.

4. **Execution (IBKR / paper broker)**  
   - After risk approval, POST orders to your broker adapter and persist fills to the same shape as `TradeRow` in `swarmStore`.  
   - Search for: `TODO: Wire IBKR`

5. **Persistence**  
   - Today, Zustand state is in-memory per tab. Add `persist` middleware or write through to your DB after each cycle for multi-user SaaS.

## Repo layout (this package)

| Path | Purpose |
|------|--------|
| `app/page.tsx` | Landing — NAV ticker, metrics, CTAs |
| `app/dashboard/page.tsx` | Main swarm UI |
| `lib/swarmStore.ts` | Zustand orchestration + portfolio deltas |
| `lib/mockData.ts` | Rotating scenarios, personas, seed trades |
| `components/*` | Chat, charts, debater grid, trade card, shell |

## Disclaimer

Educational / demonstration software. Not investment advice. No live trading unless you wire verified execution paths and compliance.

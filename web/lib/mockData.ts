/**
 * Mock scenarios for the swarm demo. Rotate for variety.
 * TODO: CONNECT REAL LANGGRAPH ORCHESTRATION — replace with live agent graph output.
 * TODO: Wire yfinance / OpenBB / IBKR for live quotes (see python/cortex_tools/).
 */

export type CycleStep =
  | "idle"
  | "researcher"
  | "debate"
  | "trader"
  | "risk"
  | "executed";

export interface ChatMessage {
  id: string;
  agentId: string;
  agentName: string;
  role: string;
  content: string;
  ts: number;
  variant: "researcher" | "debater" | "trader" | "risk" | "system";
}

export interface Persona {
  id: string;
  name: string;
  archetype: string;
  emoji: string;
  stance: "bull" | "bear" | "neutral";
  oneLiner: string;
}

export const PERSONAS: Persona[] = [
  { id: "p1", name: "Renaissance Quant", archetype: "Stat arb", emoji: "∑", stance: "neutral", oneLiner: "Signal decay in crowded factors — size down." },
  { id: "p2", name: "Macro HF PM", archetype: "Global macro", emoji: "🌍", stance: "bull", oneLiner: "Liquidity impulse still supportive; lean risk-on in beta." },
  { id: "p3", name: "Crypto DeFi Trader", archetype: "On-chain", emoji: "⛓️", stance: "neutral", oneLiner: "Funding flat; no reflexive squeeze — pass on alt beta." },
  { id: "p4", name: "Deep Value", archetype: "Graham-style", emoji: "📘", stance: "bull", oneLiner: "FCF yield vs. peers implies 12–18% margin of safety." },
  { id: "p5", name: "Growth Allocator", archetype: "Innovation", emoji: "🚀", stance: "bull", oneLiner: "TAM expansion + operating leverage narrative intact." },
  { id: "p6", name: "Activist", archetype: "Governance", emoji: "⚡", stance: "neutral", oneLiner: "Board refresh unlikely this quarter — event path unclear." },
  { id: "p7", name: "Contrarian", archetype: "Deep value", emoji: "🦇", stance: "bear", oneLiner: "Street models ignore credit deterioration in suppliers." },
  { id: "p8", name: "Tail Risk", archetype: "Taleb-style", emoji: "🦢", stance: "bear", oneLiner: "Convex hedges cheap vs. gap risk into CPI week." },
  { id: "p9", name: "Vol Arb", archetype: "Options", emoji: "📐", stance: "neutral", oneLiner: "Skew rich; prefer spreads over naked direction." },
  { id: "p10", name: "Pension CIO", archetype: "Long-only", emoji: "🏛️", stance: "bull", oneLiner: "Quality compounders fit liability-aware glide path." },
  { id: "p11", name: "CTA / Trend", archetype: "Managed futures", emoji: "📈", stance: "bull", oneLiner: "Medium-term momentum flipped positive on closes." },
  { id: "p12", name: "HFT / MM", archetype: "Microstructure", emoji: "⚙️", stance: "neutral", oneLiner: "Spreads tight; inventory risk favors smaller clips." },
  { id: "p13", name: "Retail Sentiment", archetype: "Flows", emoji: "🧲", stance: "bear", oneLiner: "Options call skew extreme — contrarian fade candidate." },
  { id: "p14", name: "ESG Allocator", archetype: "Sustainable", emoji: "🌿", stance: "neutral", oneLiner: "No material ESG overhang; disclosure clean." },
  { id: "p15", name: "Distressed Credit", archetype: "HY", emoji: "💀", stance: "bear", oneLiner: "Refi wall in '27 — watch spread convexity." },
  { id: "p16", name: "Regional Banks", archetype: "Financials", emoji: "🏦", stance: "neutral", oneLiner: "NIM plateauing; stock already reflects carry." },
  { id: "p17", name: "Asia Macro", archetype: "FX / rates", emoji: "🐉", stance: "bull", oneLiner: "CN liquidity injection supportive for ADR multiples." },
  { id: "p18", name: "Merger Arb", archetype: "Event", emoji: "🤝", stance: "neutral", oneLiner: "Deal spread inside hurdle; not actionable here." },
];

export interface ProposedTrade {
  symbol: string;
  direction: "LONG" | "SHORT";
  instrument: string;
  size: string;
  price: string;
  conviction: number;
  rationale: string;
}

export interface SwarmScenario {
  id: string;
  thesis: string;
  researcherBrief: string;
  debateLines: { personaId: string; content: string }[];
  trades: ProposedTrade[];
  riskApproved: boolean;
  riskNote: string;
  varImpact: string;
  marginNote: string;
  correlationNote: string;
  pnlDelta: number;
}

export const SCENARIOS: SwarmScenario[] = [
  {
    id: "s1",
    thesis: "Index futures — liquidity grab into month-end",
    researcherBrief:
      "Cross-asset scanner: ES/NQ term structure flat, VIX futures in contango, breadth 62% above 50dma. Headlines: Fed speakers lean patient; no hard landing in high-frequency growth nowcasts.",
    debateLines: [
      { personaId: "p2", content: "Month-end rebalancing + CTA buy programs — lean long beta with tight stops." },
      { personaId: "p8", content: "Respect the calendar: reduce gross into known vol events." },
      { personaId: "p1", content: "Crowding in momentum baskets — clip size 30% vs. model default." },
      { personaId: "p11", content: "Trend systems flipped long ES on Tuesday's close — align." },
      { personaId: "p7", content: "Internals weaker than headline — I dissent but won't block a sized beta trade." },
    ],
    trades: [
      {
        symbol: "ESZ6",
        direction: "LONG",
        instrument: "E-mini S&P 500 Dec 2026",
        size: "3 contracts",
        price: "5,423.50",
        conviction: 78,
        rationale: "Rebalance flow + positive drift vs. 20d RV; stop 5388.",
      },
    ],
    riskApproved: true,
    riskNote: "Within portfolio VaR budget. Margin utilization 41% → 46% post-trade.",
    varImpact: "95% 1d VaR +$12.4k",
    marginNote: "SPAN initial $18.2k / contract",
    correlationNote: "NQ beta 0.91 — partial hedge available",
    pnlDelta: 12400,
  },
  {
    id: "s2",
    thesis: "Single-name quality — margin of safety in mega-cap tech",
    researcherBrief:
      "Earnings revision breadth +2.1% WoW for semicap equipment. MSFT/Azure consumption stable; options market prices muted move into print.",
    debateLines: [
      { personaId: "p4", content: "FCF yield still attractive vs. history — add on weakness." },
      { personaId: "p5", content: "AI capex cycle elongates revenue visibility — overweight." },
      { personaId: "p13", content: "Retail call volume extreme — fade the euphoria layer." },
      { personaId: "p9", content: "Sell put spread if we need defined risk; stock outright ok." },
    ],
    trades: [
      {
        symbol: "MSFT",
        direction: "LONG",
        instrument: "Equity",
        size: "800 sh",
        price: "412.06",
        conviction: 71,
        rationale: "Post-pullback to 50dma cluster; risk/reward asymmetric.",
      },
    ],
    riskApproved: true,
    riskNote: "Sector concentration within limits after 4% trim last week.",
    varImpact: "95% 1d VaR +$8.1k",
    marginNote: "Reg-T approx $165k notional",
    correlationNote: "AAPL correlation 0.78",
    pnlDelta: 8100,
  },
  {
    id: "s3",
    thesis: "Commodities — energy tightness",
    researcherBrief:
      "Crack spreads firm; inventory draw larger than consensus. USD index rolling over intraday supports crude carry.",
    debateLines: [
      { personaId: "p11", content: "Trend longs validated on CL — add on strength per rules." },
      { personaId: "p15", content: "Refinery margins mean-revert fast — keep gross contained." },
      { personaId: "p2", content: "Macro cross: long energy vs. short discretionary pairs cleaner." },
    ],
    trades: [
      {
        symbol: "CLZ5",
        direction: "LONG",
        instrument: "WTI Crude Dec 2025",
        size: "2 contracts",
        price: "71.42",
        conviction: 64,
        rationale: "Inventory trajectory + soft USD impulse.",
      },
    ],
    riskApproved: true,
    riskNote: "Commodity sleeve under target — approved to +1σ sleeve.",
    varImpact: "95% 1d VaR +$15.2k",
    marginNote: "NYMEX margin ~$8.4k / lot",
    correlationNote: "XLE beta hedge vs. SPX available",
    pnlDelta: 15200,
  },
  {
    id: "s4",
    thesis: "Rates — curve steepener expression",
    researcherBrief:
      "Labor cooling in JOLTS vs. still-resilient spending. Market prices 2 cuts by year-end; belly of curve offers convexity.",
    debateLines: [
      { personaId: "p8", content: "Own convexity — flies in 5y sector cheap vs. realized." },
      { personaId: "p10", content: "Liability-aware book can absorb modest duration add." },
      { personaId: "p16", content: "Banks benefit if steepening holds — watch KRE as tell." },
    ],
    trades: [
      {
        symbol: "ZNZ5",
        direction: "LONG",
        instrument: "10Y Note futures",
        size: "5 contracts",
        price: "112'050",
        conviction: 58,
        rationale: "Positioning light post-supply; RV vs. bunds attractive.",
      },
    ],
    riskApproved: false,
    riskNote: "REJECTED: DV01 limit would breach desk policy on combined TY+ZN exposure.",
    varImpact: "Would add +$22k VaR",
    marginNote: "CBOT margin ~$1.9k / ZN",
    correlationNote: "High vs. existing TY stack",
    pnlDelta: -2100,
  },
  {
    id: "s5",
    thesis: "Crypto beta — selective ETH expression",
    researcherBrief:
      "ETH/BTC ratio basing; staking flows net positive; ETF tape orderly. On-chain fees stable.",
    debateLines: [
      { personaId: "p3", content: "Basis in perps flat; spot-led rally — prefer ETH over high-beta alts." },
      { personaId: "p13", content: "Social sentiment spike — reduce size vs. model." },
      { personaId: "p1", content: "Treat as satellite; cap at 2% NAV." },
    ],
    trades: [
      {
        symbol: "ETH-PERP",
        direction: "LONG",
        instrument: "Perpetual swap",
        size: "12 ETH notional",
        price: "3,482.10",
        conviction: 55,
        rationale: "Risk-on micro + ETF inflows; hard stop -4%.",
      },
    ],
    riskApproved: true,
    riskNote: "Approved as satellite within 2% NAV sleeve with auto de-risk.",
    varImpact: "95% 1d VaR +$9.4k",
    marginNote: "Isolated margin 22%",
    correlationNote: "BTC corr 0.88 — monitor basis",
    pnlDelta: 6200,
  },
  {
    id: "s6",
    thesis: "Asia ADR — liquidity-led bounce",
    researcherBrief:
      "CNH fixings stable; southbound flows +$2.1bn DoD. ADR discount to HK listing compressing.",
    debateLines: [
      { personaId: "p17", content: "Policy drip supports risk — add liquid ADR basket proxy." },
      { personaId: "p6", content: "Governance haircuts still real — single-name only." },
      { personaId: "p7", content: "Property sector overhang not cleared — keep gross low." },
    ],
    trades: [
      {
        symbol: "BABA",
        direction: "LONG",
        instrument: "ADR",
        size: "1,200 sh",
        price: "88.34",
        conviction: 61,
        rationale: "Flow + positioning squeeze; stop $84.",
      },
      {
        symbol: "FXI",
        direction: "LONG",
        instrument: "ETF",
        size: "2,500 sh",
        price: "33.12",
        conviction: 52,
        rationale: "Lower idiosyncratic risk vs. single name.",
      },
    ],
    riskApproved: true,
    riskNote: "EM sleeve within band; enforce ADR/HK basis monitor.",
    varImpact: "95% 1d VaR +$11.0k",
    marginNote: "ETF margin 25%",
    correlationNote: "HSI beta 0.93",
    pnlDelta: 9800,
  },
];

export function scenarioAtIndex(i: number): SwarmScenario {
  return SCENARIOS[i % SCENARIOS.length]!;
}

/** 30-day synthetic equity + drawdown for chart */
export function buildEquitySeries(seed: number) {
  const days = 30;
  const base = 10_000_000 + (seed % 500_000);
  const equity: { day: string; eq: number; dd: number }[] = [];
  let peak = base;
  let v = base;
  for (let d = 0; d < days; d++) {
    const noise = Math.sin(d * 1.7 + seed) * 0.008 + (Math.cos(d * 0.9) * 0.004);
    const drift = 0.00035 + (seed % 7) * 0.00001;
    v = Math.max(v * (1 + drift + noise), base * 0.92);
    peak = Math.max(peak, v);
    const dd = ((v - peak) / peak) * 100;
    equity.push({
      day: `D-${days - d}`,
      eq: Math.round(v),
      dd: Math.round(dd * 100) / 100,
    });
  }
  return equity;
}

export const INITIAL_METRICS = {
  todayPnl: 84200,
  sharpe30: 1.82,
  maxDrawdown: -4.2,
  winRate: 58.4,
  nav: 12_847_200,
};

/** Pre-filled paper trades so the dashboard feels live on first paint */
const T0 = 1_735_600_000_000; // fixed epoch for stable SSR/client hydration

export const SEED_TRADES: {
  id: string;
  ts: number;
  symbol: string;
  direction: "LONG" | "SHORT";
  size: string;
  status: "FILLED" | "REJECTED" | "PENDING";
  pnl: number;
  scenarioId: string;
}[] = [
  { id: "seed-1", ts: T0 - 86400000 * 2, symbol: "ESZ6", direction: "LONG", size: "2 contracts", status: "FILLED", pnl: 4200, scenarioId: "seed" },
  { id: "seed-2", ts: T0 - 86400000 * 3, symbol: "NQZ6", direction: "SHORT", size: "1 contract", status: "FILLED", pnl: 3100, scenarioId: "seed" },
  { id: "seed-3", ts: T0 - 86400000 * 4, symbol: "ZNZ5", direction: "LONG", size: "4 contracts", status: "REJECTED", pnl: 0, scenarioId: "seed" },
  { id: "seed-4", ts: T0 - 86400000 * 5, symbol: "MSFT", direction: "LONG", size: "400 sh", status: "FILLED", pnl: 1820, scenarioId: "seed" },
  { id: "seed-5", ts: T0 - 86400000 * 6, symbol: "GLD", direction: "LONG", size: "900 sh", status: "FILLED", pnl: -640, scenarioId: "seed" },
];

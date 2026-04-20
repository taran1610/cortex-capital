"""
Legendary investor personas sourced from virattt/ai-hedge-fund `ANALYST_CONFIG`.

We reuse names + styles here so the LangGraph debate node stays self-contained
(no `src.*` import path conflicts with that vendored project).
"""

from __future__ import annotations

# 18 analyst-style agents (keys match the upstream project for traceability).
LEGENDARY_INVESTOR_PERSONAS: dict[str, dict[str, str]] = {
    "aswath_damodaran": {
        "display_name": "Aswath Damodaran",
        "description": "The Dean of Valuation",
        "investing_style": (
            "Focuses on intrinsic value and financial metrics to assess investment "
            "opportunities through rigorous valuation analysis."
        ),
    },
    "ben_graham": {
        "display_name": "Ben Graham",
        "description": "The Father of Value Investing",
        "investing_style": (
            "Emphasizes a margin of safety and invests in undervalued companies with "
            "strong fundamentals through systematic value analysis."
        ),
    },
    "bill_ackman": {
        "display_name": "Bill Ackman",
        "description": "The Activist Investor",
        "investing_style": (
            "Seeks to influence management and unlock value through strategic activism "
            "and contrarian investment positions."
        ),
    },
    "cathie_wood": {
        "display_name": "Cathie Wood",
        "description": "The Queen of Growth Investing",
        "investing_style": (
            "Focuses on disruptive innovation and growth, investing in companies that "
            "are leading technological advancements and market disruption."
        ),
    },
    "charlie_munger": {
        "display_name": "Charlie Munger",
        "description": "The Rational Thinker",
        "investing_style": (
            "Advocates for value investing with a focus on quality businesses and "
            "long-term growth through rational decision-making."
        ),
    },
    "michael_burry": {
        "display_name": "Michael Burry",
        "description": "The Big Short Contrarian",
        "investing_style": (
            "Makes contrarian bets, often shorting overvalued markets and investing in "
            "undervalued assets through deep fundamental analysis."
        ),
    },
    "mohnish_pabrai": {
        "display_name": "Mohnish Pabrai",
        "description": "The Dhandho Investor",
        "investing_style": (
            "Focuses on value investing and long-term growth through fundamental "
            "analysis and a margin of safety."
        ),
    },
    "peter_lynch": {
        "display_name": "Peter Lynch",
        "description": "The 10-Bagger Investor",
        "investing_style": (
            "Invests in companies with understandable business models and strong growth "
            "potential using the 'buy what you know' strategy."
        ),
    },
    "phil_fisher": {
        "display_name": "Phil Fisher",
        "description": "The Scuttlebutt Investor",
        "investing_style": (
            "Emphasizes investing in companies with strong management and innovative "
            "products, focusing on long-term growth through scuttlebutt research."
        ),
    },
    "rakesh_jhunjhunwala": {
        "display_name": "Rakesh Jhunjhunwala",
        "description": "The Big Bull Of India",
        "investing_style": (
            "Leverages macroeconomic insights to invest in high-growth sectors, "
            "particularly within emerging markets and domestic opportunities."
        ),
    },
    "stanley_druckenmiller": {
        "display_name": "Stanley Druckenmiller",
        "description": "The Macro Investor",
        "investing_style": (
            "Focuses on macroeconomic trends, making large bets on currencies, "
            "commodities, and interest rates through top-down analysis."
        ),
    },
    "warren_buffett": {
        "display_name": "Warren Buffett",
        "description": "The Oracle of Omaha",
        "investing_style": (
            "Seeks companies with strong fundamentals and competitive advantages through "
            "value investing and long-term ownership."
        ),
    },
    "technical_analyst": {
        "display_name": "Technical Analyst",
        "description": "Chart Pattern Specialist",
        "investing_style": (
            "Focuses on chart patterns and market trends using technical indicators "
            "and price action analysis."
        ),
    },
    "fundamentals_analyst": {
        "display_name": "Fundamentals Analyst",
        "description": "Financial Statement Specialist",
        "investing_style": (
            "Delves into financial statements and economic indicators to assess "
            "intrinsic value through fundamental analysis."
        ),
    },
    "growth_analyst": {
        "display_name": "Growth Analyst",
        "description": "Growth Specialist",
        "investing_style": (
            "Analyzes growth trends and valuation to identify growth opportunities."
        ),
    },
    "news_sentiment_analyst": {
        "display_name": "News Sentiment Analyst",
        "description": "News Sentiment Specialist",
        "investing_style": (
            "Analyzes news sentiment to predict market movements and identify "
            "opportunities through news analysis."
        ),
    },
    "sentiment_analyst": {
        "display_name": "Sentiment Analyst",
        "description": "Market Sentiment Specialist",
        "investing_style": (
            "Gauges market sentiment and investor behavior to predict market "
            "movements through behavioral analysis."
        ),
    },
    "valuation_analyst": {
        "display_name": "Valuation Analyst",
        "description": "Company Valuation Specialist",
        "investing_style": (
            "Specializes in determining fair value using valuation models and "
            "financial metrics."
        ),
    },
}


def persona_blocks_for_prompt(keys: list[str]) -> str:
    lines: list[str] = []
    for k in keys:
        p = LEGENDARY_INVESTOR_PERSONAS[k]
        lines.append(
            f"- **{p['display_name']}** ({p['description']}): {p['investing_style']}"
        )
    return "\n".join(lines)


def debate_agent_batches(batch_size: int = 6) -> list[list[str]]:
    keys = list(LEGENDARY_INVESTOR_PERSONAS.keys())
    return [keys[i : i + batch_size] for i in range(0, len(keys), batch_size)]

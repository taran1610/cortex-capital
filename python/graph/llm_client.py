"""Groq (primary) + Anthropic Claude fallback for the swarm."""

from __future__ import annotations

import os
from typing import Any

from dotenv import load_dotenv

load_dotenv()


def chat_completion(
    system: str,
    user: str,
    *,
    temperature: float = 0.2,
    max_tokens: int = 4096,
) -> str:
    """
    Returns assistant text. Tries Groq first, then Anthropic on failure.
    """
    groq_key = os.getenv("GROQ_API_KEY")
    groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    anthropic_model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")

    if groq_key:
        try:
            from groq import Groq

            client = Groq(api_key=groq_key)
            res = client.chat.completions.create(
                model=groq_model,
                temperature=temperature,
                max_tokens=max_tokens,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            )
            return (res.choices[0].message.content or "").strip()
        except Exception:
            pass

    if anthropic_key:
        from anthropic import Anthropic

        client = Anthropic(api_key=anthropic_key)
        msg = client.messages.create(
            model=anthropic_model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        parts: list[str] = []
        for b in msg.content:
            if b.type == "text":
                parts.append(b.text)
        return "\n".join(parts).strip()

    raise RuntimeError(
        "No LLM configured: set GROQ_API_KEY and/or ANTHROPIC_API_KEY in python/.env"
    )


def chat_json(
    system: str,
    user: str,
    *,
    temperature: float = 0.1,
) -> dict[str, Any]:
    """Ask the model for strict JSON (parsed); raises if invalid."""
    import json
    import re

    raw = chat_completion(
        system=system + "\nRespond with valid JSON only. No markdown fences.",
        user=user,
        temperature=temperature,
        max_tokens=2048,
    )
    raw = raw.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        m = re.search(r"\{[\s\S]*\}", raw)
        if m:
            return json.loads(m.group())
        raise

import { NextResponse } from "next/server";

const DEFAULT_OLLAMA_MODEL = "llama3.1";

type Body = {
  provider?: "ollama" | "openrouter";
  model?: string;
  prompt: string;
  userId?: string;
};

function estimateTokens(text: string): number {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(words * 1.33);
}

const COSTS_PER_TOKEN: Record<string, number> = {
  [DEFAULT_OLLAMA_MODEL]: 0,
  "gpt-4o-mini": 0.000002,
};

const DEMO_MODE = process.env.LLM_DEMO_MODE === "true";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export const revalidate = 0;

export async function POST(req: Request) {
  const { prisma } = await import("@/lib/prisma");
  const b = (await req.json()) as Body;

  const provider = b.provider ?? "ollama";
  const model = b.model ?? DEFAULT_OLLAMA_MODEL;
  const prompt = (b.prompt ?? "").trim();
  const userId = b.userId; // optional, but we won't enforce FK

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const t0 = Date.now();
  let responseText = "";

  // ---------------- DEMO MODE ----------------
  if (DEMO_MODE) {
    // Generate a fake-but-nice response for demo
    responseText =
      `Demo mode is enabled for this instance of SentinelAI.\n\n` +
      `Prompt:\n${prompt}\n\n` +
      `In a real deployment, this content would come from the selected model ` +
      `("${provider}:${model}") and be fully logged and analyzed.`;

    const latencyMs = 400 + Math.floor(Math.random() * 400);
    const promptTokens = estimateTokens(prompt);
    const respTokens = estimateTokens(responseText);
    const costUsd = (COSTS_PER_TOKEN[model] ?? 0) * (promptTokens + respTokens);

    // Try to log the call, but DO NOT force userId (avoids P2003)
    let row:
      | {
          id: string;
          createdAt: Date;
          model: string;
          latencyMs: number;
          promptTokens: number;
          respTokens: number;
          costUsd: number;
          status: "SUCCESS" | "FAIL" | "FLAGGED";
        }
      | null = null;

    try {
      row = await prisma.modelCall.create({
        data: {
          // userId is optional relation; skip it in demo to avoid FK issues
          model,
          prompt,
          response: responseText,
          latencyMs,
          promptTokens,
          respTokens,
          costUsd,
          status: "SUCCESS",
        },
        select: {
          id: true,
          createdAt: true,
          model: true,
          latencyMs: true,
          promptTokens: true,
          respTokens: true,
          costUsd: true,
          status: true,
        },
      });
    } catch {
      // If DB fails (e.g. Prisma not configured in local dev), still return a fake row
      row = {
        id: `demo-${Date.now()}`,
        createdAt: new Date(),
        model,
        latencyMs,
        promptTokens,
        respTokens,
        costUsd,
        status: "SUCCESS",
      };
    }

    return NextResponse.json({ ok: true, call: row, response: responseText });
  }

  // ---------------- REAL MODE (OLLAMA / OPENROUTER) ----------------
  const OLLAMA_BASE = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";

  try {
    if (provider === "ollama") {
      const r = await fetch(`${OLLAMA_BASE}/api/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model, prompt, stream: false }),
      });
      if (!r.ok) {
        const msg = await r.text();
        throw new Error(`Ollama error ${r.status}: ${msg}`);
      }
      const j = await r.json();
      // adjust depending on your Ollama response shape
      responseText = j.response ?? "";
    } else {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || ""}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!r.ok) {
        const msg = await r.text();
        throw new Error(`OpenRouter error ${r.status}: ${msg}`);
      }
      const j = await r.json();
      responseText = j.choices?.[0]?.message?.content ?? "";
    }
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : "Unknown error";

    const failed = await prisma.modelCall.create({
      data: {
        model,
        prompt,
        response: `ERROR: ${errMsg}`,
        latencyMs: Date.now() - t0,
        promptTokens: estimateTokens(prompt),
        respTokens: 0,
        costUsd: 0,
        status: "FAIL",
      },
    });

    return NextResponse.json(
      { ok: false, error: errMsg, callId: failed.id },
      { status: 502 }
    );
  }

  const latencyMs = Date.now() - t0;
  const promptTokens = estimateTokens(prompt);
  const respTokens = estimateTokens(responseText);
  const costUsd = (COSTS_PER_TOKEN[model] ?? 0) * (promptTokens + respTokens);

  const row = await prisma.modelCall.create({
    data: {
      model,
      prompt,
      response: responseText,
      latencyMs,
      promptTokens,
      respTokens,
      costUsd,
      status: "SUCCESS",
    },
    select: {
      id: true,
      createdAt: true,
      model: true,
      latencyMs: true,
      promptTokens: true,
      respTokens: true,
      costUsd: true,
      status: true,
    },
  });

  return NextResponse.json({ ok: true, call: row, response: responseText });
}

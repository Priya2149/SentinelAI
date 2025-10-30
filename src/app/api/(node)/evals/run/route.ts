import { NextResponse } from "next/server";

import OpenAI from "openai";
import { z } from "zod";

// --- Helpers ---
function getOptionalEnv(name: string): string | null {
  const v = process.env[name];
  return v ?? null;
}
export const runtime = "nodejs";
export const revalidate = 0; 

export const dynamic = "force-dynamic";
const BodySchema = z.object({
  userId: z.string().min(1).default("anonymous"),
  model: z.string().min(1).default("gpt-4o-mini"),
  prompt: z.string().default(""),
});

type Body = z.infer<typeof BodySchema>;

export async function POST(req: Request) {
  const { prisma } = await import("@/lib/prisma");
  try {
    // Parse and validate body
    const raw: unknown = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request body",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { userId, model: modelUsed, prompt }: Body = parsed.data;

    // --- Init OpenAI client here (runtime only) ---
    const apiKey = getOptionalEnv("OPENAI_API_KEY");
    if (!apiKey) {
      // No key: we won't call OpenAI, but we won't crash build either.
      // We'll record a FAILED modelCall row so your dashboard still has data.
      const row = await prisma.modelCall.create({
        data: {
          userId: userId,
          model: modelUsed,
          prompt: prompt,
          response: "OpenAI key missing",
          latencyMs: 0,
          promptTokens: 0,
          respTokens: 0,
          costUsd: 0,
          status: "FAIL",
        },
      });

      return NextResponse.json(
        {
          ok: false,
          error: "Missing OPENAI_API_KEY",
          call: row,
        },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // --- Call model
    const start = Date.now();
    const chatResponse = await openai.chat.completions.create({
      model: modelUsed,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
    });
    const latencyMs = Date.now() - start;

    const responseText: string =
      chatResponse.choices[0]?.message?.content ?? "";

    const promptTokens: number =
      chatResponse.usage?.prompt_tokens ?? 0;
    const respTokens: number =
      chatResponse.usage?.completion_tokens ?? 0;
    const totalTokens: number =
      chatResponse.usage?.total_tokens ??
      promptTokens + respTokens;

    // (Very rough) cost calc example
    const costUsd: number =
      (promptTokens / 1000) * 0.0005 +
      (respTokens / 1000) * 0.0015;

    // Save call record
    const row = await prisma.modelCall.create({
      data: {
        userId: userId,
        model: modelUsed,
        prompt: prompt,
        response: responseText,
        latencyMs: latencyMs,
        promptTokens: promptTokens,
        respTokens: respTokens,
        costUsd: costUsd,
        status: "SUCCESS",
      },
    });

    return NextResponse.json({
      ok: true,
      call: row,
      response: responseText,
      tokens: {
        prompt: promptTokens,
        response: respTokens,
        total: totalTokens,
      },
      costUsd,
      latencyMs,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : "Unknown error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

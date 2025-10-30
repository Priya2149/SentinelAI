import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0; 

/* ------------ helpers ------------ */
function percentile(sorted: number[], q: number): number {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(q * sorted.length));
  return sorted[idx] ?? 0;
}

async function computeLast60s() {
  const since = new Date(Date.now() - 60 * 1000);
  const rows = await prisma.modelCall.findMany({
    where: { createdAt: { gte: since } }, // change to `ts` if your column is named differently
    select: { latencyMs: true, status: true, costUsd: true },
  });

  const calls = rows.length;
  const errors = rows.filter(r => r.status !== "SUCCESS").length;
  const errorRate = calls ? (errors / calls) * 100 : 0;

  const lats = rows.map(r => r.latencyMs || 0).sort((a,b) => a - b);
  const avgLatency = lats.length ? Math.round(lats.reduce((s,v)=>s+v,0)/lats.length) : 0;

  const p50 = percentile(lats, 0.5);
  const p95 = percentile(lats, 0.95);
  const p99 = percentile(lats, 0.99);

  const cost60s = Number(rows.reduce((s,r)=>s+(r.costUsd || 0), 0).toFixed(6));

  return {
    totalCalls: await prisma.modelCall.count(),
    recentCalls: calls,       // legacy
    avgLatency,               // legacy
    errorCount: errors,       // legacy
    callsPerMin: calls,
    errorRate,
    p50, p95, p99,
    cost60s,
    timestamp: new Date().toISOString(),
  };
}

/* ------------ GET: SSE stream ------------ */
// Note: we accept the Request so we can listen for aborts
export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        const payload = `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      // initial snapshot
      try {
        const snap = await computeLast60s();
        send("message", snap);
      } catch {
        send("error", { error: "init_failed" });
      }

      // periodic updates
      timer = setInterval(async () => {
        try {
          const snap = await computeLast60s();
          send("message", snap);
        } catch {
          send("error", { error: "tick_failed" });
        }
      }, 5000);

      // close if client disconnects
      req.signal.addEventListener("abort", () => {
        if (timer) clearInterval(timer);
        controller.close();
      });
    },

    cancel() {
      if (timer) clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

/* ------------ POST: one-shot polling JSON ------------ */
export async function POST() {
  try {
    const snapshot = await computeLast60s();
    return Response.json(snapshot);
  } catch {
    return Response.json({ error: "failed" }, { status: 500 });
  }
}

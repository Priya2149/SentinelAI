import { getMetricsRealtimeSnapshot } from "@/server/metrics/metrics.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        const payload =
          `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;

        controller.enqueue(encoder.encode(payload));
      };

      try {
        const snapshot = await getMetricsRealtimeSnapshot();
        send("message", snapshot);
      } catch {
        send("error", { error: "init_failed" });
      }

      timer = setInterval(async () => {
        try {
          const snapshot = await getMetricsRealtimeSnapshot();
          send("message", snapshot);
        } catch {
          send("error", { error: "tick_failed" });
        }
      }, 5000);

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

export async function POST() {
  try {
    const snapshot = await getMetricsRealtimeSnapshot();
    return Response.json(snapshot);
  } catch {
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
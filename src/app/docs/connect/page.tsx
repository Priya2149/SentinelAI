export const dynamic = "force-dynamic";
export default function ConnectPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Connect your models</h1>
      <p className="text-muted-foreground">These examples illustrate how applications could send LLM metadata to SentinelAI via <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">/api/logs/ingest</code>. in a fully integrated setup.
      The current public version runs in demo mode and does not require real API keys or providers.</p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">JavaScript / TypeScript (OpenAI)</h2>
        <pre className="bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`import OpenAI from "openai";
async function callAndLog(prompt) {
  const start = Date.now();
  const r = await new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    .chat.completions.create({ model: "gpt-4o-mini", messages: [{ role:"user", content: prompt }] });
  const latencyMs = Date.now() - start;
  const u = r.usage || {};
  await fetch("/api/logs/ingest", { method: "POST", headers: { "content-type":"application/json", Authorization: "Bearer ${process.env.INGEST_TOKEN ?? "INGEST_TOKEN"}" },
    body: JSON.stringify({ events: [{
      id: crypto.randomUUID(), ts: new Date().toISOString(),
      provider:"openai", model:"gpt-4o-mini", endpoint:"chat",
      latencyMs, promptTokens:u.prompt_tokens||0, completionTokens:u.completion_tokens||0, totalTokens:u.total_tokens||0,
      status:"SUCCESS"
    }]})
  });
  return r.choices?.[0]?.message?.content || "";
}`}
        </pre>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Python (generic)</h2>
        <pre className="bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`import time, uuid, requests
def log_event(provider, model, latency_ms, pt=0, ct=0, status="SUCCESS"):
    requests.post("https://YOUR-APP.com/api/logs/ingest",
        headers={"content-type":"application/json","authorization":"Bearer YOUR_INGEST_TOKEN"},
        json={"events":[{"id":str(uuid.uuid4()),"ts":time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                         "provider":provider,"model":model,"endpoint":"chat","latencyMs":latency_ms,
                         "promptTokens":pt,"completionTokens":ct,"totalTokens":pt+ct,"status":status}]})
`}
        </pre>
      </section>
    </div>
  );
}

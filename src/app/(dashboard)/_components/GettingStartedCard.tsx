export function GettingStartedCard() {
  return (
    <section className="mt-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Getting Started
          </div>

          <ol className="list-inside list-decimal space-y-0.5 text-xs text-muted-foreground">
            <li>
              Explore the charts and tables below to see how SentinelAI tracks
              AI usage, cost, latency, and errors using realistic demo data.
            </li>
            <li>
              Open the Logs page to inspect how LLM calls would appear in a real
              deployment.
            </li>
            <li>
              Visit{" "}
              <a
                className="font-medium underline"
                href="/docs/connect"
                rel="noreferrer"
              >
                Connect
              </a>{" "}
              Docs to see a conceptual example of how applications could POST
              events to `/api/logs/ingest` in a full version of SentinelAI.
            </li>
          </ol>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/playground"
            className="whitespace-nowrap rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-indigo-700"
          >
            Run a test
          </a>

          <a
            href="/docs/connect"
            className="whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-medium"
          >
            Integration guide
          </a>
        </div>
      </div>
    </section>
  );
}
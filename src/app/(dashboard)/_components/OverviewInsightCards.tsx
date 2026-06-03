import type {
  OverviewCallRow,
  OverviewCounts,
} from "@/server/overview/overview.types";

export function OverviewInsightCards({
  counts,
  latest,
}: {
  counts: OverviewCounts;
  latest: OverviewCallRow[];
}) {
  return (
    <section className="space-y-4">
      <InsightCard
        title="Reliability"
        description="Success vs failure share"
        items={[
          { label: "Success", value: counts.ok, tone: "green" },
          { label: "Failures", value: counts.fail, tone: "red" },
          { label: "Flagged", value: counts.flagged, tone: "amber" },
        ]}
      />

      <InsightCard
        title="Throughput (last 10)"
        description="Latency distribution"
        items={latest.slice(0, 5).map((row, index) => ({
          label: `Call #${index + 1}`,
          value: row.latencyMs,
          tone:
            row.latencyMs < 500
              ? "green"
              : row.latencyMs < 1000
              ? "amber"
              : "red",
        }))}
      />
    </section>
  );
}

function InsightCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: { label: string; value: number; tone: "green" | "amber" | "red" }[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {description}
        </p>
      </div>

      <ul className="space-y-3 px-4 py-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between">
            <span className="text-xs sm:text-sm">{item.label}</span>

            <span
              className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 font-mono text-[11px] sm:text-xs ${
                item.tone === "green"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : item.tone === "amber"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
              }`}
            >
              {item.value.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
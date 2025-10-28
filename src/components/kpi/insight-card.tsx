export function InsightCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: { label: string; value: number; tone: "green" | "amber" | "red" }[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="px-5 py-4 space-y-3">
        {items.map((it) => (
          <li key={it.label} className="flex items-center justify-between">
            <span className="text-sm">{it.label}</span>
            <span
              className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-mono ${
                it.tone === "green"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : it.tone === "amber"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
              }`}
            >
              {it.value.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default InsightCard;
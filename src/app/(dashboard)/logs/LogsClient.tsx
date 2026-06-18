"use client";

import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Download,
  Filter,
  Search as SearchIcon,
  Eye,
  MoreVertical,
  X,
} from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

import type {
  LogRow,
  LogsFilterOptions,
  RangeKey,
  StatusKey,
} from "@/server/logs/logs.types";

type ControlsDefaults = {
  q: string;
  statusList: StatusKey[];
  model: string;
  userEmail: string;
  minLatency?: number;
  maxLatency?: number;
  minCost?: number;
  maxCost?: number;
  range: RangeKey;
};

type LogsClientProps = {
  initialRows: LogRow[];
  filterOptions: LogsFilterOptions;
  defaults: ControlsDefaults;
};

type Overrides = Partial<
  Record<
    | "q"
    | "status"
    | "model"
    | "user"
    | "minLatency"
    | "maxLatency"
    | "minCost"
    | "maxCost"
    | "range",
    string | undefined
  >
>;

function csvEscape(cell: string): string {
  return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

function formatRelativeTime(d: Date | string): string {
  const now = new Date();
  const date = new Date(d);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function LogsClient({
 initialRows,
  filterOptions,
  defaults,
}: LogsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(defaults.q);
  const [status, setStatus] = useState<StatusKey[]>(defaults.statusList);
  const [model, setModel] = useState(defaults.model);
  const [userEmail, setUserEmail] = useState(defaults.userEmail);
  const [minLatency, setMinLatency] = useState(
    defaults.minLatency?.toString() ?? "",
  );
  const [maxLatency, setMaxLatency] = useState(
    defaults.maxLatency?.toString() ?? "",
  );
  const [minCost, setMinCost] = useState(
    defaults.minCost?.toString() ?? "",
  );
  const [maxCost, setMaxCost] = useState(
    defaults.maxCost?.toString() ?? "",
  );
  const [range, setRange] = useState<RangeKey>(defaults.range);

const models = useMemo(
  () => Array.from(new Set(filterOptions.models)).sort(),
  [filterOptions.models]
);

const users = useMemo(
  () => Array.from(new Set(filterOptions.users)).sort(),
  [filterOptions.users]
);
  const apply = useCallback(
    (overrides?: Overrides) => {
      const next = new URLSearchParams(searchParams?.toString() ?? "");
      const setOrDel = (k: string, v?: string) => {
        if (v && v.trim() !== "") next.set(k, v);
        else next.delete(k);
      };

      setOrDel("q", overrides?.q ?? q);
      setOrDel(
        "status",
        overrides?.status ?? (status.length ? status.join(",") : undefined),
      );
      setOrDel("model", overrides?.model ?? model);
      setOrDel("user", overrides?.user ?? userEmail);
      setOrDel("minLatency", overrides?.minLatency ?? minLatency);
      setOrDel("maxLatency", overrides?.maxLatency ?? maxLatency);
      setOrDel("minCost", overrides?.minCost ?? minCost);
      setOrDel("maxCost", overrides?.maxCost ?? maxCost);
      setOrDel("range", overrides?.range ?? range);

      next.delete("page");
      next.set("ts", Date.now().toString());

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [
      searchParams,
      q,
      status,
      model,
      userEmail,
      minLatency,
      maxLatency,
      minCost,
      maxCost,
      range,
      pathname,
      router,
    ],
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      apply({ q });
    },
    [apply, q],
  );

  const exportCsv = useCallback(() => {
    if (!initialRows.length) return;

    const headers = [
      "id",
      "timestamp",
      "user",
      "model",
      "latency_ms",
      "prompt_tokens",
      "response_tokens",
      "tokens_total",
      "cost_usd",
      "status",
    ];
    const lines: string[] = [headers.join(",")];

    initialRows.forEach((r) => {
      const row = [
        r.id,
        new Date(r.at).toISOString(),
        r.user,
        r.model,
        String(r.latency),
        String(r.promptTokens),
        String(r.respTokens),
        String(r.tokens),
        String(r.cost),
        String(r.status),
      ];
      lines.push(row.map(csvEscape).join(","));
    });

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `sentinel-logs-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [initialRows]);
const toggleStatus = (value: StatusKey) => {
  // compute new list based on current state
  const next = status.includes(value)
    ? status.filter((s) => s !== value)
    : [...status, value];

  // update local state for the pills
  setStatus(next);

  // push to URL so server sees it
  apply({
    status: next.length ? next.join(",") : undefined, // if empty, remove param
  });
};

  // const lastUpdatedLabel = useMemo(
  //   () => formatRelativeTime(lastUpdated),
  //   [lastUpdated],
  // );

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 shadow-sm w-full sm:w-[320px]"
        >
          <SearchIcon className="h-4 w-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search id, model, user..."
            className="flex-1 bg-transparent text-xs focus:outline-none"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                apply({ q: "" });
              }}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </form>

        {/* Filters + Export */}
        <div className="flex items-center gap-2 justify-end flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-gray-50">
                <Filter className="h-3.5 w-3.5" />
                Filters
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[420px] text-xs space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Status */}
                <div>
                  <div className="text-[11px] font-semibold uppercase text-gray-500">
                    Status
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {(["SUCCESS", "FAIL", "FLAGGED"] as StatusKey[]).map(
                      (s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleStatus(s)}
                          className={`rounded-full border px-2.5 py-1 text-[11px] ${
                            status.includes(s)
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {s}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Model */}
                <div>
                  <div className="text-[11px] font-semibold uppercase text-gray-500">
                    Model
                  </div>
                  <select
                    className="mt-1 w-full rounded-lg border px-2.5 py-1.5 bg-background"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <option value="">All</option>
                    {models.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* User */}
                <div>
                  <div className="text-[11px] font-semibold uppercase text-gray-500">
                    User (email)
                  </div>
                  <input
                    className="mt-1 w-full rounded-lg border px-2.5 py-1.5 bg-background"
                    placeholder="contains..."
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    list="logs-user-options"
                  />

                  <datalist id="logs-user-options">
                    {users.map((user) => (
                      <option key={user} value={user} />
                    ))}
                  </datalist>
                </div>

                {/* Time range */}
                <div>
                  <div className="text-[11px] font-semibold uppercase text-gray-500">
                    Time range
                  </div>
                  <select
                    className="mt-1 w-full rounded-lg border px-2.5 py-1.5 bg-background"
                    value={range}
                    onChange={(e) => setRange(e.target.value as RangeKey)}
                  >
                    <option value="24h">Last 24h</option>
                    <option value="3d">Last 3 days</option>
                    <option value="7d">Last 7 days</option>
                    <option value="all">All time</option>
                  </select>
                </div>

                {/* Latency */}
                <div>
                  <div className="text-[11px] font-semibold uppercase text-gray-500">
                    Latency (ms)
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      className="w-full rounded-lg border px-2 py-1.5 bg-background"
                      placeholder="min"
                      value={minLatency}
                      onChange={(e) => setMinLatency(e.target.value)}
                      inputMode="numeric"
                    />
                    <span className="text-[11px] text-muted-foreground">
                      to
                    </span>
                    <input
                      className="w-full rounded-lg border px-2 py-1.5 bg-background"
                      placeholder="max"
                      value={maxLatency}
                      onChange={(e) => setMaxLatency(e.target.value)}
                      inputMode="numeric"
                    />
                  </div>
                </div>

                {/* Cost */}
                <div>
                  <div className="text-[11px] font-semibold uppercase text-gray-500">
                    Cost (USD)
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      className="w-full rounded-lg border px-2 py-1.5 bg-background"
                      placeholder="min"
                      value={minCost}
                      onChange={(e) => setMinCost(e.target.value)}
                      inputMode="decimal"
                    />
                    <span className="text-[11px] text-muted-foreground">
                      to
                    </span>
                    <input
                      className="w-full rounded-lg border px-2 py-1.5 bg-background"
                      placeholder="max"
                      value={maxCost}
                      onChange={(e) => setMaxCost(e.target.value)}
                      inputMode="decimal"
                    />
                  </div>
                </div>
              </div>

              {/* Popover footer */}
              <div className="flex items-center justify-end pt-1 border-t mt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => {
                      setQ("");
                      setStatus([]);
                      setModel("");
                      setUserEmail("");
                      setMinLatency("");
                      setMaxLatency("");
                      setMinCost("");
                      setMaxCost("");
                      setRange("24h");
                      apply({
                        q: "",
                        status: undefined,
                        model: "",
                        user: "",
                        minLatency: "",
                        maxLatency: "",
                        minCost: "",
                        maxCost: "",
                        range: "24h",
                      });
                    }}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    onClick={() => apply()}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Export */}
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 text-white px-3.5 py-1.5 text-xs font-medium shadow-sm hover:bg-blue-700"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------- Auto Refresh Header Component ---------- */
export function AutoRefreshHeader({ 
  autoRefresh, 
  setAutoRefresh,
  lastUpdated 
}: { 
  autoRefresh: boolean; 
  setAutoRefresh: (value: boolean) => void;
  lastUpdated: string;
}) {
  return (
    <div className="flex items-center gap-4 text-sm text-gray-400" id="auto-refresh-header">
      <div className="flex items-center gap-2">
        <span>Auto-refresh:</span>
        <Switch
          checked={autoRefresh}
          onCheckedChange={setAutoRefresh}
          className="data-[state=checked]:bg-blue-600"
        />
        <span className="font-medium">{autoRefresh ? 'ON' : 'OFF'}</span>
      </div>
      <span className="text-gray-600">•</span>
      <span>Last updated: {lastUpdated}</span>
    </div>
  );
}

/* ---------- RowActions: eye + 3 dots side-by-side ---------- */

export function RowActions({ row }: { row: LogRow }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const copy = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const csvLine = useMemo(() => {
    const fields: string[] = [
      row.id,
      new Date(row.at).toISOString(),
      row.user,
      row.model,
      String(row.latency),
      String(row.promptTokens),
      String(row.respTokens),
      String(row.tokens),
      String(row.cost),
      String(row.status),
    ];
    return fields.map(csvEscape).join(",");
  }, [row]);

  return (
    <div className="relative inline-flex items-center gap-1">
      {/* Eye */}
      <button
        className="inline-flex p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        onClick={() => setOpen(true)}
        aria-label="View details"
      >
        <Eye className="h-4 w-4" />
      </button>

      {/* 3 dots */}
      <button
        className="inline-flex p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="More actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {/* Menu */}
      {menuOpen && (
        <div className="absolute right-0 top-7 z-20 w-40 rounded-md border bg-popover text-xs shadow-lg">
          <button
            className="block w-full px-3 py-2 text-left hover:bg-accent"
            onClick={() => {
              copy(row.id);
              setMenuOpen(false);
            }}
          >
            Copy ID
          </button>
          <button
            className="block w-full px-3 py-2 text-left hover:bg-accent"
            onClick={() => {
              copy(JSON.stringify(row, null, 2));
              setMenuOpen(false);
            }}
          >
            Copy as JSON
          </button>
          <button
            className="block w-full px-3 py-2 text-left hover:bg-accent"
            onClick={() => {
              copy(csvLine);
              setMenuOpen(false);
            }}
          >
            Copy as CSV row
          </button>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="max-w-3xl w-full mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Call details
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-4 py-3 space-y-3 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <InfoCard label="ID" value={row.id} />
                <InfoCard label="User" value={row.user || "—"} />
                <InfoCard label="Model" value={row.model} />
                <InfoCard label="Latency" value={`${row.latency} ms`} />
                <InfoCard
                  label="Tokens"
                  value={`${row.tokens.toLocaleString()} (${row.promptTokens}↑ / ${row.respTokens}↓)`}
                />
                <InfoCard
                  label="Cost"
                  value={`$${row.cost.toFixed(5)}`}
                />
                <InfoCard label="Status" value={row.status} />
              </div>

              {/* Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Input
                  </h3>
                  <button
                    onClick={() =>
                      copy(
                        row.input !== undefined
                          ? typeof row.input === "string"
                            ? row.input
                            : JSON.stringify(row.input, null, 2)
                          : "",
                      )
                    }
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Copy
                  </button>
                </div>
                <pre className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 max-h-48 overflow-auto">
                  {row.input !== undefined
                    ? JSON.stringify(row.input, null, 2)
                    : "—"}
                </pre>
              </div>

              {/* Output */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Output
                  </h3>
                  <button
                    onClick={() =>
                      copy(
                        row.output !== undefined
                          ? typeof row.output === "string"
                            ? row.output
                            : JSON.stringify(row.output, null, 2)
                          : "",
                      )
                    }
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Copy
                  </button>
                </div>
                <pre className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 max-h-48 overflow-auto">
                  {row.output !== undefined
                    ? JSON.stringify(row.output, null, 2)
                    : "—"}
                </pre>
              </div>

              {/* Meta */}
              {row.meta !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-purple-500" />
                      Metadata
                    </h3>
                    <button
                      onClick={() => copy(JSON.stringify(row.meta, null, 2))}
                      className="text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 max-h-48 overflow-auto">
                    {JSON.stringify(row.meta, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95">
              <button
                onClick={() => copy(JSON.stringify(row, null, 2))}
                className="px-4 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Copy all as JSON
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60">
      <div className="text-[11px] text-muted-foreground mb-1">{label}</div>
      <div className="text-xs font-medium break-words">{value}</div>
    </div>
  );
}
"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Eye, MoreVertical, X } from "lucide-react";
import type { LogRow } from "@/server/logs/logs.types";

function csvEscape(cell: string): string {
  return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

export function LogRowActions({ row }: { row: LogRow }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const copy = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard can fail in unsupported browsers.
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
      <button
        className="inline-flex rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
        onClick={() => setOpen(true)}
        aria-label="View details"
      >
        <Eye className="h-4 w-4" />
      </button>

      <button
        className="inline-flex rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
        onClick={() => setMenuOpen((value) => !value)}
        aria-label="More actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

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

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="mx-4 flex max-h-[80vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Eye className="h-4 w-4" />
                Call details
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-auto px-4 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <InfoCard label="ID" value={row.id} />
                <InfoCard label="User" value={row.user || "—"} />
                <InfoCard label="Model" value={row.model} />
                <InfoCard label="Latency" value={`${row.latency} ms`} />
                <InfoCard
                  label="Tokens"
                  value={`${row.tokens.toLocaleString()} (${row.promptTokens}↑ / ${row.respTokens}↓)`}
                />
                <InfoCard label="Cost" value={`$${row.cost.toFixed(5)}`} />
                <InfoCard label="Status" value={row.status} />
              </div>

              <JsonBlock title="Input" value={row.input} onCopy={copy} />
              <JsonBlock title="Output" value={row.output} onCopy={copy} />

              {row.meta !== undefined && (
                <JsonBlock title="Metadata" value={row.meta} onCopy={copy} />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-white/95 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/95">
              <button
                onClick={() => copy(JSON.stringify(row, null, 2))}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Copy all as JSON
              </button>

              <button
                onClick={() => setOpen(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs text-white hover:bg-blue-700"
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
    <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-700 dark:bg-gray-800/60">
      <div className="mb-1 text-[11px] text-muted-foreground">{label}</div>
      <div className="break-words text-xs font-medium">{value}</div>
    </div>
  );
}

function JsonBlock({
  title,
  value,
  onCopy,
}: {
  title: string;
  value: unknown;
  onCopy: (text: string) => void;
}) {
  const display =
    value !== undefined
      ? typeof value === "string"
        ? value
        : JSON.stringify(value, null, 2)
      : "—";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          {title}
        </h3>

        <button
          onClick={() => onCopy(display)}
          className="text-[11px] text-muted-foreground hover:text-foreground"
        >
          Copy
        </button>
      </div>

      <pre className="max-h-48 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
        {display}
      </pre>
    </div>
  );
}
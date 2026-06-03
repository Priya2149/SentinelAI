import { AlertTriangle, Clock, User } from "lucide-react";
import LiveFeedHeader from "../LiveFeedHeader";
import type {
  LogRow,
  LogsPageData,
  ParsedLogsFilters,
} from "@/server/logs/logs.types";
import {
  CostCell,
  LatencyCell,
  ModelCell,
  StatusCell,
  TableHeaderCell,
  TimeCell,
  TokensCell,
  UserCell,
} from "./LogsTableCells";
import { LogRowActions } from "./LogRowActions";

type LogsTableProps = {
  rows: LogRow[];
  pagination: LogsPageData["pagination"];
  filters: ParsedLogsFilters;
  lastUpdated: Date;
};

export function LogsTable({
  rows,
  pagination,
  filters,
  lastUpdated,
}: LogsTableProps) {
  function pageHref(pageNumber: number) {
    const params = new URLSearchParams();

    if (filters.q) params.set("q", filters.q);
    if (filters.statusList.length) {
      params.set("status", filters.statusList.join(","));
    }
    if (filters.model) params.set("model", filters.model);
    if (filters.userEmail) params.set("user", filters.userEmail);
    if (filters.minLatency !== undefined) {
      params.set("minLatency", String(filters.minLatency));
    }
    if (filters.maxLatency !== undefined) {
      params.set("maxLatency", String(filters.maxLatency));
    }
    if (filters.minCost !== undefined) {
      params.set("minCost", String(filters.minCost));
    }
    if (filters.maxCost !== undefined) {
      params.set("maxCost", String(filters.maxCost));
    }
    if (filters.range !== "24h") params.set("range", filters.range);

    if (pageNumber > 1) {
      params.set("page", String(pageNumber));
    }

    const query = params.toString();
    return query ? `/logs?${query}` : "/logs";
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <LiveFeedHeader
          entriesLabel={`(${pagination.totalCount.toLocaleString()} entries)`}
          lastUpdated={lastUpdated}
        />
      </div>

      {rows.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
          <AlertTriangle className="mb-3 h-8 w-8 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            No logs found
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try clearing filters or changing the time range.
          </p>
        </div>
      ) : (
        <div className="overflow-x-hidden">
          <table className="w-full">
            <colgroup>
              <col style={{ width: "14%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "8%" }} />
            </colgroup>

            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
              <tr>
                <TableHeaderCell
                  title="Time"
                  icon={<Clock className="h-4 w-4" />}
                />
                <TableHeaderCell
                  title="User"
                  icon={<User className="h-4 w-4" />}
                />
                <TableHeaderCell title="Model" />
                <TableHeaderCell title="Latency" />
                <TableHeaderCell title="Tokens" />
                <TableHeaderCell title="Cost" />
                <TableHeaderCell title="Status" />
                <TableHeaderCell title="Actions" />
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={[
                    "border-b border-gray-200 transition hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-800/50",
                    row.id === filters.selectedId
                      ? "bg-blue-50 ring-1 ring-blue-300 dark:bg-blue-900/40"
                      : "",
                  ].join(" ")}
                >
                  <TimeCell value={row.at} />
                  <UserCell email={row.user} />
                  <ModelCell model={row.model} />
                  <LatencyCell latency={row.latency} />
                  <TokensCell
                    total={row.tokens}
                    prompt={row.promptTokens}
                    resp={row.respTokens}
                  />
                  <CostCell cost={row.cost} />
                  <StatusCell status={row.status} />

                  <td className="px-4 py-5">
                    <LogRowActions row={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>

        <div className="flex gap-2">
          <a
            href={pageHref(Math.max(1, pagination.currentPage - 1))}
            aria-disabled={!pagination.hasPreviousPage}
            className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Previous
          </a>

          <a
            href={pageHref(
              Math.min(pagination.totalPages, pagination.currentPage + 1)
            )}
            aria-disabled={!pagination.hasNextPage}
            className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Next
          </a>
        </div>
      </div>
    </div>
  );
}
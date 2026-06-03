export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import LogsClient from "./LogsClient";
import { LogsStatsGrid } from "./_components/LogsStatsGrid";
import { LogsTable } from "./_components/LogsTable";
import { getLogsPageData } from "@/server/logs/logs.service";
import type { LogsSearchParams } from "@/server/logs/logs.types";
export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<LogsSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const data = await getLogsPageData(resolvedSearchParams);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            API Call Logs
          </h1>
          <p className="mt-2 text-muted-foreground">
            View simulated LLM call logs with cost, latency, tokens, and safety
            signals — illustrating how real-time monitoring would work in a full
            integration.
          </p>
        </div>

        <LogsClient
          initialRows={data.rows}
          filterOptions={data.filterOptions}
          defaults={{
            q: data.filters.q,
            statusList: data.filters.statusList,
            model: data.filters.model,
            userEmail: data.filters.userEmail,
            minLatency: data.filters.minLatency,
            maxLatency: data.filters.maxLatency,
            minCost: data.filters.minCost,
            maxCost: data.filters.maxCost,
            range: data.filters.range,
          }}
        />
      </div>

      <LogsStatsGrid stats={data.stats} />

      <LogsTable
        rows={data.rows}
        pagination={data.pagination}
        filters={data.filters}
        lastUpdated={data.lastUpdated}
      />
    </div>
  );
}
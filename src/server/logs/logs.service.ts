import "server-only";

import type { LogsPageData, LogsSearchParams } from "./logs.types";
import { buildLogsWhere, parseLogsFilters } from "./logs.filters";
import {
  findLogsPage,
  getLogsFilterOptions,
  getLogsStats,
} from "./logs.repository";
import { mapModelCallToLogRow } from "./logs.utils";

export async function getLogsPageData(
  searchParams: LogsSearchParams
): Promise<LogsPageData> {
  const filters = parseLogsFilters(searchParams);
  const where = buildLogsWhere(filters);

  const [stats, filterOptions] = await Promise.all([
    getLogsStats(where),
    getLogsFilterOptions(),
  ]);

  const pageSize = filters.limit;
  const totalCount = stats.totalCalls;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(filters.page, totalPages);
  const skip = (safeCurrentPage - 1) * pageSize;

  const rawRows = await findLogsPage({
    where,
    skip,
    take: pageSize,
  });

  const rows = rawRows.map(mapModelCallToLogRow);
  const lastUpdated = rows[0]?.at ? new Date(rows[0].at) : new Date();

  return {
    rows,
    filters: {
      ...filters,
      page: safeCurrentPage,
    },
    stats,
    filterOptions,
    pagination: {
      currentPage: safeCurrentPage,
      totalPages,
      pageSize,
      totalCount,
      hasPreviousPage: safeCurrentPage > 1,
      hasNextPage: safeCurrentPage < totalPages,
    },
    lastUpdated,
  };
}
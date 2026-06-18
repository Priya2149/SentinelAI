import "server-only";

import { ensureAlwaysFreshData } from "@/lib/seedDemoDataAggressive";
import {
  RANGE_MS,
  type OverviewCounts,
  type OverviewPageData,
  type OverviewSearchParams,
  type RangeKey,
} from "./overview.types";
import {
  parseOverviewPage,
  parseOverviewRange,
} from "./overview.filters";
import {
  getLatestOverviewCalls,
  getStatusCountsSince,
} from "./overview.repository";

const PAGE_SIZE = 10;

async function loadCounts(range: RangeKey) {
  const since = new Date(Date.now() - RANGE_MS[range]);
  const counts = await getStatusCountsSince(since);

  const total = counts.reduce((sum, count) => {
    return sum + count._count.status;
  }, 0);

  return {
    range,
    since,
    counts,
    total,
  };
}

function buildCounts(
  counts: Awaited<ReturnType<typeof getStatusCountsSince>>,
  total: number
): OverviewCounts {
  const ok =
    counts.find((count) => count.status === "SUCCESS")?._count.status ?? 0;

  const fail =
    counts.find((count) => count.status === "FAIL")?._count.status ?? 0;

  const flagged =
    counts.find((count) => count.status === "FLAGGED")?._count.status ?? 0;

  return {
    total,
    ok,
    fail,
    flagged,
  };
}

export async function getOverviewPageData(
  searchParams: OverviewSearchParams = {}
): Promise<OverviewPageData> {
if (
  process.env.NODE_ENV === "development" &&
  process.env.SKIP_DEMO_SEED !== "true"
) {
  await ensureAlwaysFreshData();
}

  const requestedRange = parseOverviewRange(searchParams.range);
  let page = parseOverviewPage(searchParams.page);

  let countData = await loadCounts(requestedRange);

  if (countData.range === "24h" && countData.total === 0) {
    countData = await loadCounts("3d");
  }

  const totalPages = Math.max(1, Math.ceil(countData.total / PAGE_SIZE));

  if (page > totalPages) {
    page = totalPages;
  }

  const skip = (page - 1) * PAGE_SIZE;

  const latest = await getLatestOverviewCalls({
    since: countData.since,
    skip,
    take: PAGE_SIZE,
  });

  return {
    range: countData.range,
    since: countData.since,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
    skip,
    latest,
    counts: buildCounts(countData.counts, countData.total),
    refreshHref: `?range=${countData.range}&page=1&ts=${Date.now()}`,
  };
}
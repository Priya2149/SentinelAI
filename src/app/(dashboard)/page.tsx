export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { GettingStartedCard } from "./_components/GettingStartedCard";
import { LatestCallsTable } from "./_components/LatestCallsTable";
import { OverviewHero } from "./_components/OverviewHero";
import { OverviewInsightCards } from "./_components/OverviewInsightCards";
import { OverviewKpiGrid } from "./_components/OverviewKpiGrid";
import { getOverviewPageData } from "@/server/overview/overview.service";
import type { OverviewSearchParams } from "@/server/overview/overview.types";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<OverviewSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const data = await getOverviewPageData(resolvedSearchParams);

  return (
    <div className="relative isolate min-h-full p-0 sm:p-4">
      <OverviewHero range={data.range} refreshHref={data.refreshHref} />

     {data.counts.total === 0 ? <GettingStartedCard /> : null}

      <OverviewKpiGrid counts={data.counts} range={data.range} />

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)]">
        <LatestCallsTable
          latest={data.latest}
          range={data.range}
          total={data.counts.total}
          page={data.page}
          pageSize={data.pageSize}
          skip={data.skip}
        />

        <OverviewInsightCards counts={data.counts} latest={data.latest} />
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import VendorComparisonSection from "./VendorComparisonSection";
import { AnalyticsHeader } from "./_components/AnalyticsHeader";
import { AnalyticsInsightCards } from "./_components/AnalyticsInsightCards";
import { AnalyticsStatsGrid } from "./_components/AnalyticsStatsGrid";
import { ModelPerformanceTable } from "./_components/ModelPerformanceTable";
import { UserAnalyticsTable } from "./_components/UserAnalyticsTable";
import { getAnalyticsPageData } from "@/server/analytics/analytics.service";

export default async function AnalyticsPage() {
  const data = await getAnalyticsPageData();

  return (
    <div className="space-y-8 p-6">
      <AnalyticsHeader hasData={data.stats.hasData} />

      <AnalyticsStatsGrid stats={data.stats} />

      <AnalyticsInsightCards insights={data.insights} />

      <VendorComparisonSection vendors={data.vendorStats} />

      <ModelPerformanceTable
        models={data.byModel}
        totalCalls={data.stats.totalCalls}
      />

      <UserAnalyticsTable
        users={data.byUser}
        totalCalls={data.stats.totalCalls}
      />
    </div>
  );
}
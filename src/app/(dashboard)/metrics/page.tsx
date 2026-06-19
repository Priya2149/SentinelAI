"use client";

import { useMetrics } from "@/hooks/useMetrics";
import { DailyBreakdownTable } from "./_components/DailyBreakdownTable";
import { MetricsCharts } from "./_components/MetricsCharts";
import { MetricsHeader } from "./_components/MetricsHeader";
import { MetricsStatsGrid } from "./_components/MetricsStatsGrid";
import { PdfPreviewModal } from "@/components/pdf/PdfPreviewModal";
import { useComplianceReport } from "@/hooks/useComplianceReport";
import { MetricsPageSkeleton } from "./_components/MetricsPageSkeleton";

export default function MetricsPage() {
  const metrics = useMetrics();

  const report = useComplianceReport(metrics.pdfData);

  const firstDate = metrics.dailyData[0]?.date;
  const lastDate = metrics.dailyData[metrics.dailyData.length - 1]?.date;

  return (
    <div className="space-y-4 p-3 sm:p-4">
      {metrics.loading && !metrics.dailyData.length ? (
        <MetricsPageSkeleton  />
      ) : (
        <>
          <MetricsHeader
            timeRange={metrics.timeRange}
            setTimeRange={metrics.setTimeRange}
            lastUpdated={metrics.lastUpdated}
            loading={metrics.loading}
            previewLoading={report.previewLoading}
            downloading={report.downloading}
            totalCost={metrics.stats.totalCost}
            firstDate={firstDate}
            lastDate={lastDate}
            onRefresh={metrics.fetchData}
            onPreviewPdf={report.openPdfPreview}
            onDownloadPdf={report.downloadPdf}
            hallucinationRate={metrics.summaryData?.hallucination_rate ?? 0}
            toxicityRate={metrics.summaryData?.toxicity_rate ?? 0}
          />

          <MetricsStatsGrid stats={metrics.stats} />

          <MetricsCharts
            dailyData={metrics.dailyData}
            pieData={metrics.pieData}
          />

          <DailyBreakdownTable
            dailyData={metrics.dailyData}
            showBreakdown={metrics.showBreakdown}
            setShowBreakdown={metrics.setShowBreakdown}
          />
        </>
      )}

      <PdfPreviewModal
        showPdfPreview={report.showPdfPreview}
        previewUrl={report.previewUrl}
        previewLoading={report.previewLoading}
        downloading={report.downloading}
        onClose={report.closePdfPreview}
        onDownload={report.downloadPdf}
      />
    </div>
  );
}
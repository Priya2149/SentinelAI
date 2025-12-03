"use client";

import VendorComparisonCard from "@/components/analytics/VendorComparisonCard";

type VendorStats = {
  provider: string;
  calls: number;
  avgLatencyMs: number;
  totalCostUsd: number;
  avgCostPerCall: number;
  models: number;
};

export default function VendorComparisonSection({
  vendors,
}: {
  vendors: VendorStats[];
}) {
  return <VendorComparisonCard vendors={vendors} />;
}
"use client";

import VendorComparisonCard from "@/components/analytics/VendorComparisonCard";
import type { VendorStats } from "@/server/analytics/analytics.types";

export default function VendorComparisonSection({
  vendors,
}: {
  vendors: VendorStats[];
}) {
  return <VendorComparisonCard vendors={vendors} />;
}
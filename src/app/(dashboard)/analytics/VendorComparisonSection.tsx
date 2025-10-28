"use client";

import dynamicImport from "next/dynamic";

// dynamically load the card on the client only
const VendorComparisonCard = dynamicImport(
  () => import("@/components/analytics/VendorComparisonCard"),
  { ssr: false }
);

export default function VendorComparisonSection() {
  return <VendorComparisonCard />;
}

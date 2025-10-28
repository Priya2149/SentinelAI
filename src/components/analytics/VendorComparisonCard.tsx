"use client";
import { useEffect, useState } from "react";

type Row = {
  provider: string;
  calls: number;
  share: number;
  avgLatencyMs: number;
  successRate: number;
  usdPer1kTokens: number;
};

export default function VendorComparisonCard() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    fetch("/api/analytics/vendors", { cache: "no-store" })
      .then(r => r.json())
      .then(j => setRows(j.vendors || []))
      .catch(() => setRows([]));
  }, []);

  if (!rows.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
      <div className="mb-2 text-sm font-semibold">Vendor Comparison (current window)</div>
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr>
            <th className="text-left py-1.5">Provider</th>
            <th className="text-right py-1.5">Calls</th>
            <th className="text-right py-1.5">Share</th>
            <th className="text-right py-1.5">Success</th>
            <th className="text-right py-1.5">Avg Lat</th>
            <th className="text-right py-1.5">$ / 1k tok</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map(r => (
            <tr key={r.provider}>
              <td className="py-2 font-medium">{r.provider}</td>
              <td className="py-2 text-right">{r.calls.toLocaleString()}</td>
              <td className="py-2 text-right">{r.share.toFixed(1)}%</td>
              <td className="py-2 text-right">{r.successRate.toFixed(1)}%</td>
              <td className="py-2 text-right">{r.avgLatencyMs}ms</td>
              <td className="py-2 text-right">${r.usdPer1kTokens.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

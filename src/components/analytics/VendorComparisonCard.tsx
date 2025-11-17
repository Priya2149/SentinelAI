"use client";

import { Cpu, Zap, DollarSign, TrendingUp } from "lucide-react";

type VendorStats = {
  provider: string;
  calls: number;
  avgLatencyMs: number;
  totalCostUsd: number;
  avgCostPerCall: number;
  models: number;
};

export default function VendorComparisonCard({ 
  vendors 
}: { 
  vendors: VendorStats[] 
}) {
  if (vendors.length === 0) {
    return null; // Don't render if no data
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Cpu className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Vendor Comparison</h2>
              <p className="text-sm text-muted-foreground">Performance by AI provider</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{vendors.length} providers</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <div
              key={vendor.provider}
              className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-800/50"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base capitalize">{vendor.provider}</h3>
                <div className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs font-medium">
                  {vendor.models} models
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>Calls</span>
                  </div>
                  <span className="font-semibold">{vendor.calls.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Cpu className="h-4 w-4" />
                    <span>Avg Latency</span>
                  </div>
                  <span className={`font-mono font-semibold ${
                    vendor.avgLatencyMs < 500 ? "text-green-600" :
                    vendor.avgLatencyMs < 1000 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {Math.round(vendor.avgLatencyMs)}ms
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>Total Cost</span>
                  </div>
                  <span className="font-mono font-semibold text-green-600">
                    ${vendor.totalCostUsd.toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-purple-200/50 dark:border-purple-800/50">
                  <span className="text-xs text-muted-foreground">Cost/call</span>
                  <span className="text-xs font-mono text-green-600">
                    ${vendor.avgCostPerCall.toFixed(6)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
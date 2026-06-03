"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

type LiveFeedHeaderProps = {
  entriesLabel: string;
  lastUpdated: Date | string;
};

function formatRelativeTime(value: Date | string): string {
  const now = new Date();
  const date = new Date(value);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  return `${Math.floor(diff / 86400)}d ago`;
}

export default function LiveFeedHeader({
  entriesLabel,
  lastUpdated,
}: LiveFeedHeaderProps) {
  const router = useRouter();

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState(
    formatRelativeTime(lastUpdated)
  );

  useEffect(() => {
    const stored = window.localStorage.getItem("logs:autoRefresh");
    setAutoRefresh(stored === "1");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("logs:autoRefresh", autoRefresh ? "1" : "0");
  }, [autoRefresh]);

  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = window.setInterval(() => {
      const params = new URLSearchParams(window.location.search);

      params.set("page", "1");
      params.set("ts", Date.now().toString());

      router.replace(`/logs?${params.toString()}`);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [autoRefresh, router]);

  useEffect(() => {
    setLastUpdatedLabel(formatRelativeTime(lastUpdated));

    const intervalId = window.setInterval(() => {
      setLastUpdatedLabel(formatRelativeTime(lastUpdated));
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, [lastUpdated]);

  return (
    <div className="flex items-center justify-between text-xs text-gray-300">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />

        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Live Feed
        </span>

        <span className="ml-1 whitespace-nowrap text-gray-700 dark:text-gray-400">
          {entriesLabel}
        </span>
      </div>

      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Auto-refresh</span>
          <Switch
            checked={autoRefresh}
            onCheckedChange={setAutoRefresh}
            className="origin-right scale-75"
          />
        </div>

        <div className="h-1 w-1 rounded-full bg-gray-400" />

        <span>Last updated: {lastUpdatedLabel}</span>
      </div>
    </div>
  );
}
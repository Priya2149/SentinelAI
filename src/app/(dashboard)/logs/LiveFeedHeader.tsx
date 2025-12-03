"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

type LiveFeedHeaderProps = {
  entriesLabel: string;
  lastUpdated: Date | string;
};

function formatRelativeTime(d: Date | string): string {
  const now = new Date();
  const date = new Date(d);
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

  // Load initial value from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("logs:autoRefresh");
    if (stored === "1") {
      setAutoRefresh(true);
    }
  }, []);

  //Persist whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("logs:autoRefresh", autoRefresh ? "1" : "0");
  }, [autoRefresh]);

  //Auto-refresh behaviour
  useEffect(() => {
    if (!autoRefresh) return;

    const id = setInterval(() => {
      const ts = Date.now();
      router.replace(`/logs?page=1&ts=${ts}`);
    }, 5000);

    return () => clearInterval(id);
  }, [autoRefresh, router]);

  //Keep "Last updated" label fresh
  useEffect(() => {
    setLastUpdatedLabel(formatRelativeTime(lastUpdated));
    const id = setInterval(() => {
      setLastUpdatedLabel(formatRelativeTime(lastUpdated));
    }, 1000 * 30);
    return () => clearInterval(id);
  }, [lastUpdated]);

  return (
    <div className="flex items-center justify-between text-xs text-gray-300">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-gray-100">Live Feed</span>
        <span className="text-muted-foreground">{entriesLabel}</span>
      </div>

      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Auto-refresh</span>
          <Switch
            checked={autoRefresh}
            onCheckedChange={setAutoRefresh}
            className="scale-75 origin-right"
          />
        </div>
        <div className="h-1 w-1 bg-gray-400 rounded-full" />
        <span>Last updated: {lastUpdatedLabel}</span>
      </div>
    </div>
  );
}
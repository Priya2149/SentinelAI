"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  DailyMetric,
  PieDataItem,
} from "@/server/metrics/metrics.types";

const CHART_HEIGHT = 180;

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color?: string }>;
  label?: string;
};

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-4">
      <div className="mb-2.5">
        <h3 className="text-sm font-semibold sm:text-base">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {children}
    </div>
  );
}

function TooltipShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      {children}
    </div>
  );
}

function CallsTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <TooltipShell>
      <p className="text-xs font-medium opacity-80">
        {new Date(label ?? "").toLocaleDateString()}
      </p>
      <p className="mt-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
        API Calls: {payload[0]?.value?.toLocaleString?.()}
      </p>
    </TooltipShell>
  );
}

function CostTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <TooltipShell>
      <p className="text-xs font-medium opacity-80">
        {new Date(label ?? "").toLocaleDateString()}
      </p>
      <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
        Daily Cost: ${Number(payload[0]?.value ?? 0).toFixed(4)}
      </p>
    </TooltipShell>
  );
}

function LatencyTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <TooltipShell>
      <p className="text-xs font-medium opacity-80">
        {new Date(label ?? "").toLocaleDateString()}
      </p>
      <p className="mt-1 text-sm font-semibold text-violet-600 dark:text-violet-400">
        Avg Latency: {Math.round(Number(payload[0]?.value ?? 0))}ms
      </p>
    </TooltipShell>
  );
}

function PieTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <TooltipShell>
      <p className="text-sm font-semibold">
        {payload[0]?.name}: {Number(payload[0]?.value ?? 0).toLocaleString()}
      </p>
    </TooltipShell>
  );
}

function formatTick(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function CallsChart({
  data,
  gradientId,
}: {
  data: DailyMetric[];
  gradientId: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickFormatter={formatTick} />
        <YAxis stroke="#6b7280" fontSize={11} />
        <Tooltip content={<CallsTooltip />} />

        <Area
          type="monotone"
          dataKey="calls"
          stroke="#3b82f6"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function CostChart({
  data,
  gradientId,
}: {
  data: DailyMetric[];
  gradientId: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickFormatter={formatTick} />
        <YAxis stroke="#6b7280" fontSize={11} />
        <Tooltip content={<CostTooltip />} />

        <Area
          type="monotone"
          dataKey="costUsd"
          stroke="#10b981"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function LatencyChart({ data }: { data: DailyMetric[] }) {
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickFormatter={formatTick} />
        <YAxis stroke="#6b7280" fontSize={11} />
        <Tooltip content={<LatencyTooltip />} />

        <Line
          type="monotone"
          dataKey="avgLatencyMs"
          stroke="#8b5cf6"
          strokeWidth={2.2}
          dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3.5 }}
          activeDot={{ r: 5, stroke: "#8b5cf6", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ErrorPieChart({ data }: { data: PieDataItem[] }) {
  return (
    <>
      <div className="flex h-[180px] items-center justify-center">
        <ResponsiveContainer width="80%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              {item.name} ({Number(item.value).toLocaleString()})
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export function MetricsCharts({
  dailyData,
  pieData,
}: {
  dailyData: DailyMetric[];
  pieData: PieDataItem[];
}) {
  return (
    <>
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-3 xl:gap-4">
        <ChartCard title="API Calls Trend" description="Daily API call volume">
          <CallsChart data={dailyData} gradientId="callsGradient" />
        </ChartCard>

        <ChartCard title="Cost Analysis" description="Daily spending trends">
          <CostChart data={dailyData} gradientId="costGradient" />
        </ChartCard>

        <ChartCard title="Response Time" description="Average latency performance">
          <LatencyChart data={dailyData} />
        </ChartCard>

        <ChartCard title="Error Distribution" description="Success vs failure rates">
          <ErrorPieChart data={pieData} />
        </ChartCard>
      </div>

      <div className="-mx-3 overflow-x-auto pb-1.5 sm:mx-0 lg:hidden">
        <div className="flex gap-3 px-3 sm:gap-4">
          <div className="min-w-[260px] max-w-sm flex-1">
            <ChartCard title="API Calls Trend" description="Daily API call volume">
              <CallsChart data={dailyData} gradientId="callsGradientMobile" />
            </ChartCard>
          </div>

          <div className="min-w-[260px] max-w-sm flex-1">
            <ChartCard title="Cost Analysis" description="Daily spending trends">
              <CostChart data={dailyData} gradientId="costGradientMobile" />
            </ChartCard>
          </div>

          <div className="min-w-[260px] max-w-sm flex-1">
            <ChartCard title="Response Time" description="Average latency performance">
              <LatencyChart data={dailyData} />
            </ChartCard>
          </div>

          <div className="min-w-[260px] max-w-sm flex-1">
            <ChartCard title="Error Distribution" description="Success vs failure rates">
              <ErrorPieChart data={pieData} />
            </ChartCard>
          </div>
        </div>
      </div>
    </>
  );
}
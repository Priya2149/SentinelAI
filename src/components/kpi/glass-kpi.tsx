import * as React from "react";

export default function GlassKpi({
  label,
  value,
  icon,
  helper,
  ring,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  helper?: string;
  ring: string; // e.g. "from-blue-500 via-indigo-500 to-purple-500"
}) {
  return (
    <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="relative">
          <div
            className={`absolute -inset-1 rounded-xl blur-lg opacity-30 bg-gradient-to-r ${ring}`}
          />
          <div
            className={`relative inline-flex items-center justify-center h-10 w-10 rounded-xl text-white bg-gradient-to-r ${ring}`}
          >
            {icon}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{helper}</div>
      </div>
      <div className="mt-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-4xl sm:text-5xl font-bold font-mono leading-none">
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

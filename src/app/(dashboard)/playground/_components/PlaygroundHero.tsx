"use client";

import { Sparkles, Zap } from "lucide-react";
import type { DemoTemplate } from "@/types/playground";

export function PlaygroundHero({
  sessionCost,
  successRate,
  templates,
  onSelectTemplate,
}: {
  sessionCost: number;
  successRate: number;
  templates: DemoTemplate[];
  onSelectTemplate: (prompt: string) => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-2xl">
      <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(60%_50%_at_10%_10%,white,transparent_60%),radial-gradient(40%_40%_at_90%_20%,white,transparent_60%)]" />

      <div className="relative px-6 py-4 sm:px-8 sm:py-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Interactive Playground
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Test & Monitor AI Models
            </h1>

            <p className="mt-1.5 text-xs sm:text-sm text-white/90 max-w-2xl">
              Send prompts, view simulated responses, and preview how SentinelAI
              would monitor real model calls in a full integration. This
              Playground runs entirely in demo mode — providers, models, and
              outputs are illustrative only.
            </p>
          </div>

          <div className="flex gap-3">
            <MiniStat
              label="Session Cost"
              value={`$${sessionCost.toFixed(4)}`}
            />
            <MiniStat label="Success Rate" value={`${successRate}%`} />
          </div>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          {templates.map((template) => (
            <button
              key={template.label}
              onClick={() => onSelectTemplate(template.prompt)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm backdrop-blur transition-all"
            >
              <Zap className="h-3.5 w-3.5" />
              {template.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 backdrop-blur px-3 py-2.5 min-w-[100px]">
      <div className="text-xs text-white/80 mb-0.5">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
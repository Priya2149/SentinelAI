"use client";

import {
  Cpu,
  Key,
  Loader2,
  Rocket,
  Shield,
  SquareTerminal,
} from "lucide-react";
import type { Provider } from "@/types/playground";

type ModelConfigProps = {
  provider: Provider;
  setProvider: (provider: Provider) => void;
  model: string;
  setModel: (model: string) => void;
  compareMode: boolean;
  setCompareMode: (value: boolean) => void;
  compareModel: string;
  setCompareModel: (value: string) => void;
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  loading: boolean;
  compareLoading: boolean;
};

export function ModelConfigCard({
  provider,
  setProvider,
  model,
  setModel,
  compareMode,
  setCompareMode,
  compareModel,
  setCompareModel,
  prompt,
  setPrompt,
  onSubmit,
  canSubmit,
  loading,
  compareLoading,
}: ModelConfigProps) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Cpu className="h-4 w-4 text-indigo-600" />
            </div>

            <h2 className="text-lg font-semibold">Model Configuration</h2>
          </div>

          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              compareMode
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Compare Models
          </button>
        </div>
      </div>

      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 dark:border-gray-800">
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm font-medium flex items-center gap-2">
            <Key className="h-4 w-4 text-gray-400" />
            Provider
          </span>

          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value as Provider)}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="ollama">Ollama (Demo)</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </label>

        <label
          className={`flex flex-col gap-2 ${
            compareMode ? "" : "md:col-span-2"
          }`}
        >
          <span className="text-sm font-medium flex items-center gap-2">
            <Cpu className="h-4 w-4 text-gray-400" />
            Model
          </span>

          <input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="e.g. llama3.1"
          />
        </label>

        {compareMode && (
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4 text-gray-400" />
              Compare Model
            </span>

            <input
              value={compareModel}
              onChange={(event) => setCompareModel(event.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. mistral"
            />
          </label>
        )}
      </div>

      <div className="px-6 py-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-6 flex-1">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Prompt</span>

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={6}
            placeholder="Enter your prompt here... (e.g., Explain AI governance in simple terms)"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>

        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-medium text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {(loading || compareLoading) && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {!loading && !compareLoading && <Rocket className="h-4 w-4" />}

          {loading || compareLoading ? "Running…" : "Run Prompt"}
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/40 px-4 py-3 rounded-xl text-xs">
            <Shield className="h-4 w-4 text-indigo-500" />
            Automatic safety evaluation on every call
          </div>

          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/40 px-4 py-3 rounded-xl text-xs">
            <Rocket className="h-4 w-4 text-emerald-500" />
            Real-time performance tracking
          </div>

          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/40 px-4 py-3 rounded-xl text-xs">
            <SquareTerminal className="h-4 w-4 text-orange-500" />
            Token cost calculation
          </div>
        </div>
      </div>
    </div>
  );
}
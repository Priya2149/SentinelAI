import type { LogRow } from "./logs.types";

type RawModelCall = {
  id: string;
  createdAt: Date;
  model: string;
  prompt: string;
  response: string;
  latencyMs: number | null;
  promptTokens: number | null;
  respTokens: number | null;
  costUsd: number | null;
  status: string;
  user?: {
    email: string;
  } | null;
};

export function mapModelCallToLogRow(row: RawModelCall): LogRow {
  const promptTokens = Number(row.promptTokens ?? 0);
  const respTokens = Number(row.respTokens ?? 0);

  return {
    id: row.id,
    at: row.createdAt,
    user: row.user?.email ?? "—",
    model: row.model,
    latency: Number(row.latencyMs ?? 0),
    tokens: promptTokens + respTokens,
    cost: Number(row.costUsd ?? 0),
    status: row.status,
    promptTokens,
    respTokens,
    input: row.prompt,
    output: row.response,
  };
}

export function formatDate(value: Date | string) {
  return new Date(value).toLocaleString();
}

export function formatRelativeTime(value: Date | string) {
  const now = new Date();
  const date = new Date(value);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  return `${Math.floor(diff / 86400)}d ago`;
}
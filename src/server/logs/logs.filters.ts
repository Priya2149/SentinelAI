import type { Prisma } from "@prisma/client";
import type {
  LogsSearchParams,
  ParsedLogsFilters,
  RangeKey,
  StatusKey,
} from "./logs.types";

function toNum(value?: string) {
  if (!value) return undefined;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function toPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
}

function isRangeKey(value: unknown): value is RangeKey {
  return value === "24h" || value === "3d" || value === "7d" || value === "all";
}

function isStatusKey(value: string): value is StatusKey {
  return value === "SUCCESS" || value === "FAIL" || value === "FLAGGED";
}

export function parseLogsFilters(
  searchParams: LogsSearchParams
): ParsedLogsFilters {
  const q = (searchParams.q ?? "").trim();

  const statusList = (searchParams.status ?? "")
    .split(",")
    .map((status) => status.trim())
    .filter(isStatusKey);

  const model = (searchParams.model ?? "").trim();
  const userEmail = (searchParams.user ?? "").trim();

  const range = isRangeKey(searchParams.range) ? searchParams.range : "24h";

  const page = toPositiveInt(searchParams.page, 1);

  // For page UI, keep 10. For API users, allow up to 100.
  const rawLimit = toPositiveInt(searchParams.limit, 10);
  const limit = Math.min(rawLimit, 100);

  return {
    q,
    statusList,
    model,
    userEmail,
    minLatency: toNum(searchParams.minLatency),
    maxLatency: toNum(searchParams.maxLatency),
    minCost: toNum(searchParams.minCost),
    maxCost: toNum(searchParams.maxCost),
    range,
    page,
    limit,
    selectedId: (searchParams.id ?? "").trim() || undefined,
  };
}

export function buildLogsWhere(
  filters: ParsedLogsFilters
): Prisma.ModelCallWhereInput {
  const since =
    filters.range === "24h"
      ? new Date(Date.now() - 86_400_000)
      : filters.range === "3d"
      ? new Date(Date.now() - 3 * 86_400_000)
      : filters.range === "7d"
      ? new Date(Date.now() - 7 * 86_400_000)
      : undefined;

  return {
    ...(since ? { createdAt: { gte: since } } : {}),

    ...(filters.statusList.length
      ? { status: { in: filters.statusList } }
      : {}),

    ...(filters.q
      ? {
          OR: [
            { id: { contains: filters.q, mode: "insensitive" } },
            { model: { contains: filters.q, mode: "insensitive" } },
            { prompt: { contains: filters.q, mode: "insensitive" } },
            { response: { contains: filters.q, mode: "insensitive" } },
            {
              user: {
                email: { contains: filters.q, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),

    ...(filters.model ? { model: filters.model } : {}),

    ...(filters.userEmail
      ? {
          user: {
            email: { contains: filters.userEmail, mode: "insensitive" },
          },
        }
      : {}),

    ...((filters.minLatency !== undefined ||
      filters.maxLatency !== undefined) && {
      latencyMs: {
        ...(filters.minLatency !== undefined
          ? { gte: filters.minLatency }
          : {}),
        ...(filters.maxLatency !== undefined
          ? { lte: filters.maxLatency }
          : {}),
      },
    }),

    ...((filters.minCost !== undefined || filters.maxCost !== undefined) && {
      costUsd: {
        ...(filters.minCost !== undefined ? { gte: filters.minCost } : {}),
        ...(filters.maxCost !== undefined ? { lte: filters.maxCost } : {}),
      },
    }),
  };
}
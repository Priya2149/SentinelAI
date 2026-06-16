import type { Prisma } from "@/generated/prisma/client";
import type {
  AnalyticsFilters,
  AnalyticsQueryParams,
} from "./analytics.types";

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function endExclusive(date: Date): Date {
  return new Date(date.getTime() + 24 * 60 * 60 * 1000);
}

export function parseAnalyticsFilters(
  params: AnalyticsQueryParams = {}
): AnalyticsFilters {
  const modelParam = params.model;

  const models = Array.isArray(modelParam)
    ? modelParam.filter(Boolean)
    : modelParam
    ? [modelParam]
    : [];

  return {
    from: parseDate(params.from),
    to: parseDate(params.to),
    models,
  };
}

export function buildAnalyticsWhere(
  filters: AnalyticsFilters
): Prisma.ModelCallWhereInput {
  const where: Prisma.ModelCallWhereInput = {};

  if (filters.from || filters.to) {
    const createdAt: Prisma.DateTimeFilter = {};

    if (filters.from) createdAt.gte = filters.from;
    if (filters.to) createdAt.lt = endExclusive(filters.to);

    where.createdAt = createdAt;
  }

  if (filters.models.length > 0) {
    where.model = {
      in: filters.models,
    };
  }

  return where;
}
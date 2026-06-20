import { z } from "zod";
import {
  normalizeSearchParams,
  optionalNumberSchema,
  optionalTrimmedStringSchema,
  pageSchema,
  pageSizeSchema,
  type RawSearchParams,
} from "@/server/common/search-params.schema";

export const analyticsRangeSchema = z
  .enum(["24h", "7d", "30d", "90d", "all"])
  .catch("30d");

export const analyticsSortBySchema = z
  .enum(["calls", "cost", "latency", "errorRate", "flaggedRate"])
  .catch("calls");

export const analyticsSortDirectionSchema = z
  .enum(["asc", "desc"])
  .catch("desc");

export const analyticsSearchParamsSchema = z.object({
  range: analyticsRangeSchema,
  model: optionalTrimmedStringSchema.default(""),
  userEmail: optionalTrimmedStringSchema.default(""),

  minCalls: optionalNumberSchema,
  minCost: optionalNumberSchema,
  maxLatency: optionalNumberSchema,

  sortBy: analyticsSortBySchema,
  sortDir: analyticsSortDirectionSchema,

  page: pageSchema,
  pageSize: pageSizeSchema,
});

export type ParsedAnalyticsSearchParams = z.infer<
  typeof analyticsSearchParamsSchema
>;

export function parseAnalyticsSearchParams(input: RawSearchParams = {}) {
  return analyticsSearchParamsSchema.parse(normalizeSearchParams(input));
}
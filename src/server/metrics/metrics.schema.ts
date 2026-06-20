import { z } from "zod";
import {
  normalizeSearchParams,
  optionalTrimmedStringSchema,
  type RawSearchParams,
} from "@/server/common/search-params.schema";

export const metricsRangeSchema = z
  .enum(["7d", "30d", "90d"])
  .catch("30d");

export const metricsDailyQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).catch(30),
});

export const metricsSummaryQuerySchema = z.object({
  range: metricsRangeSchema,
});

export const metricsRealtimeQuerySchema = z.object({
  windowSeconds: z.coerce.number().int().min(10).max(3600).catch(60),
});

export const complianceReportQuerySchema = z.object({
  range: metricsRangeSchema,
  format: z.enum(["pdf", "json"]).catch("pdf"),
  generatedBy: optionalTrimmedStringSchema.default("SentinelAI"),
});

export type MetricsRange = z.infer<typeof metricsRangeSchema>;
export type MetricsDailyQuery = z.infer<typeof metricsDailyQuerySchema>;
export type MetricsSummaryQuery = z.infer<typeof metricsSummaryQuerySchema>;
export type MetricsRealtimeQuery = z.infer<typeof metricsRealtimeQuerySchema>;
export type ComplianceReportQuery = z.infer<
  typeof complianceReportQuerySchema
>;

export function parseMetricsDailyQuery(input: RawSearchParams = {}) {
  return metricsDailyQuerySchema.parse(normalizeSearchParams(input));
}

export function parseMetricsSummaryQuery(input: RawSearchParams = {}) {
  return metricsSummaryQuerySchema.parse(normalizeSearchParams(input));
}

export function parseMetricsRealtimeQuery(input: RawSearchParams = {}) {
  return metricsRealtimeQuerySchema.parse(normalizeSearchParams(input));
}

export function parseComplianceReportQuery(input: RawSearchParams = {}) {
  return complianceReportQuerySchema.parse(normalizeSearchParams(input));
}
import { z } from "zod";
import {
  normalizeSearchParams,
  optionalNumberSchema,
  optionalTrimmedStringSchema,
  pageSchema,
  type RawSearchParams,
} from "@/server/common/search-params.schema";

export const logStatusSchema = z.enum(["SUCCESS", "FAIL", "FLAGGED"]);

export const logsRangeSchema = z
  .enum(["24h", "7d", "30d", "90d", "all"])
  .catch("7d");

function parseStatusList(value: unknown) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => String(item).split(","));
  }

  if (typeof value === "string") {
    return value.split(",");
  }

  return [];
}

export const logsSearchParamsSchema = z.object({
  q: optionalTrimmedStringSchema.default(""),
  model: optionalTrimmedStringSchema.default(""),
  userEmail: optionalTrimmedStringSchema.default(""),

  statusList: z
    .preprocess(
      parseStatusList,
      z.array(logStatusSchema).default([])
    )
    .catch([]),

  minLatency: optionalNumberSchema,
  maxLatency: optionalNumberSchema,
  minCost: optionalNumberSchema,
  maxCost: optionalNumberSchema,

  range: logsRangeSchema,
  page: pageSchema,
});

export type ParsedLogsSearchParams = z.infer<
  typeof logsSearchParamsSchema
>;

export function parseLogsSearchParams(input: RawSearchParams = {}) {
  const normalized = normalizeSearchParams(input);

  return logsSearchParamsSchema.parse({
    ...normalized,
    statusList:
      input.statusList ??
      input.status ??
      normalized.statusList ??
      normalized.status,
  });
}
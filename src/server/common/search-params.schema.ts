import { z } from "zod";

export type RawSearchParams = Record<
  string,
  string | string[] | undefined
>;

export function normalizeSearchParams(input: RawSearchParams = {}) {
  const normalized: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(input)) {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  }

  return normalized;
}

export const rangeKeySchema = z
  .enum(["24h", "7d", "30d", "90d", "all"])
  .catch("7d");

export const pageSchema = z.coerce.number().int().min(1).catch(1);

export const pageSizeSchema = z.coerce
  .number()
  .int()
  .min(5)
  .max(100)
  .catch(20);

export const optionalTrimmedStringSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return undefined;

    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  },
  z.string().optional()
);

export const optionalNumberSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : undefined;
  },
  z.number().optional()
);
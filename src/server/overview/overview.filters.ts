import { RANGE_MS, type RangeKey } from "./overview.types";

export function parseOverviewRange(value?: string): RangeKey {
  return value && value in RANGE_MS ? (value as RangeKey) : "24h";
}

export function parseOverviewPage(value?: string): number {
  const page = Number(value);

  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}
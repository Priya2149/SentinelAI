export const STATUS_VALUES = ["SUCCESS", "FAIL", "FLAGGED"] as const;
export type Status = (typeof STATUS_VALUES)[number];

export const RANGE_MS = {
  "24h": 24 * 60 * 60 * 1000,
  "3d": 3 * 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
} as const;

export type RangeKey = keyof typeof RANGE_MS;

export type OverviewSearchParams = {
  range?: string;
  ts?: string;
  page?: string;
};

export type OverviewCallRow = {
  id: string;
  createdAt: string;
  model: string;
  latencyMs: number;
  promptTokens: number;
  respTokens: number;
  costUsd: number;
  status: string;
  user: {
    email: string;
  } | null;
};

export type OverviewCounts = {
  total: number;
  ok: number;
  fail: number;
  flagged: number;
};

export type OverviewPageData = {
  range: RangeKey;
  since: string;
  page: number;
  pageSize: number;
  totalPages: number;
  skip: number;
  latest: OverviewCallRow[];
  counts: OverviewCounts;
  refreshHref: string;
};
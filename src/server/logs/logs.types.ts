export type RangeKey = "24h" | "3d" | "7d" | "all";
export type StatusKey = "SUCCESS" | "FAIL" | "FLAGGED";

export type LogsSearchParams = {
  q?: string;
  status?: string;
  model?: string;
  user?: string;
  minLatency?: string;
  maxLatency?: string;
  minCost?: string;
  maxCost?: string;
  range?: RangeKey;
  page?: string;
  limit?: string;
  id?: string;
  ts?: string;
};

export type LogRow = {
  id: string;
  at: Date | string;
  user: string;
  model: string;
  latency: number;
  tokens: number;
  cost: number;
  status: StatusKey | string;
  promptTokens: number;
  respTokens: number;
  input?: unknown;
  output?: unknown;
  meta?: unknown;
};

export type ParsedLogsFilters = {
  q: string;
  statusList: StatusKey[];
  model: string;
  userEmail: string;
  minLatency?: number;
  maxLatency?: number;
  minCost?: number;
  maxCost?: number;
  range: RangeKey;
  page: number;
  limit: number;
  selectedId?: string;
};

export type LogsStats = {
  totalCalls: number;
  totalCost: number;
  avgLatency: number;
  errorRate: number;
};

export type LogsFilterOptions = {
  models: string[];
  users: string[];
};

export type LogsPageData = {
  rows: LogRow[];
  filters: ParsedLogsFilters;
  stats: LogsStats;
  filterOptions: LogsFilterOptions;
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  lastUpdated: Date;
};
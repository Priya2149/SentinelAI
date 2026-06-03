export type AnalyticsQueryParams = {
  from?: string;
  to?: string;
  model?: string | string[];
};

export type AnalyticsFilters = {
  from?: Date;
  to?: Date;
  models: string[];
};

export type ModelRow = {
  model: string;
  calls: number;
  avgLatencyMs: number;
  avgCostUsd: number;
  totalCostUsd: number;
  errorRate: number;
};

export type UserRow = {
  user: string;
  calls: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  errorRate: number;
};

export type VendorStats = {
  provider: string;
  calls: number;
  avgLatencyMs: number;
  totalCostUsd: number;
  avgCostPerCall: number;
  models: number;
};

export type AnalyticsStats = {
  totalModels: number;
  totalUsers: number;
  totalCalls: number;
  totalCost: number;
  overallErrorRate: number;
  hasData: boolean;
  liveOk: boolean;
};

export type AnalyticsInsights = {
  topModel: {
    value: string;
    metric: string;
  };
  topUser: {
    value: string;
    metric: string;
  };
  costLeader: {
    value: string;
    metric: string;
  };
};

export type AnalyticsPageData = {
  byModel: ModelRow[];
  byUser: UserRow[];
  vendorStats: VendorStats[];
  stats: AnalyticsStats;
  insights: AnalyticsInsights;
};
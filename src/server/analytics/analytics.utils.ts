import type {
  AnalyticsInsights,
  AnalyticsStats,
  ModelRow,
  UserRow,
  VendorStats,
} from "./analytics.types";

export function getProviderFromModel(model: string) {
  const modelLower = model.toLowerCase();

  if (modelLower.includes("gpt") || modelLower.includes("openai")) {
    return "openai";
  }

  if (modelLower.includes("claude") || modelLower.includes("anthropic")) {
    return "anthropic";
  }

  if (
    modelLower.includes("gemini") ||
    modelLower.includes("palm") ||
    modelLower.includes("bard")
  ) {
    return "google";
  }

  if (modelLower.includes("llama")) {
    return "meta";
  }

  if (modelLower.includes("mistral")) {
    return "mistral";
  }

  if (modelLower.includes("cohere")) {
    return "cohere";
  }

  return "other";
}

export function buildVendorStats(byModel: ModelRow[]): VendorStats[] {
  const vendorMap = new Map<
    string,
    {
      calls: number;
      totalLatency: number;
      totalCost: number;
      models: Set<string>;
    }
  >();

  byModel.forEach((model) => {
    const provider = getProviderFromModel(model.model);

    const existing = vendorMap.get(provider) ?? {
      calls: 0,
      totalLatency: 0,
      totalCost: 0,
      models: new Set<string>(),
    };

    existing.calls += model.calls;
    existing.totalLatency += model.avgLatencyMs * model.calls;
    existing.totalCost += model.totalCostUsd;
    existing.models.add(model.model);

    vendorMap.set(provider, existing);
  });

  return Array.from(vendorMap.entries())
    .map(([provider, data]) => ({
      provider,
      calls: data.calls,
      avgLatencyMs: data.calls > 0 ? data.totalLatency / data.calls : 0,
      totalCostUsd: data.totalCost,
      avgCostPerCall: data.calls > 0 ? data.totalCost / data.calls : 0,
      models: data.models.size,
    }))
    .sort((a, b) => b.calls - a.calls);
}

export function buildAnalyticsStats({
  byModel,
  byUser,
  liveOk,
}: {
  byModel: ModelRow[];
  byUser: UserRow[];
  liveOk: boolean;
}): AnalyticsStats {
  const totalModels = byModel.length;
  const totalUsers = byUser.length;
  const totalCalls = byModel.reduce((sum, model) => sum + model.calls, 0);
  const totalCost = byModel.reduce((sum, model) => sum + model.totalCostUsd, 0);

  const overallErrorRate =
    totalCalls > 0
      ? (byModel.reduce(
          (sum, model) => sum + model.errorRate * model.calls,
          0
        ) /
          totalCalls) *
        100
      : 0;

  return {
    totalModels,
    totalUsers,
    totalCalls,
    totalCost,
    overallErrorRate,
    hasData: (byModel.length > 0 || byUser.length > 0) && liveOk,
    liveOk,
  };
}

export function buildAnalyticsInsights({
  byModel,
  byUser,
}: {
  byModel: ModelRow[];
  byUser: UserRow[];
}): AnalyticsInsights {
  const topModel = [...byModel].sort((a, b) => b.calls - a.calls)[0];
  const topUser = [...byUser].sort((a, b) => b.calls - a.calls)[0];
  const costLeader = [...byModel].sort(
    (a, b) => b.totalCostUsd - a.totalCostUsd
  )[0];

  return {
    topModel: {
      value: topModel?.model ?? "N/A",
      metric: `${topModel?.calls ?? 0} calls`,
    },
    topUser: {
      value: topUser?.user ?? "N/A",
      metric: `${topUser?.calls ?? 0} API calls`,
    },
    costLeader: {
      value: costLeader?.model ?? "N/A",
      metric: `$${(costLeader?.totalCostUsd ?? 0).toFixed(4)}`,
    },
  };
}
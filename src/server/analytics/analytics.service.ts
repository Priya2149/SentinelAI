import "server-only";

import { ensureDemoData } from "@/server/demo/demo-data.service";
import type {
  AnalyticsPageData,
  AnalyticsQueryParams,
  ModelRow,
  UserRow,
} from "./analytics.types";
import { buildAnalyticsWhere, parseAnalyticsFilters } from "./analytics.filters";
import {
  findUsersByIds,
  getModelAnalyticsGroups,
  getModelErrorGroups,
  getUserAnalyticsGroups,
  getUserErrorGroups,
} from "./analytics.repository";
import {
  buildAnalyticsInsights,
  buildAnalyticsStats,
  buildVendorStats,
} from "./analytics.utils";

function userKey(userId: string | null) {
  return userId ?? "__anonymous__";
}

export async function getAnalyticsModelRows(
  params: AnalyticsQueryParams = {}
): Promise<ModelRow[]> {
  const filters = parseAnalyticsFilters(params);
  const where = buildAnalyticsWhere(filters);

  const [modelGroups, modelErrors] = await Promise.all([
    getModelAnalyticsGroups(where),
    getModelErrorGroups(where),
  ]);

  const errorMap = new Map(
    modelErrors.map((errorGroup) => [errorGroup.model, errorGroup._count.id])
  );

  return modelGroups
    .map((group) => {
      const calls = group._count.id;
      const avgCostUsd = Number((group._avg.costUsd ?? 0).toFixed(6));
      const totalCostUsd = Number((group._sum.costUsd ?? 0).toFixed(6));

      return {
        model: group.model,
        calls,
        avgLatencyMs: Math.round(group._avg.latencyMs ?? 0),
        avgCostUsd,
        totalCostUsd,
        errorRate: (errorMap.get(group.model) ?? 0) / Math.max(calls, 1),
      };
    })
    .sort((a, b) => b.calls - a.calls);
}

export async function getAnalyticsUserRows(
  params: AnalyticsQueryParams = {}
): Promise<UserRow[]> {
  const filters = parseAnalyticsFilters(params);
  const where = buildAnalyticsWhere(filters);

  const [userGroups, userErrors] = await Promise.all([
    getUserAnalyticsGroups(where),
    getUserErrorGroups(where),
  ]);

  const errorMap = new Map(
    userErrors.map((errorGroup) => [
      userKey(errorGroup.userId),
      errorGroup._count.id,
    ])
  );

  const userIds = Array.from(
    new Set(
      userGroups
        .map((group) => group.userId)
        .filter((id): id is string => Boolean(id))
    )
  );

  const users = await findUsersByIds(userIds);
  const emailById = new Map(users.map((user) => [user.id, user.email]));

  return userGroups
    .map((group) => {
      const calls = group._count.id;
      const key = userKey(group.userId);

      return {
        user: group.userId
          ? emailById.get(group.userId) ?? group.userId
          : "Anonymous",
        calls,
        totalCostUsd: Number((group._sum.costUsd ?? 0).toFixed(6)),
        avgLatencyMs: Math.round(group._avg.latencyMs ?? 0),
        errorRate: (errorMap.get(key) ?? 0) / Math.max(calls, 1),
      };
    })
    .sort((a, b) => b.calls - a.calls);
}

export async function getAnalyticsPageData(
  params: AnalyticsQueryParams = {}
): Promise<AnalyticsPageData> {
  try {
    await ensureDemoData();

    const [byModel, byUser] = await Promise.all([
      getAnalyticsModelRows(params),
      getAnalyticsUserRows(params),
    ]);

    const vendorStats = buildVendorStats(byModel);

    return {
      byModel,
      byUser,
      vendorStats,
      stats: buildAnalyticsStats({
        byModel,
        byUser,
        liveOk: true,
      }),
      insights: buildAnalyticsInsights({
        byModel,
        byUser,
      }),
    };
  } catch (error) {
    console.error("Analytics service error:", error);

    const byModel: ModelRow[] = [];
    const byUser: UserRow[] = [];

    return {
      byModel,
      byUser,
      vendorStats: [],
      stats: buildAnalyticsStats({
        byModel,
        byUser,
        liveOk: false,
      }),
      insights: buildAnalyticsInsights({
        byModel,
        byUser,
      }),
    };
  }
}
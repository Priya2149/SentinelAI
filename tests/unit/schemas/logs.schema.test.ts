import { describe, expect, it } from "vitest";
import { parseLogsSearchParams } from "@/server/logs/logs.schema";

describe("logs schema", () => {
  it("parses valid log search params", () => {
    const result = parseLogsSearchParams({
      q: "timeout",
      statusList: "SUCCESS,FAIL",
      model: "gpt-4.1",
      userEmail: "alice@example.com",
      minLatency: "100",
      maxLatency: "900",
      minCost: "0.001",
      maxCost: "0.02",
      range: "30d",
      page: "2",
    });

    expect(result).toEqual({
      q: "timeout",
      statusList: ["SUCCESS", "FAIL"],
      model: "gpt-4.1",
      userEmail: "alice@example.com",
      minLatency: 100,
      maxLatency: 900,
      minCost: 0.001,
      maxCost: 0.02,
      range: "30d",
      page: 2,
    });
  });

  it("uses safe defaults for invalid params", () => {
    const result = parseLogsSearchParams({
      statusList: "BAD_STATUS",
      range: "invalid",
      page: "-10",
      minLatency: "abc",
    });

    expect(result.statusList).toEqual([]);
    expect(result.range).toBe("7d");
    expect(result.page).toBe(1);
    expect(result.minLatency).toBeUndefined();
  });

  it("trims empty text filters into undefined values", () => {
    const result = parseLogsSearchParams({
      q: "   ",
      model: "   ",
      userEmail: "   ",
    });

    expect(result.q).toBeUndefined();
    expect(result.model).toBeUndefined();
    expect(result.userEmail).toBeUndefined();
  });
});
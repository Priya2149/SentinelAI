import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../../msw/server";

describe("metrics summary API contract", () => {
  it("returns the expected metrics summary shape", async () => {
    server.use(
      http.get("http://localhost/api/metrics/summary", () => {
        return HttpResponse.json({
          total: 120,
          avg_latency_ms: 432,
          avg_cost_usd: 0.0021,
          hallucination_rate: 0.04,
          toxicity_rate: 0.01,
          statuses: {
            SUCCESS: 110,
            FAIL: 5,
            FLAGGED: 5,
          },
        });
      })
    );

    const response = await fetch("http://localhost/api/metrics/summary?range=30d");
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toMatchObject({
      total: expect.any(Number),
      avg_latency_ms: expect.any(Number),
      avg_cost_usd: expect.any(Number),
      hallucination_rate: expect.any(Number),
      toxicity_rate: expect.any(Number),
      statuses: {
        SUCCESS: expect.any(Number),
        FAIL: expect.any(Number),
        FLAGGED: expect.any(Number),
      },
    });
  });

  it("handles empty metrics summary safely", async () => {
    server.use(
      http.get("http://localhost/api/metrics/summary", () => {
        return HttpResponse.json({
          total: 0,
          avg_latency_ms: 0,
          avg_cost_usd: 0,
          hallucination_rate: 0,
          toxicity_rate: 0,
          statuses: {
            SUCCESS: 0,
            FAIL: 0,
            FLAGGED: 0,
          },
        });
      })
    );

    const response = await fetch("http://localhost/api/metrics/summary?range=7d");
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.total).toBe(0);
    expect(data.statuses.SUCCESS).toBe(0);
  });
});
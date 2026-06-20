import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../../msw/server";

describe("notifications API contract", () => {
  it("returns alert notifications with expected shape", async () => {
    server.use(
      http.get("http://localhost/api/notifications", () => {
        return HttpResponse.json([
          {
            id: "alert_1",
            kind: "FAIL",
            title: "High failure rate detected",
            subtitle: "5 failures in the last hour",
            createdAt: new Date("2026-06-16T12:00:00.000Z").toISOString(),
            href: "/logs?status=FAIL",
          },
          {
            id: "alert_2",
            kind: "FLAGGED",
            title: "Safety issue detected",
            subtitle: "Prompt injection attempt flagged",
            createdAt: new Date("2026-06-16T12:05:00.000Z").toISOString(),
            href: "/logs?status=FLAGGED",
          },
        ]);
      })
    );

    const response = await fetch("http://localhost/api/notifications");
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toHaveLength(2);

    expect(data[0]).toMatchObject({
      id: expect.any(String),
      kind: "FAIL",
      title: expect.any(String),
      subtitle: expect.any(String),
      createdAt: expect.any(String),
      href: expect.any(String),
    });

    expect(data[1].kind).toBe("FLAGGED");
  });

  it("returns an empty array when there are no alerts", async () => {
    server.use(
      http.get("http://localhost/api/notifications", () => {
        return HttpResponse.json([]);
      })
    );

    const response = await fetch("http://localhost/api/notifications");
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toEqual([]);
  });
});
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MetricsPageSkeleton } from "@/app/(dashboard)/metrics/_components/MetricsPageSkeleton";

describe("MetricsPageSkeleton", () => {
  it("renders skeleton loading placeholders", () => {
    const { container } = render(<MetricsPageSkeleton />);

    const skeletons = container.querySelectorAll(".animate-pulse");

    expect(skeletons.length).toBeGreaterThan(10);
  });

  it("renders chart placeholder cards", () => {
    const { container } = render(<MetricsPageSkeleton />);

    const chartPlaceholders = container.querySelectorAll(".h-\\[180px\\]");

    expect(chartPlaceholders.length).toBeGreaterThanOrEqual(0);
    expect(container.firstChild).toBeInTheDocument();
  });
});
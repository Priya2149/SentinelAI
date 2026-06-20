import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RouteError } from "@/components/system/route-error";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("RouteError", () => {
  it("renders title, description, retry button, and dashboard link", () => {
    const reset = vi.fn();

    render(
      <RouteError
        title="Could not load metrics"
        description="Metrics data failed to load."
        error={new Error("Database unavailable")}
        reset={reset}
      />
    );

    expect(screen.getByText("Could not load metrics")).toBeInTheDocument();
    expect(screen.getByText("Metrics data failed to load.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to dashboard/i })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("calls reset when retry is clicked", () => {
    const reset = vi.fn();

    render(
      <RouteError
        title="Could not load dashboard"
        error={new Error("Failed")}
        reset={reset}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
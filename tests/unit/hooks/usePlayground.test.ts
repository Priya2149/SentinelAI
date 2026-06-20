import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePlayground } from "@/hooks/usePlayground";

describe("usePlayground", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with default playground state", () => {
    const { result } = renderHook(() => usePlayground());

    expect(result.current.provider).toBe("ollama");
    expect(result.current.model).toBe("llama3.1");
    expect(result.current.compareMode).toBe(false);
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.templates.length).toBeGreaterThan(0);
  });

  it(
    "runs a prompt and stores successful response in history",
    async () => {
      const { result } = renderHook(() => usePlayground());

      act(() => {
        result.current.setPrompt("Explain AI governance.");
      });

      await waitFor(() => {
        expect(result.current.canSubmit).toBe(true);
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(result.current.resp?.ok).toBe(true);
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.sessionCost).toBeGreaterThan(0);
      expect(result.current.successRate).toBe(100);
    },
    10_000
  );

  it(
    "runs compare mode and stores two responses",
    async () => {
      const { result } = renderHook(() => usePlayground());

      act(() => {
        result.current.setPrompt("Compare these model responses.");
        result.current.setCompareMode(true);
        result.current.setCompareModel("mistral");
      });

      await waitFor(() => {
        expect(result.current.canSubmit).toBe(true);
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(result.current.resp?.ok).toBe(true);
        expect(result.current.compareResp?.ok).toBe(true);
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.sessionCost).toBeGreaterThan(0);
      expect(result.current.successRate).toBe(100);
    },
    10_000
  );
});
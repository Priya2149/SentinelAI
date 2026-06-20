import { describe, expect, it } from "vitest";
import { parsePlaygroundRequest } from "@/server/playground/playground.schema";

describe("playground schema", () => {
  it("parses a valid playground request", () => {
    const result = parsePlaygroundRequest({
      provider: "openai",
      model: "gpt-4.1-mini",
      prompt: "Explain AI governance in simple terms.",
      compareMode: true,
      compareModel: "gpt-4o-mini",
      temperature: 0.3,
      maxTokens: 500,
    });

    expect(result.provider).toBe("openai");
    expect(result.model).toBe("gpt-4.1-mini");
    expect(result.prompt).toContain("AI governance");
    expect(result.compareMode).toBe(true);
    expect(result.compareModel).toBe("gpt-4o-mini");
  });

  it("defaults provider and compareMode", () => {
    const result = parsePlaygroundRequest({
      model: "llama3.1",
      prompt: "Test prompt",
    });

    expect(result.provider).toBe("ollama");
    expect(result.compareMode).toBe(false);
  });

  it("rejects empty prompt", () => {
    expect(() =>
      parsePlaygroundRequest({
        model: "llama3.1",
        prompt: "   ",
      })
    ).toThrow();
  });

  it("rejects prompt over max length", () => {
    expect(() =>
      parsePlaygroundRequest({
        model: "llama3.1",
        prompt: "a".repeat(8001),
      })
    ).toThrow();
  });
});
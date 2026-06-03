export type Provider = "openai" | "anthropic" | "ollama";

export type SafetyEval = {
  score: "safe" | "warning" | "unsafe";
  notes: string;
};

export type PlaygroundSuccessResponse = {
  ok: true;
  id: string;
  provider: Provider;
  model: string;
  prompt: string;
  output: string;
  createdAt: string;
  call: {
    latencyMs: number;
    promptTokens: number;
    respTokens: number;
    costUsd: number;
    status: "SUCCESS" | "FAIL" | "FLAGGED";
  };
  safety?: SafetyEval;
  demo?: boolean;
};

export type PlaygroundErrorResponse = {
  ok: false;
  error: string;
  callId?: string;
};

export type ApiResponse = PlaygroundSuccessResponse | PlaygroundErrorResponse;

export type DemoTemplate = {
  label: string;
  prompt: string;
};
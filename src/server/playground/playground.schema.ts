import { z } from "zod";

export const providerSchema = z.enum(["ollama", "openai", "anthropic"]);

export const playgroundRequestSchema = z.object({
  provider: providerSchema.default("ollama"),

  model: z
    .string()
    .trim()
    .min(1, "Model is required")
    .max(100, "Model name is too long"),

  prompt: z
    .string()
    .trim()
    .min(1, "Prompt is required")
    .max(8000, "Prompt is too long"),

  compareMode: z.boolean().default(false),

  compareModel: z
    .string()
    .trim()
    .max(100, "Compare model name is too long")
    .optional(),

  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(1).max(8000).optional(),
});

export type PlaygroundRequest = z.infer<typeof playgroundRequestSchema>;

export function parsePlaygroundRequest(input: unknown) {
  return playgroundRequestSchema.parse(input);
}
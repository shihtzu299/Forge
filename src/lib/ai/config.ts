import { ProviderNotConfiguredError } from "./errors.ts";

export const GPT_RUNTIME_SETTINGS = {
  maxOutputTokens: 16_000,
  reasoningEffort: "medium",
  timeoutMilliseconds: 120_000,
} as const;

export type GptEnvironment = Readonly<Record<string, string | undefined>>;

export type GptRuntimeConfig = {
  apiKey: string;
  model: string;
};

export function readGptRuntimeConfig(
  environment: GptEnvironment = process.env,
): GptRuntimeConfig {
  const apiKey = environment.OPENAI_API_KEY?.trim();
  const model = environment.OPENAI_MODEL?.trim();

  if (!apiKey) {
    throw new ProviderNotConfiguredError(
      "GPT analysis provider (OPENAI_API_KEY is missing)",
    );
  }

  if (!model) {
    throw new ProviderNotConfiguredError(
      "GPT analysis provider (OPENAI_MODEL is missing)",
    );
  }

  return { apiKey, model };
}

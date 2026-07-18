import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import {
  forgeWorkspaceAnalysisSchema,
  type ForgeAnalysisRequest,
} from "../../../contracts/forge-ai.ts";
import { FORGE_SYSTEM_PROMPT } from "../../../contracts/forge-system-prompt.ts";
import {
  GPT_RUNTIME_SETTINGS,
  readGptRuntimeConfig,
  type GptEnvironment,
} from "../config.ts";
import { ProviderFailureError } from "../errors.ts";
import type { AnalysisProvider } from "./analysis-provider.ts";

type ProviderLogger = Pick<Console, "info" | "error">;

type GptAnalysisProviderOptions = {
  environment?: GptEnvironment;
  logger?: ProviderLogger;
};

export class GptAnalysisProvider implements AnalysisProvider {
  readonly name = "gpt";
  private readonly environment: GptEnvironment;
  private readonly logger: ProviderLogger;

  constructor({
    environment = process.env,
    logger = console,
  }: GptAnalysisProviderOptions = {}) {
    this.environment = environment;
    this.logger = logger;
  }

  async analyze(request: ForgeAnalysisRequest): Promise<unknown> {
    const { apiKey, model } = readGptRuntimeConfig(this.environment);
    const startedAt = performance.now();
    const client = new OpenAI({
      apiKey,
      maxRetries: 0,
      timeout: GPT_RUNTIME_SETTINGS.timeoutMilliseconds,
    });

    try {
      const response = await client.responses.parse({
        model,
        input: [
          { role: "system", content: FORGE_SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify(request),
          },
        ],
        max_output_tokens: GPT_RUNTIME_SETTINGS.maxOutputTokens,
        reasoning: { effort: GPT_RUNTIME_SETTINGS.reasoningEffort },
        store: false,
        text: {
          format: zodTextFormat(
            forgeWorkspaceAnalysisSchema,
            "forge_workspace_analysis",
          ),
        },
      });

      const refusal = response.output
        .filter((item) => item.type === "message")
        .flatMap((item) => item.content)
        .find((content) => content.type === "refusal");

      if (refusal) {
        throw new ProviderFailureError("The model refused the analysis", {
          retryable: false,
        });
      }

      if (response.status !== "completed" || !response.output_parsed) {
        const reason = response.incomplete_details?.reason ?? response.status;
        throw new ProviderFailureError(
          `The model did not return a complete structured response (${reason})`,
          { retryable: false },
        );
      }

      this.logger.info("[forge-ai] GPT analysis completed", {
        model,
        elapsedMilliseconds: Math.round(performance.now() - startedAt),
        structuredOutput: true,
      });

      return response.output_parsed;
    } catch (error) {
      const mappedError = mapOpenAIError(error);

      this.logger.error("[forge-ai] GPT analysis failed", {
        model,
        elapsedMilliseconds: Math.round(performance.now() - startedAt),
        code: mappedError.code,
        retryable: mappedError.retryable,
        providerStatus: error instanceof OpenAI.APIError ? error.status : null,
        requestId: error instanceof OpenAI.APIError ? error.requestID : null,
      });

      throw mappedError;
    }
  }
}

function mapOpenAIError(error: unknown) {
  if (error instanceof ProviderFailureError) return error;

  if (error instanceof OpenAI.AuthenticationError) {
    return new ProviderFailureError("OpenAI authentication failed", {
      retryable: false,
      cause: error,
    });
  }

  if (error instanceof OpenAI.RateLimitError) {
    return new ProviderFailureError("OpenAI rate limit reached", {
      retryable: true,
      cause: error,
    });
  }

  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return new ProviderFailureError("OpenAI request timed out", {
      retryable: true,
      cause: error,
    });
  }

  if (error instanceof OpenAI.APIConnectionError) {
    return new ProviderFailureError("OpenAI connection failed", {
      retryable: true,
      cause: error,
    });
  }

  if (error instanceof OpenAI.APIError) {
    return new ProviderFailureError(
      `OpenAI request failed with status ${error.status ?? "unknown"}`,
      {
        retryable: typeof error.status === "number" && error.status >= 500,
        cause: error,
      },
    );
  }

  return new ProviderFailureError("OpenAI returned an unexpected failure", {
    retryable: false,
    cause: error,
  });
}

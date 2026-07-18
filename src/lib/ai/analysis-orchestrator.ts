import { z } from "zod";

import {
  forgeWorkspaceAnalysisSchema,
  type ForgeWorkspaceAnalysis,
} from "../../contracts/forge-ai.ts";
import {
  ForgeAnalysisError,
  InvalidProviderResponseError,
  ProviderNotConfiguredError,
  RetryExhaustedError,
  UnsupportedAnalysisModeError,
  toForgeAnalysisError,
} from "./errors.ts";
import type { AnalysisProvider } from "./providers/analysis-provider.ts";
import { GptAnalysisProvider } from "./providers/gpt-analysis-provider.ts";
import { MockAnalysisProvider } from "./providers/mock-analysis-provider.ts";
import { buildAnalysisRequest } from "./request-builder.ts";
import type {
  AnalysisInput,
  AnalysisMode,
  AnalysisResult,
  DelayFunction,
} from "./types.ts";

export type AnalysisProviderMap = Partial<
  Record<AnalysisMode, AnalysisProvider>
>;

type ForgeAnalysisOrchestratorOptions = {
  providers: AnalysisProviderMap;
  retryDelayMilliseconds?: number;
  delay?: DelayFunction;
};

const defaultDelay: DelayFunction = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export class ForgeAnalysisOrchestrator {
  private readonly providers: AnalysisProviderMap;
  private readonly retryDelayMilliseconds: number;
  private readonly delay: DelayFunction;

  constructor({
    providers,
    retryDelayMilliseconds = 100,
    delay = defaultDelay,
  }: ForgeAnalysisOrchestratorOptions) {
    if (retryDelayMilliseconds < 0) {
      throw new RangeError("Retry delay cannot be negative");
    }

    this.providers = providers;
    this.retryDelayMilliseconds = retryDelayMilliseconds;
    this.delay = delay;
  }

  async analyze(input: AnalysisInput): Promise<ForgeWorkspaceAnalysis> {
    if (input.mode !== "mock" && input.mode !== "gpt") {
      throw new UnsupportedAnalysisModeError(input.mode);
    }

    const request = buildAnalysisRequest({
      projectDNA: input.projectDNA,
      requestedSections: input.requestedSections,
      generationMode: input.generationMode,
    });
    const provider = this.providers[input.mode];

    if (!provider) {
      throw new ProviderNotConfiguredError(`${input.mode} analysis provider`);
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const providerOutput = await provider.analyze(request);
        const validation =
          forgeWorkspaceAnalysisSchema.safeParse(providerOutput);

        if (!validation.success) {
          throw new InvalidProviderResponseError(
            `Provider response validation failed: ${z.prettifyError(validation.error)}`,
            validation.error,
          );
        }

        return validation.data;
      } catch (error) {
        const forgeError = toForgeAnalysisError(error);

        if (!forgeError.retryable) throw forgeError;

        if (attempt === 1) {
          throw new RetryExhaustedError(forgeError);
        }

        await this.delay(this.retryDelayMilliseconds);
      }
    }

    throw new RetryExhaustedError(
      new ForgeAnalysisError({
        code: "PROVIDER_FAILURE",
        userMessage: "Forge could not complete the analysis.",
        diagnosticMessage: "The provider loop ended unexpectedly",
      }),
    );
  }

  async safeAnalyze(input: AnalysisInput): Promise<AnalysisResult> {
    try {
      return { ok: true, analysis: await this.analyze(input) };
    } catch (error) {
      return { ok: false, error: toForgeAnalysisError(error) };
    }
  }
}

export function createDefaultAnalysisProviders({
  mockDelayMilliseconds = 0,
}: {
  mockDelayMilliseconds?: number;
} = {}): AnalysisProviderMap {
  return {
    mock: new MockAnalysisProvider(mockDelayMilliseconds),
    gpt: new GptAnalysisProvider(),
  };
}

import { ProviderNotConfiguredError } from "../errors.ts";
import type { AnalysisProvider } from "./analysis-provider.ts";

export class GptAnalysisProvider implements AnalysisProvider {
  readonly name = "gpt";

  async analyze(): Promise<unknown> {
    throw new ProviderNotConfiguredError("GPT-5.6 analysis provider");
  }
}

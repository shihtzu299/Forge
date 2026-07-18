import type { ForgeAnalysisRequest } from "../../../contracts/forge-ai.ts";

export interface AnalysisProvider {
  readonly name: string;
  analyze(request: ForgeAnalysisRequest): Promise<unknown>;
}

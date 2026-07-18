import { z } from "zod";

import {
  FORGE_CONTRACT_VERSION,
  forgeAnalysisRequestSchema,
} from "../../contracts/forge-ai.ts";
import type {
  ForgeAnalysisRequest,
  ForgeSection,
} from "../../contracts/forge-ai.ts";
import type { ProjectDNA } from "../../types/project.ts";
import { InvalidAnalysisRequestError } from "./errors.ts";

export type BuildAnalysisRequestInput = {
  projectDNA: ProjectDNA;
  requestedSections: readonly ForgeSection[];
  generationMode: "initial";
};

export function buildAnalysisRequest(
  input: BuildAnalysisRequestInput,
): ForgeAnalysisRequest {
  try {
    return forgeAnalysisRequestSchema.parse({
      projectDNA: input.projectDNA,
      requestedSections: [...input.requestedSections],
      generationMode: input.generationMode,
      contractVersion: FORGE_CONTRACT_VERSION,
    });
  } catch (error) {
    const diagnostic =
      error instanceof z.ZodError
        ? `Request validation failed: ${z.prettifyError(error)}`
        : "Request validation failed for an unknown reason";

    throw new InvalidAnalysisRequestError(diagnostic, error);
  }
}

import { z } from "zod";

import {
  forgeAnalysisRequestSchema,
  type ForgeWorkspaceAnalysis,
} from "./forge-ai.ts";
import type { ForgeAnalysisErrorCode } from "../lib/ai/errors.ts";
import type { AnalysisMode } from "../lib/ai/types.ts";
import { projectIdSchema } from "./project-persistence.ts";

export const workspaceGenerationRequestSchema = z.strictObject({
  projectId: projectIdSchema,
  mode: z.enum(["mock", "gpt"]),
  projectDNA: forgeAnalysisRequestSchema.shape.projectDNA,
});

export type WorkspaceGenerationRequest = {
  projectId: string;
  mode: AnalysisMode;
  projectDNA: z.infer<typeof workspaceGenerationRequestSchema>["projectDNA"];
};

export type SerializedAnalysisError = {
  code: ForgeAnalysisErrorCode;
  message: string;
  retryable: boolean;
};

export type WorkspaceGenerationResponse =
  | { ok: true; analysis: ForgeWorkspaceAnalysis }
  | { ok: false; error: SerializedAnalysisError };

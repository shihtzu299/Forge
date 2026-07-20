import { z } from "zod";

import type { ForgeWorkspaceAnalysis } from "./forge-ai.ts";
import { projectDNASchema } from "./forge-ai.ts";
import type { AnalysisMode } from "../lib/ai/types.ts";
import type { ProjectDNA } from "../types/project.ts";

export const projectIdSchema = z.string().regex(/^c[a-z0-9]{20,40}$/);

export const createProjectRequestSchema = z.strictObject({
  idea: projectDNASchema.shape.idea,
});

export type CreateProjectResponse =
  | { ok: true; projectId: string; projectUrl: string }
  | { ok: false; error: { message: string } };

export type PersistedProjectView = {
  id: string;
  name: string;
  idea: string;
  projectDNA: ProjectDNA | null;
  analysis: ForgeWorkspaceAnalysis | null;
  analysisMode: AnalysisMode | null;
  loadWarning: string | null;
};

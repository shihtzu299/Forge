import { z } from "zod";

import {
  forgeWorkspaceAnalysisSchema,
  projectDNASchema,
} from "../../contracts/forge-ai.ts";
import type { PersistedProjectView } from "../../contracts/project-persistence.ts";

const analysisModeSchema = z.enum(["mock", "gpt"]);

export function parseStoredProject(record: {
  id: string;
  name: string;
  idea: string;
  projectDNA: unknown;
  analysis: unknown;
  analysisMode: string | null;
}): PersistedProjectView {
  const dnaResult =
    record.projectDNA === null
      ? null
      : projectDNASchema.safeParse(record.projectDNA);
  const analysisResult =
    record.analysis === null
      ? null
      : forgeWorkspaceAnalysisSchema.safeParse(record.analysis);
  const modeResult =
    record.analysisMode === null
      ? null
      : analysisModeSchema.safeParse(record.analysisMode);
  const warnings: string[] = [];

  if (dnaResult && !dnaResult.success) {
    warnings.push(
      "Stored Project DNA could not be validated and was not loaded.",
    );
  }
  if (analysisResult && !analysisResult.success) {
    warnings.push(
      "Stored workspace analysis could not be validated and was not loaded.",
    );
  }
  if (modeResult && !modeResult.success) {
    warnings.push("Stored provider information could not be validated.");
  }

  const analysis = analysisResult?.success ? analysisResult.data : null;
  const analysisMode = modeResult?.success ? modeResult.data : null;

  if (analysis && !analysisMode) {
    warnings.push(
      "Stored workspace analysis is missing valid provider information.",
    );
  }

  return {
    id: record.id,
    name: record.name,
    idea: record.idea,
    projectDNA: dnaResult?.success ? dnaResult.data : null,
    analysis: analysis && analysisMode ? analysis : null,
    analysisMode: analysis && analysisMode ? analysisMode : null,
    loadWarning: warnings.length > 0 ? warnings.join(" ") : null,
  };
}

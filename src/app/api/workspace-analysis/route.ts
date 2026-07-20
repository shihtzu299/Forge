import { createWorkspaceAnalysisHandler } from "../../../lib/ai/workspace-analysis-handler.ts";
import {
  saveProjectAnalysis,
  saveProjectDNA,
} from "../../../lib/projects/project-repository.ts";

export const runtime = "nodejs";

export const POST = createWorkspaceAnalysisHandler({
  store: {
    saveDNA: saveProjectDNA,
    saveAnalysis: saveProjectAnalysis,
  },
});

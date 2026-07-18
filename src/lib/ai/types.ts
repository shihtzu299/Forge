import type {
  ForgeSection,
  ForgeWorkspaceAnalysis,
} from "../../contracts/forge-ai.ts";
import type { ProjectDNA } from "../../types/project.ts";
import type { ForgeAnalysisError } from "./errors.ts";

export type AnalysisMode = "mock" | "gpt";

export type AnalysisInput = {
  mode: AnalysisMode;
  projectDNA: ProjectDNA;
  requestedSections: readonly ForgeSection[];
  generationMode: "initial";
};

export type AnalysisResult =
  | { ok: true; analysis: ForgeWorkspaceAnalysis }
  | { ok: false; error: ForgeAnalysisError };

export type DelayFunction = (milliseconds: number) => Promise<void>;

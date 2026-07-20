import type { ForgeWorkspaceAnalysis } from "@/contracts/forge-ai";
import type { AnalysisMode } from "@/lib/ai/types";

export type VisibleProviderId = AnalysisMode | "gemini" | "hugging-face";

export const DEFAULT_ANALYSIS_MODE: AnalysisMode = "mock";
export const EMPTY_GROUP_MESSAGE = "No items were generated for this group.";

export const visibleProviderOptions: readonly {
  id: VisibleProviderId;
  label: string;
  description: string;
  enabled: boolean;
}[] = [
  {
    id: "mock",
    label: "Mock",
    description: "Deterministic, local, and safe for development.",
    enabled: true,
  },
  {
    id: "gpt",
    label: "GPT-5.6",
    description: "Uses server-only credentials when configured.",
    enabled: true,
  },
  {
    id: "gemini",
    label: "Gemini",
    description: "Coming soon",
    enabled: false,
  },
  {
    id: "hugging-face",
    label: "Hugging Face",
    description: "Coming soon",
    enabled: false,
  },
];

export function getProviderLabel(mode: AnalysisMode) {
  return mode === "mock" ? "Mock" : "GPT-5.6";
}

export function createGeneratedWorkspaceSnapshot(
  analysis: ForgeWorkspaceAnalysis,
  mode: AnalysisMode,
) {
  return { analysis, mode } as const;
}

export function createProjectOverview(
  project: ForgeWorkspaceAnalysis["project"],
  mode: AnalysisMode,
) {
  return {
    title: project.title,
    elevatorPitch: project.elevatorPitch,
    problemStatement: project.problemStatement,
    targetCustomer: project.targetCustomer,
    valueProposition: project.valueProposition,
    provider: getProviderLabel(mode),
  } as const;
}

export function getEmptyGroupMessage(items: readonly unknown[]) {
  return items.length === 0 ? EMPTY_GROUP_MESSAGE : null;
}

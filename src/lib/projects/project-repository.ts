import "server-only";

import type { ForgeWorkspaceAnalysis } from "../../contracts/forge-ai.ts";
import type { PersistedProjectView } from "../../contracts/project-persistence.ts";
import type { Prisma } from "../../generated/prisma/client.ts";
import type { ProjectDNA } from "../../types/project.ts";
import type { AnalysisMode } from "../ai/types.ts";
import { getPrisma } from "../db/prisma.ts";
import { deriveProjectName } from "../project-name.ts";
import { parseStoredProject } from "./project-storage.ts";

export async function createProject(idea: string) {
  return getPrisma().project.create({
    data: { idea, name: deriveProjectName(idea) },
    select: { id: true },
  });
}

export async function findProjectForRendering(
  projectId: string,
): Promise<PersistedProjectView | null> {
  const record = await getPrisma().project.findUnique({
    where: { id: projectId },
  });

  return record ? parseStoredProject(record) : null;
}

export async function saveProjectDNA(
  projectId: string,
  projectDNA: ProjectDNA,
) {
  return getPrisma().project.update({
    where: { id: projectId },
    data: { projectDNA: toJsonInput(projectDNA) },
    select: { id: true },
  });
}

export async function saveProjectAnalysis(
  projectId: string,
  analysis: ForgeWorkspaceAnalysis,
  mode: AnalysisMode,
) {
  return getPrisma().project.update({
    where: { id: projectId },
    data: {
      analysis: toJsonInput(analysis),
      analysisMode: mode,
      name: analysis.project.title,
    },
    select: { id: true },
  });
}

function toJsonInput(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

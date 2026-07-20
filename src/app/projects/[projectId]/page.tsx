import { notFound } from "next/navigation";

import { projectIdSchema } from "@/contracts/project-persistence";
import { WorkspaceGeneration } from "@/components/workspace/workspace-generation";
import { findProjectForRendering } from "@/lib/projects/project-repository";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  if (!projectIdSchema.safeParse(projectId).success) notFound();

  const project = await findProjectForRendering(projectId);

  if (!project) notFound();

  return (
    <div className="h-dvh overflow-hidden bg-background text-text-primary">
      <WorkspaceGeneration
        projectId={project.id}
        idea={project.idea}
        initialProjectName={project.name}
        initialProjectDNA={project.projectDNA}
        initialAnalysis={project.analysis}
        initialMode={project.analysisMode}
        initialLoadWarning={project.loadWarning}
        isVisible
      />
    </div>
  );
}

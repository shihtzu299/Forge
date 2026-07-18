"use client";

import { useEffect, useRef, useState } from "react";

import { ProjectCreation } from "@/components/creation/project-creation";
import type { IntelligenceCard } from "@/components/layout/intelligence-panel";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { deriveProjectName } from "@/lib/project-name";
import type { ProjectDNAProgress } from "@/types/project";

type ExperiencePhase = "create" | "commit" | "forming" | "workspace";

const initializingCards: readonly IntelligenceCard[] = [
  {
    title: "Project Health",
    value: "Initializing...",
    description: "Establishing the project foundation.",
  },
  {
    title: "Momentum",
    value: "Building project...",
    description: "Preparing the workspace structure.",
  },
  {
    title: "Next Recommendation",
    value: "Analyzing idea...",
    description: "Finding the most useful starting point.",
  },
];

const intelligenceByDNAProgress: Record<
  ProjectDNAProgress,
  readonly IntelligenceCard[]
> = {
  "not-started": [
    {
      title: "Project Health",
      value: "Foundation ready",
      description: "The project workspace has been established.",
    },
    {
      title: "Momentum",
      value: "Project created",
      description: "Your idea is ready to move through the workflow.",
    },
    {
      title: "Next Recommendation",
      value: "Clarify the opportunity",
      description: "Define the problem and who experiences it.",
    },
  ],
  "in-progress": [
    {
      title: "Project Health",
      value: "Defining foundation",
      description: "Project context is becoming more specific.",
    },
    {
      title: "Momentum",
      value: "Project DNA in progress",
      description: "Your answers are shaping the foundation.",
    },
    {
      title: "Next Recommendation",
      value: "Answer the current question",
      description: "Keep each response concrete and focused.",
    },
  ],
  complete: [
    {
      title: "Project Health",
      value: "Project DNA complete",
      description: "The foundational context is ready.",
    },
    {
      title: "Momentum",
      value: "Ready for analysis",
      description: "The project can move into structured analysis.",
    },
    {
      title: "Next Recommendation",
      value: "Generate the workspace",
      description: "Use the completed DNA to continue.",
    },
  ],
  ready: [
    {
      title: "Project Health",
      value: "Project DNA complete",
      description: "The foundational context is ready.",
    },
    {
      title: "Momentum",
      value: "Ready for analysis",
      description: "The project can move into structured analysis.",
    },
    {
      title: "Next Recommendation",
      value: "Generate the workspace",
      description: "GPT-5.6 integration is the next milestone.",
    },
  ],
};

export function ForgeApp() {
  const [idea, setIdea] = useState("");
  const [projectName, setProjectName] = useState("Untitled project");
  const [phase, setPhase] = useState<ExperiencePhase>("create");
  const [dnaProgress, setDNAProgress] =
    useState<ProjectDNAProgress>("not-started");
  const summaryHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (phase === "commit") {
      const commitTimer = window.setTimeout(() => setPhase("forming"), 180);

      return () => window.clearTimeout(commitTimer);
    }

    if (phase === "forming") {
      const formingTimer = window.setTimeout(() => setPhase("workspace"), 820);

      return () => window.clearTimeout(formingTimer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "workspace") {
      summaryHeadingRef.current?.focus();
    }
  }, [phase]);

  function createWorkspace(projectIdea: string) {
    if (phase !== "create") return;

    setIdea(projectIdea);
    setProjectName(deriveProjectName(projectIdea));
    setPhase(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "workspace"
        : "commit",
    );
  }

  const isCreating = phase !== "create";
  const isShellVisible = phase === "forming" || phase === "workspace";
  const intelligenceCards =
    phase === "forming"
      ? initializingCards
      : intelligenceByDNAProgress[dnaProgress];

  return (
    <div className="relative h-dvh overflow-hidden bg-background text-text-primary">
      <div
        className={`absolute inset-0 ${
          isShellVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isShellVisible}
        inert={!isShellVisible}
      >
        <WorkspaceShell
          idea={idea}
          projectName={projectName}
          intelligenceCards={intelligenceCards}
          isVisible={isShellVisible}
          summaryHeadingRef={summaryHeadingRef}
          onDNAProgressChange={setDNAProgress}
        />
      </div>

      <ProjectCreation
        isCreating={isCreating}
        isCommitting={phase === "commit"}
        isHidden={isShellVisible}
        onCreate={createWorkspace}
      />
    </div>
  );
}

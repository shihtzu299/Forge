"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type {
  ForgeSection,
  ForgeWorkspaceAnalysis,
} from "@/contracts/forge-ai";
import { forgeWorkspaceAnalysisSchema } from "@/contracts/forge-ai";
import type { WorkspaceGenerationResponse } from "@/contracts/workspace-generation";
import {
  IntelligencePanel,
  type IntelligenceCard,
} from "@/components/layout/intelligence-panel";
import { TopBar } from "@/components/layout/top-bar";
import { WorkspaceSidebar } from "@/components/layout/workspace-sidebar";
import { ProjectDNABuilder } from "@/components/project-dna/project-dna-builder";
import { DeveloperSettings } from "@/components/workspace/developer-settings";
import { GeneratedProjectOverview } from "@/components/workspace/generated-project-overview";
import { GenerationProgress } from "@/components/workspace/generation-progress";
import { ProjectSummaryCard } from "@/components/workspace/project-summary-card";
import { WorkspaceSectionRenderer } from "@/components/workspace/workspace-section-renderer";
import {
  createGeneratedWorkspaceSnapshot,
  DEFAULT_ANALYSIS_MODE,
  getProviderLabel,
} from "@/components/workspace/workspace-generation-config";
import type { AnalysisMode } from "@/lib/ai/types";
import type { ProjectDNA, ProjectDNAProgress } from "@/types/project";

type GenerationState =
  | { status: "idle" }
  | { status: "generating" }
  | {
      status: "success";
      analysis: ForgeWorkspaceAnalysis;
      mode: AnalysisMode;
    }
  | {
      status: "error";
      message: string;
      retryable: boolean;
      projectDNA: ProjectDNA;
      mode: AnalysisMode;
    };

const initialIntelligence: readonly IntelligenceCard[] = [
  {
    title: "Project Health",
    value: "Foundation ready",
    description: "Complete Project DNA to prepare analysis.",
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
];

const generatingIntelligence: readonly IntelligenceCard[] = [
  {
    title: "Project Health",
    value: "Analyzing foundation",
    description: "Validating the project context.",
  },
  {
    title: "Momentum",
    value: "Generating workspace",
    description: "Building six structured project areas.",
  },
  {
    title: "Next Recommendation",
    value: "Preparing guidance",
    description: "Connecting decisions across the workspace.",
  },
];

export function WorkspaceGeneration({
  projectId,
  idea,
  initialProjectName,
  initialProjectDNA,
  initialAnalysis,
  initialMode,
  initialLoadWarning,
  isVisible,
}: {
  projectId: string;
  idea: string;
  initialProjectName: string;
  initialProjectDNA: ProjectDNA | null;
  initialAnalysis: ForgeWorkspaceAnalysis | null;
  initialMode: AnalysisMode | null;
  initialLoadWarning: string | null;
  isVisible: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<AnalysisMode>(
    initialMode ?? DEFAULT_ANALYSIS_MODE,
  );
  const [generation, setGeneration] = useState<GenerationState>(() =>
    initialAnalysis && initialMode
      ? { status: "success", analysis: initialAnalysis, mode: initialMode }
      : { status: "idle" },
  );
  const [activeSection, setActiveSection] = useState<ForgeSection>("discover");
  const [dnaProgress, setDNAProgress] = useState<ProjectDNAProgress>(
    initialProjectDNA ? "complete" : "not-started",
  );
  const [progressStep, setProgressStep] = useState(0);
  const sectionHeadingPendingRef = useRef(false);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorHeadingRef = useRef<HTMLHeadingElement>(null);
  const summaryHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (generation.status !== "generating") return;

    const interval = window.setInterval(() => {
      setProgressStep((current) => Math.min(current + 1, 7));
    }, 500);

    return () => window.clearInterval(interval);
  }, [generation.status]);

  useEffect(() => {
    if (!sectionHeadingPendingRef.current) return;
    document.querySelector<HTMLElement>("#workspace-section-title")?.focus();
    sectionHeadingPendingRef.current = false;
  }, [activeSection]);

  useEffect(() => {
    if (generation.status === "success") {
      successHeadingRef.current?.focus();
    } else if (generation.status === "error") {
      errorHeadingRef.current?.focus();
    }
  }, [generation.status]);

  const analysis = generation.status === "success" ? generation.analysis : null;
  const projectName = analysis?.project.title ?? initialProjectName;
  const intelligenceCards = analysis
    ? cardsFromAnalysis(analysis)
    : generation.status === "generating"
      ? generatingIntelligence
      : cardsForDNAProgress(dnaProgress);

  async function generate(projectDNA: ProjectDNA) {
    if (generation.status === "generating") return;

    const requestedMode = mode;
    setGeneration({ status: "generating" });
    setProgressStep(0);

    try {
      const response = await fetch("/api/workspace-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          mode: requestedMode,
          projectDNA,
        }),
      });
      const payload: unknown = await response.json();

      if (!isWorkspaceGenerationResponse(payload)) {
        throw new Error("Forge received an invalid server response.");
      }

      if (!payload.ok) {
        setGeneration({
          status: "error",
          message: payload.error.message,
          retryable: payload.error.retryable,
          projectDNA,
          mode: requestedMode,
        });
        return;
      }

      const validatedAnalysis = forgeWorkspaceAnalysisSchema.safeParse(
        payload.analysis,
      );

      if (!validatedAnalysis.success) {
        throw new Error(
          "Forge received workspace data that could not be validated.",
        );
      }

      setActiveSection("discover");
      setGeneration({
        status: "success",
        ...createGeneratedWorkspaceSnapshot(
          validatedAnalysis.data,
          requestedMode,
        ),
      });
      router.refresh();
    } catch {
      setGeneration({
        status: "error",
        message:
          "Forge could not reach the analysis service. Check your connection and try again.",
        retryable: true,
        projectDNA,
        mode: requestedMode,
      });
    }
  }

  function selectSection(section: ForgeSection) {
    if (!analysis) return;
    sectionHeadingPendingRef.current = true;
    setActiveSection(section);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <TopBar projectName={projectName} isVisible={isVisible} />
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(22rem,1fr)_auto] overflow-y-auto lg:grid-cols-[13.5rem_minmax(0,1fr)_20rem] lg:grid-rows-1 lg:overflow-hidden">
        <WorkspaceSidebar
          isVisible={isVisible}
          activeSection={activeSection}
          enabled={Boolean(analysis)}
          onSectionChange={selectSection}
        />

        <main className="min-h-[22rem] overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-5xl">
            {analysis ? (
              <>
                <GeneratedProjectOverview
                  project={analysis.project}
                  mode={
                    generation.status === "success" ? generation.mode : mode
                  }
                  headingRef={successHeadingRef}
                />
                <WorkspaceSectionRenderer
                  section={activeSection}
                  analysis={analysis}
                />
              </>
            ) : (
              <div className="grid gap-5">
                {initialLoadWarning ? (
                  <section
                    role="status"
                    className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-text-secondary"
                  >
                    {initialLoadWarning}
                  </section>
                ) : null}
                <ProjectSummaryCard
                  idea={idea}
                  projectName={projectName}
                  headingRef={summaryHeadingRef}
                />
                <DeveloperSettings
                  mode={mode}
                  disabled={generation.status === "generating"}
                  onModeChange={setMode}
                />
                <ProjectDNABuilder
                  idea={idea}
                  initialProjectDNA={initialProjectDNA}
                  isGenerating={generation.status === "generating"}
                  allowEditing={generation.status === "error"}
                  onGenerate={generate}
                  onProgressChange={setDNAProgress}
                />
                {generation.status === "generating" ? (
                  <GenerationProgress activeStep={progressStep} />
                ) : null}
                {generation.status === "error" ? (
                  <section
                    role="alert"
                    className="rounded-xl border border-destructive/50 bg-destructive/10 p-5"
                  >
                    <h2
                      ref={errorHeadingRef}
                      tabIndex={-1}
                      className="text-sm font-semibold"
                    >
                      Workspace generation stopped
                    </h2>
                    <p className="mt-2 text-xs font-medium text-text-muted">
                      Provider: {getProviderLabel(generation.mode)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {generation.message}
                    </p>
                    {generation.retryable ? (
                      <button
                        type="button"
                        onClick={() => generate(generation.projectDNA)}
                        className="mt-4 min-h-11 rounded-md bg-accent-primary px-5 py-2.5 text-sm font-semibold text-white"
                      >
                        Retry generation
                      </button>
                    ) : null}
                  </section>
                ) : null}
              </div>
            )}
          </div>
        </main>

        <IntelligencePanel
          cards={intelligenceCards}
          confidence={analysis?.intelligence.confidence}
          unresolvedQuestions={analysis?.intelligence.unresolvedQuestions}
          isVisible={isVisible}
        />
      </div>
    </div>
  );
}

function isWorkspaceGenerationResponse(
  value: unknown,
): value is WorkspaceGenerationResponse {
  if (!value || typeof value !== "object" || !("ok" in value)) return false;
  if (value.ok === true && "analysis" in value) return true;

  const error = "error" in value ? value.error : null;

  return (
    value.ok === false &&
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    "retryable" in error
  );
}

function cardsFromAnalysis(
  analysis: ForgeWorkspaceAnalysis,
): readonly IntelligenceCard[] {
  return [
    {
      title: "Project Health",
      value: analysis.intelligence.projectHealth.title,
      description: analysis.intelligence.projectHealth.summary,
    },
    {
      title: "Momentum",
      value: analysis.intelligence.momentum.title,
      description: analysis.intelligence.momentum.summary,
    },
    {
      title: "Next Recommendation",
      value: analysis.intelligence.nextRecommendation.title,
      description: analysis.intelligence.nextRecommendation.nextAction,
    },
  ];
}

function cardsForDNAProgress(
  progress: ProjectDNAProgress,
): readonly IntelligenceCard[] {
  if (progress === "in-progress") {
    return [
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
    ];
  }
  if (progress === "complete" || progress === "ready") {
    return [
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
        description: "Choose a provider and generate structured guidance.",
      },
    ];
  }
  return initialIntelligence;
}

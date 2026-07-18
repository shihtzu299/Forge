"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";

const workspaceStages = [
  "Discover",
  "Decide",
  "Design",
  "Build",
  "Validate",
  "Launch",
] as const;

const projectExamples = [
  "AI Startup",
  "Marketplace",
  "Developer Tool",
  "Fintech",
  "Climate Tech",
  "Research Project",
] as const;

const defaultIntelligenceCards = [
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
] as const;

const initializingIntelligenceCards = [
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
] as const;

type ExperiencePhase = "create" | "commit" | "forming" | "workspace";

function deriveProjectName(idea: string) {
  const words = idea
    .replace(/[^\p{L}\p{N}'’-]+/gu, " ")
    .trim()
    .split(/\s+/);
  const leadingVerbs = new Set([
    "build",
    "create",
    "develop",
    "launch",
    "make",
  ]);
  const firstWord = words[0]?.toLocaleLowerCase();
  const meaningfulWords = leadingVerbs.has(firstWord) ? words.slice(1) : words;
  const name = meaningfulWords.slice(0, 5).join(" ");

  return name || "Untitled project";
}

export default function Home() {
  const [idea, setIdea] = useState("");
  const [submittedIdea, setSubmittedIdea] = useState("");
  const [projectName, setProjectName] = useState("Untitled project");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<ExperiencePhase>("create");
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

  function selectExample(example: (typeof projectExamples)[number]) {
    setIdea(example);
    setError("");
  }

  function createWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (phase !== "create") {
      return;
    }

    const normalizedIdea = idea.trim();

    if (!normalizedIdea) {
      setError("Describe what you are building to create a workspace.");
      return;
    }

    setSubmittedIdea(normalizedIdea);
    setProjectName(deriveProjectName(normalizedIdea));
    setError("");
    setPhase(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "workspace"
        : "commit",
    );
  }

  const intelligenceCards =
    phase === "forming"
      ? initializingIntelligenceCards
      : defaultIntelligenceCards;
  const isCreating = phase !== "create";
  const isShellVisible = phase === "forming" || phase === "workspace";

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
          idea={submittedIdea}
          projectName={projectName}
          intelligenceCards={intelligenceCards}
          isVisible={isShellVisible}
          summaryHeadingRef={summaryHeadingRef}
        />
      </div>

      <div
        className={`absolute inset-0 z-10 overflow-y-auto bg-background transition-[opacity,transform] duration-300 ease-out ${
          phase === "create"
            ? "translate-y-0 opacity-100"
            : phase === "commit"
              ? "-translate-y-3 scale-[0.99] opacity-80"
              : "pointer-events-none -translate-y-4 scale-[0.99] opacity-0"
        }`}
        aria-hidden={isShellVisible}
        inert={isShellVisible}
      >
        <main className="flex min-h-full items-center justify-center px-5 py-12 sm:px-8 sm:py-16">
          <div className="w-full max-w-3xl">
            <div className="mb-12 text-center">
              <Image
                src="/logo.png"
                alt="Forge"
                width={88}
                height={88}
                priority
                className="mx-auto size-20 rounded-xl border border-border object-cover shadow-md sm:size-[5.5rem]"
              />
              <p className="mt-5 text-lg font-semibold tracking-tight">Forge</p>
              <p className="mt-1 text-sm text-text-muted">
                Turn ideas into momentum.
              </p>
              <p className="mt-3 text-xs text-text-muted">
                Ideas become momentum here.
              </p>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-3xl tracking-tight sm:text-4xl">
                What are you building?
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
                Describe your vision. Forge will build the workspace around it.
              </p>
            </div>

            <form onSubmit={createWorkspace} noValidate>
              <label htmlFor="project-idea" className="sr-only">
                Describe your project idea
              </label>
              <textarea
                id="project-idea"
                value={idea}
                onChange={(event) => {
                  setIdea(event.target.value);
                  if (error) setError("");
                }}
                placeholder="Build Africa's leading proptech platform..."
                rows={6}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "project-idea-error" : undefined}
                readOnly={isCreating}
                className="w-full resize-none rounded-xl border border-border bg-surface-elevated p-5 text-base leading-7 text-text-primary shadow-md outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-text-muted hover:border-text-muted/60 focus:border-accent-primary sm:p-6 sm:text-lg"
              />

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {projectExamples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => selectExample(example)}
                    disabled={isCreating}
                    className="rounded-md border border-border bg-surface-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors duration-200 hover:border-accent-primary/60 hover:text-text-primary"
                  >
                    {example}
                  </button>
                ))}
              </div>

              <div className="mt-5 min-h-6 text-center">
                {error ? (
                  <p
                    id="project-idea-error"
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {error}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isCreating}
                aria-busy={isCreating}
                className="mx-auto mt-2 flex min-h-12 w-full max-w-56 items-center justify-center gap-2 rounded-md bg-accent-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-200 hover:bg-accent-primary/90 active:translate-y-px disabled:cursor-wait disabled:opacity-90"
              >
                {isCreating ? (
                  <>
                    <span
                      className="size-3.5 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin"
                      aria-hidden="true"
                    />
                    Creating workspace...
                  </>
                ) : (
                  "Create Workspace"
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

type IntelligenceCard = {
  readonly title: string;
  readonly value: string;
  readonly description: string;
};

function WorkspaceShell({
  idea,
  projectName,
  intelligenceCards,
  isVisible,
  summaryHeadingRef,
}: {
  idea: string;
  projectName: string;
  intelligenceCards: readonly IntelligenceCard[];
  isVisible: boolean;
  summaryHeadingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const revealedClasses = "translate-x-0 translate-y-0 scale-100 opacity-100";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <header
        className={`grid h-16 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-b border-border bg-surface-elevated px-4 transition-[opacity,transform] duration-300 ease-out sm:px-5 ${
          isVisible
            ? revealedClasses
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="flex items-center gap-2.5" aria-label="Forge">
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-md border border-border object-cover shadow-sm"
          />
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">
            Forge
          </span>
        </div>

        <div className="min-w-0 text-center">
          <span className="block truncate text-sm text-text-secondary">
            {projectName}
          </span>
        </div>

        <span className="text-sm text-text-muted">Settings</span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(22rem,1fr)_auto] overflow-y-auto lg:grid-cols-[13.5rem_minmax(0,1fr)_20rem] lg:grid-rows-1 lg:overflow-hidden">
        <nav
          aria-label="Project workflow"
          className={`overflow-x-auto border-b border-border bg-surface-subtle p-2 transition-[opacity,transform] delay-100 duration-300 ease-out lg:overflow-y-auto lg:border-r lg:border-b-0 lg:p-4 ${
            isVisible
              ? revealedClasses
              : "pointer-events-none -translate-x-2 opacity-0"
          }`}
        >
          <ol className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col lg:gap-1.5">
            {workspaceStages.map((stage, index) => (
              <li key={stage}>
                <div
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${
                    index === 0
                      ? "bg-surface-elevated text-text-primary shadow-sm"
                      : "text-text-muted"
                  }`}
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-sm border text-[0.625rem] font-medium ${
                      index === 0
                        ? "border-accent-primary text-accent-primary"
                        : "border-border text-text-muted"
                    }`}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span>{stage}</span>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        <main
          className={`min-h-[22rem] overflow-y-auto bg-background p-6 transition-[opacity,transform] delay-[340ms] duration-500 ease-out sm:p-10 ${
            isVisible
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-2 scale-[0.99] opacity-0"
          }`}
        >
          <div className="mx-auto flex min-h-full w-full max-w-4xl items-center justify-center">
            <section className="w-full rounded-xl border border-border bg-surface-elevated p-6 shadow-md sm:p-8">
              <div className="mb-5 flex items-center gap-2 text-xs font-medium text-accent-primary">
                <span className="size-1.5 rounded-full bg-accent-secondary" />
                Project Summary
              </div>
              <h1
                ref={summaryHeadingRef}
                tabIndex={-1}
                className="text-2xl tracking-tight sm:text-3xl"
              >
                {projectName}
              </h1>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-text-secondary sm:text-base">
                {idea}
              </p>
            </section>
          </div>
        </main>

        <aside
          aria-label="Project intelligence"
          className={`border-t border-border bg-surface-subtle p-4 transition-[opacity,transform] delay-[220ms] duration-300 ease-out lg:overflow-y-auto lg:border-t-0 lg:border-l lg:p-5 ${
            isVisible
              ? revealedClasses
              : "pointer-events-none translate-x-2 opacity-0"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Intelligence</h2>
            <span className="size-1.5 rounded-full bg-accent-secondary" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {intelligenceCards.map((card) => (
              <section
                key={card.title}
                className="rounded-lg border border-border bg-surface-elevated p-4 shadow-sm"
              >
                <h3 className="text-xs font-medium text-text-muted">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm font-medium text-text-primary">
                  {card.value}
                </p>
                <p className="mt-1.5 text-xs leading-5 text-text-muted">
                  {card.description}
                </p>
              </section>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

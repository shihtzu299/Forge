"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

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
    value: "Not assessed",
    description: "Health signals will appear as the project takes shape.",
  },
  {
    title: "Momentum",
    value: "Workspace ready",
    description: "Progress and activity will be summarized here.",
  },
  {
    title: "Next Recommendation",
    value: "Begin discovery",
    description: "Forge will surface the most useful next step.",
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

type ExperiencePhase = "create" | "initializing" | "workspace";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [submittedIdea, setSubmittedIdea] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<ExperiencePhase>("create");

  useEffect(() => {
    if (phase !== "initializing") {
      return;
    }

    const timer = window.setTimeout(() => setPhase("workspace"), 1800);

    return () => window.clearTimeout(timer);
  }, [phase]);

  function selectExample(example: (typeof projectExamples)[number]) {
    setIdea(example);
    setError("");
  }

  function createWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedIdea = idea.trim();

    if (!normalizedIdea) {
      setError("Describe what you are building to create a workspace.");
      return;
    }

    setSubmittedIdea(normalizedIdea);
    setError("");
    setPhase("initializing");
  }

  const intelligenceCards =
    phase === "initializing"
      ? initializingIntelligenceCards
      : defaultIntelligenceCards;

  return (
    <div className="relative h-dvh overflow-hidden bg-background text-text-primary">
      <div
        className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out ${
          phase === "create"
            ? "pointer-events-none scale-[0.985] opacity-0"
            : "scale-100 opacity-100"
        }`}
        aria-hidden={phase === "create"}
        inert={phase === "create"}
      >
        <WorkspaceShell
          idea={submittedIdea}
          intelligenceCards={intelligenceCards}
          isInitializing={phase === "initializing"}
        />
      </div>

      <div
        className={`absolute inset-0 z-10 overflow-y-auto bg-background transition-[opacity,transform] duration-500 ease-out ${
          phase === "create"
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
        aria-hidden={phase !== "create"}
        inert={phase !== "create"}
      >
        <main className="flex min-h-full items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-3xl">
            <div className="mb-10 text-center">
              <Image
                src="/logo.png"
                alt="Forge"
                width={72}
                height={72}
                priority
                className="mx-auto size-16 rounded-xl border border-border object-cover shadow-md sm:size-[4.5rem]"
              />
              <p className="mt-5 text-lg font-semibold tracking-tight">Forge</p>
              <p className="mt-1 text-sm text-text-muted">
                Turn ideas into momentum.
              </p>
            </div>

            <div className="mb-7 text-center">
              <h1 className="text-3xl tracking-tight sm:text-4xl">
                What are you building?
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
                Describe your idea. Forge will transform it into a living
                project workspace.
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
                className="w-full resize-none rounded-xl border border-border bg-surface-elevated p-5 text-base leading-7 text-text-primary shadow-md outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-text-muted hover:border-text-muted/60 focus:border-accent-primary sm:p-6 sm:text-lg"
              />

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {projectExamples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => selectExample(example)}
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
                className="mx-auto mt-2 flex min-h-12 w-full max-w-56 items-center justify-center rounded-md bg-accent-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-200 hover:bg-accent-primary/90 active:translate-y-px"
              >
                Create Workspace
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
  intelligenceCards,
  isInitializing,
}: {
  idea: string;
  intelligenceCards: readonly IntelligenceCard[];
  isInitializing: boolean;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <header className="grid h-16 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-b border-border bg-surface-elevated px-4 sm:px-5">
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
            Untitled project
          </span>
        </div>

        <span className="text-sm text-text-muted">Settings</span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(22rem,1fr)_auto] overflow-y-auto lg:grid-cols-[13.5rem_minmax(0,1fr)_20rem] lg:grid-rows-1 lg:overflow-hidden">
        <nav
          aria-label="Project workflow"
          className="overflow-x-auto border-b border-border bg-surface-subtle p-2 lg:overflow-y-auto lg:border-r lg:border-b-0 lg:p-4"
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

        <main className="grid min-h-[22rem] place-items-center overflow-y-auto bg-background p-6 sm:p-10">
          <div className="max-w-lg text-center">
            <div
              className="mx-auto mb-6 grid size-14 place-items-center rounded-lg border border-border bg-surface-subtle shadow-sm"
              aria-hidden="true"
            >
              <span
                className={`size-2.5 rounded-full ${
                  isInitializing ? "bg-accent-primary" : "bg-accent-secondary"
                }`}
              />
            </div>
            <h1 className="text-xl tracking-tight">
              {isInitializing ? "Creating your workspace" : "Workspace ready"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              {isInitializing
                ? "Forge is shaping your idea into a project foundation."
                : idea}
            </p>
          </div>
        </main>

        <aside
          aria-label="Project intelligence"
          className="border-t border-border bg-surface-subtle p-4 lg:overflow-y-auto lg:border-t-0 lg:border-l lg:p-5"
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

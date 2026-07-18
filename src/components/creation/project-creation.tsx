"use client";

import Image from "next/image";
import { useState } from "react";
import type { FormEvent } from "react";

const projectExamples = [
  "AI Startup",
  "Marketplace",
  "Developer Tool",
  "Fintech",
  "Climate Tech",
  "Research Project",
] as const;

type ProjectCreationProps = {
  isCreating: boolean;
  isCommitting: boolean;
  isHidden: boolean;
  onCreate: (idea: string) => void;
};

export function ProjectCreation({
  isCreating,
  isCommitting,
  isHidden,
  onCreate,
}: ProjectCreationProps) {
  const [idea, setIdea] = useState("");
  const [error, setError] = useState("");

  function submitIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCreating) return;

    const normalizedIdea = idea.trim();

    if (!normalizedIdea) {
      setError("Describe what you are building to create a workspace.");
      return;
    }

    setError("");
    onCreate(normalizedIdea);
  }

  return (
    <div
      className={`absolute inset-0 z-10 overflow-y-auto bg-background transition-[opacity,transform] duration-300 ease-out ${
        isHidden
          ? "pointer-events-none -translate-y-4 scale-[0.99] opacity-0"
          : isCommitting
            ? "-translate-y-3 scale-[0.99] opacity-80"
            : "translate-y-0 opacity-100"
      }`}
      aria-hidden={isHidden}
      inert={isHidden}
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

          <form onSubmit={submitIdea} noValidate>
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
                  onClick={() => {
                    setIdea(example);
                    setError("");
                  }}
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
  );
}

import type { RefObject } from "react";

export function ProjectSummaryCard({
  idea,
  projectName,
  headingRef,
}: {
  idea: string;
  projectName: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface-elevated p-6 shadow-md sm:p-8">
      <div className="mb-5 flex items-center gap-2 text-xs font-medium text-accent-primary">
        <span className="size-1.5 rounded-full bg-accent-secondary" />
        Project Summary
      </div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl tracking-tight sm:text-3xl"
      >
        {projectName}
      </h1>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-text-secondary sm:text-base">
        {idea}
      </p>
    </section>
  );
}

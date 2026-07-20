const progressSteps = [
  "Understanding Project DNA",
  "Discovering customers and opportunities",
  "Evaluating assumptions and risks",
  "Designing the product experience",
  "Planning the technical build",
  "Defining validation experiments",
  "Preparing the launch strategy",
  "Finalizing project intelligence",
] as const;

export function GenerationProgress({ activeStep }: { activeStep: number }) {
  return (
    <section
      className="rounded-xl border border-accent-primary/30 bg-surface-elevated p-6 shadow-md"
      aria-labelledby="generation-progress-title"
      aria-live="polite"
      role="status"
    >
      <div className="flex items-center gap-3">
        <span className="size-2 rounded-full bg-accent-secondary" />
        <div>
          <h2 id="generation-progress-title" className="text-base">
            Generating your workspace
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Forge is creating one coherent workspace across all six stages.
          </p>
        </div>
      </div>

      <ol className="mt-6 grid gap-3 sm:grid-cols-2">
        {progressSteps.map((step, index) => {
          const isCurrent = index === activeStep;
          const isComplete = index < activeStep;

          return (
            <li
              key={step}
              className={`rounded-lg border px-4 py-3 text-sm ${
                isCurrent
                  ? "border-accent-primary/50 bg-accent-primary/10 text-text-primary"
                  : "border-border bg-surface-subtle text-text-muted"
              }`}
            >
              <span className="mr-2 text-xs">
                {isComplete ? "Done" : String(index + 1).padStart(2, "0")}
              </span>
              {step}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export type IntelligenceCard = {
  readonly title: string;
  readonly value: string;
  readonly description: string;
};

export function IntelligencePanel({
  cards,
  confidence,
  unresolvedQuestions,
  isVisible,
}: {
  cards: readonly IntelligenceCard[];
  confidence?: number;
  unresolvedQuestions?: readonly string[];
  isVisible: boolean;
}) {
  return (
    <aside
      aria-label="Project intelligence"
      className={`border-t border-border bg-surface-subtle p-4 transition-[opacity,transform] delay-[220ms] duration-300 ease-out lg:overflow-y-auto lg:border-t-0 lg:border-l lg:p-5 ${
        isVisible
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-2 opacity-0"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Intelligence</h2>
        <span className="size-1.5 rounded-full bg-accent-secondary" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {cards.map((card) => (
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

      {typeof confidence === "number" ? (
        <section className="mt-3 rounded-lg border border-border bg-surface-elevated p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-medium text-text-muted">Confidence</h3>
            <span className="text-xs font-semibold text-accent-secondary">
              {confidence}%
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent-secondary"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </section>
      ) : null}

      {unresolvedQuestions?.length ? (
        <section className="mt-3 rounded-lg border border-border bg-surface-elevated p-4 shadow-sm">
          <h3 className="text-xs font-medium text-text-muted">
            Unresolved Questions
          </h3>
          <ul className="mt-3 grid gap-2">
            {unresolvedQuestions.map((question) => (
              <li
                key={question}
                className="text-xs leading-5 text-text-secondary"
              >
                {question}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}

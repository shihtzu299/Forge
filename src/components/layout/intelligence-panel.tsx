export type IntelligenceCard = {
  readonly title: string;
  readonly value: string;
  readonly description: string;
};

export function IntelligencePanel({
  cards,
  isVisible,
}: {
  cards: readonly IntelligenceCard[];
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
    </aside>
  );
}

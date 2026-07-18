export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <section className="w-full max-w-xl rounded-lg border border-border bg-surface-elevated p-8 shadow-md">
        <div className="mb-6 flex items-center gap-2 text-sm font-medium text-accent-primary">
          <span className="size-1.5 rounded-full bg-accent-secondary" />
          Project intelligence
        </div>
        <h1 className="text-4xl tracking-tight text-text-primary">Forge</h1>
        <p className="mt-3 max-w-md text-base text-text-secondary">
          Turn ideas into momentum.
        </p>
        <p className="mt-8 text-sm text-text-muted">
          A calm workspace for thinking, planning, and building.
        </p>
      </section>
    </main>
  );
}

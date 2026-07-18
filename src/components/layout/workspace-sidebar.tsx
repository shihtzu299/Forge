const workspaceStages = [
  "Discover",
  "Decide",
  "Design",
  "Build",
  "Validate",
  "Launch",
] as const;

export function WorkspaceSidebar({ isVisible }: { isVisible: boolean }) {
  return (
    <nav
      aria-label="Project workflow"
      className={`overflow-x-auto border-b border-border bg-surface-subtle p-2 transition-[opacity,transform] delay-100 duration-300 ease-out lg:overflow-y-auto lg:border-r lg:border-b-0 lg:p-4 ${
        isVisible
          ? "translate-x-0 opacity-100"
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
  );
}

import type { ForgeSection } from "@/contracts/forge-ai";

const workspaceStages: readonly { label: string; value: ForgeSection }[] = [
  { label: "Discover", value: "discover" },
  { label: "Decide", value: "decide" },
  { label: "Design", value: "design" },
  { label: "Build", value: "build" },
  { label: "Validate", value: "validate" },
  { label: "Launch", value: "launch" },
];

export function WorkspaceSidebar({
  isVisible,
  activeSection,
  enabled,
  onSectionChange,
}: {
  isVisible: boolean;
  activeSection: ForgeSection;
  enabled: boolean;
  onSectionChange: (section: ForgeSection) => void;
}) {
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
        {workspaceStages.map((stage, index) => {
          const isActive = enabled && activeSection === stage.value;

          return (
            <li key={stage.value}>
              <button
                type="button"
                disabled={!enabled}
                onClick={() => onSectionChange(stage.value)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${
                  isActive
                    ? "bg-surface-elevated text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-sm border text-[0.625rem] font-medium ${
                    isActive
                      ? "border-accent-primary text-accent-primary"
                      : "border-border text-text-muted"
                  }`}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span>{stage.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

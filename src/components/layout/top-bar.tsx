import Image from "next/image";

export function TopBar({
  projectName,
  isVisible,
}: {
  projectName: string;
  isVisible: boolean;
}) {
  return (
    <header
      className={`grid h-16 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-b border-border bg-surface-elevated px-4 transition-[opacity,transform] duration-300 ease-out sm:px-5 ${
        isVisible
          ? "translate-y-0 opacity-100"
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
  );
}

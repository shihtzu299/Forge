import type { AnalysisMode } from "@/lib/ai/types";
import {
  getProviderLabel,
  visibleProviderOptions,
  type VisibleProviderId,
} from "@/components/workspace/workspace-generation-config";

export function DeveloperSettings({
  mode,
  disabled,
  onModeChange,
}: {
  mode: AnalysisMode;
  disabled: boolean;
  onModeChange: (mode: AnalysisMode) => void;
}) {
  return (
    <div className="relative flex justify-end">
      <details className="group relative">
        <summary
          aria-label="Open Developer Settings"
          className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-md border border-border bg-surface-elevated px-3 py-2 text-xs text-text-muted shadow-sm hover:text-text-primary [&::-webkit-details-marker]:hidden"
        >
          <GearIcon />
          <span>{getProviderLabel(mode)}</span>
          <span className="sr-only">Open Developer Settings</span>
        </summary>
        <div className="absolute right-0 z-20 mt-2 w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface-elevated p-5 shadow-md">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Developer Settings</h2>
            <p className="mt-1 text-xs leading-5 text-text-muted">
              Provider selection is held in memory for this workspace only.
            </p>
          </div>
          <fieldset disabled={disabled}>
            <legend className="text-sm font-semibold">Analysis provider</legend>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {visibleProviderOptions.map((provider) => (
                <ModeOption
                  key={provider.id}
                  providerId={provider.id}
                  selectedMode={mode}
                  title={provider.label}
                  description={provider.description}
                  enabled={provider.enabled}
                  onChange={onModeChange}
                />
              ))}
            </div>
          </fieldset>

          <p className="mt-4 text-xs leading-5 text-text-muted">
            API keys and model configuration never enter the browser. Selecting
            GPT does not call the provider until Generate Workspace is pressed.
          </p>
        </div>
      </details>
    </div>
  );
}

function ModeOption({
  providerId,
  selectedMode,
  title,
  description,
  enabled,
  onChange,
}: {
  providerId: VisibleProviderId;
  selectedMode: AnalysisMode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (mode: AnalysisMode) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${
        selectedMode === providerId
          ? "border-accent-primary bg-accent-primary/10"
          : "border-border bg-surface-subtle"
      } ${enabled ? "cursor-pointer" : "cursor-not-allowed opacity-55"}`}
    >
      <input
        type="radio"
        name="analysis-mode"
        value={providerId}
        checked={selectedMode === providerId}
        disabled={!enabled}
        onChange={() => {
          if (providerId === "mock" || providerId === "gpt") {
            onChange(providerId);
          }
        }}
        className="mt-0.5 accent-accent-primary"
      />
      <span>
        <span className="block text-sm font-medium text-text-primary">
          {title}
        </span>
        <span className="mt-1 block text-xs leading-5 text-text-muted">
          {description}
        </span>
      </span>
    </label>
  );
}

function GearIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M8.8 2.3h2.4l.5 1.8 1.5.7 1.7-.8 1.2 2.1-1.3 1.3.1 1.7 1.5 1.1-1.2 2.1-1.8-.5-1.4 1-.2 1.9H9.3l-.5-1.8-1.5-.7-1.7.8-1.2-2.1 1.3-1.3-.1-1.7-1.5-1.1 1.2-2.1 1.8.5 1.4-1 .3-1.9Z" />
      <circle cx="10" cy="8.5" r="2.4" />
    </svg>
  );
}

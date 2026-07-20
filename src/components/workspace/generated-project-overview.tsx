import type { ForgeWorkspaceAnalysis } from "@/contracts/forge-ai";
import type { AnalysisMode } from "@/lib/ai/types";
import { createProjectOverview } from "@/components/workspace/workspace-generation-config";

export function GeneratedProjectOverview({
  project,
  mode,
  headingRef,
}: {
  project: ForgeWorkspaceAnalysis["project"];
  mode: AnalysisMode;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const overview = createProjectOverview(project, mode);

  return (
    <section className="mb-5 rounded-xl border border-border bg-surface-elevated p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent-primary">
            Project Overview
          </p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 text-xl tracking-tight sm:text-2xl"
          >
            {overview.title}
          </h1>
        </div>
        <span className="rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs text-text-secondary">
          Provider: {overview.provider}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-text-secondary">
        {overview.elevatorPitch}
      </p>

      <dl className="mt-5 grid gap-3 md:grid-cols-3">
        <OverviewItem label="Problem" value={overview.problemStatement} />
        <OverviewItem label="Target customer" value={overview.targetCustomer} />
        <OverviewItem
          label="Value proposition"
          value={overview.valueProposition}
        />
      </dl>
    </section>
  );
}

function OverviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-subtle p-4">
      <dt className="text-xs font-medium text-text-muted">{label}</dt>
      <dd className="mt-2 text-xs leading-5 text-text-secondary">{value}</dd>
    </div>
  );
}
import type { RefObject } from "react";

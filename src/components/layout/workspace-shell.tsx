import type { RefObject } from "react";

import { IntelligencePanel } from "@/components/layout/intelligence-panel";
import type { IntelligenceCard } from "@/components/layout/intelligence-panel";
import { TopBar } from "@/components/layout/top-bar";
import { WorkspaceSidebar } from "@/components/layout/workspace-sidebar";
import { ProjectDNABuilder } from "@/components/project-dna/project-dna-builder";
import { ProjectSummaryCard } from "@/components/workspace/project-summary-card";
import type { ProjectDNAProgress } from "@/types/project";

export function WorkspaceShell({
  idea,
  projectName,
  intelligenceCards,
  isVisible,
  summaryHeadingRef,
  onDNAProgressChange,
}: {
  idea: string;
  projectName: string;
  intelligenceCards: readonly IntelligenceCard[];
  isVisible: boolean;
  summaryHeadingRef: RefObject<HTMLHeadingElement | null>;
  onDNAProgressChange: (progress: ProjectDNAProgress) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <TopBar projectName={projectName} isVisible={isVisible} />

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(22rem,1fr)_auto] overflow-y-auto lg:grid-cols-[13.5rem_minmax(0,1fr)_20rem] lg:grid-rows-1 lg:overflow-hidden">
        <WorkspaceSidebar isVisible={isVisible} />

        <main
          className={`min-h-[22rem] overflow-y-auto bg-background p-4 transition-[opacity,transform] delay-[340ms] duration-500 ease-out sm:p-6 lg:p-8 ${
            isVisible
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-2 scale-[0.99] opacity-0"
          }`}
        >
          <div className="mx-auto grid w-full max-w-4xl gap-5">
            <ProjectSummaryCard
              idea={idea}
              projectName={projectName}
              headingRef={summaryHeadingRef}
            />
            <ProjectDNABuilder
              idea={idea}
              onProgressChange={onDNAProgressChange}
            />
          </div>
        </main>

        <IntelligencePanel cards={intelligenceCards} isVisible={isVisible} />
      </div>
    </div>
  );
}

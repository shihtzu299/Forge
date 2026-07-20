import type {
  ArchitectureItem,
  FeatureItem,
  ForgeSection,
  ForgeWorkspaceAnalysis,
  InsightItem,
  MetricItem,
  MilestoneItem,
  RecommendationItem,
  RiskItem,
} from "@/contracts/forge-ai";
import { getEmptyGroupMessage } from "@/components/workspace/workspace-generation-config";

type WorkspaceItem =
  | InsightItem
  | RiskItem
  | FeatureItem
  | MilestoneItem
  | MetricItem
  | ArchitectureItem
  | RecommendationItem;

export function WorkspaceSectionRenderer({
  section,
  analysis,
}: {
  section: ForgeSection;
  analysis: ForgeWorkspaceAnalysis;
}) {
  const groups = getSectionGroups(section, analysis);

  return (
    <section aria-labelledby="workspace-section-title">
      <div className="rounded-xl border border-border bg-surface-elevated p-6 shadow-md sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent-primary">
          Workspace
        </p>
        <h1
          id="workspace-section-title"
          tabIndex={-1}
          className="mt-2 text-2xl capitalize tracking-tight sm:text-3xl"
        >
          {section}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
          {sectionDescriptions[section]}
        </p>
      </div>

      <div className="mt-5 grid gap-5">
        {groups.map((group) => (
          <section
            key={group.title}
            className="rounded-xl border border-border bg-surface-elevated p-5 shadow-sm sm:p-6"
          >
            <h2 className="text-base">{group.title}</h2>
            {getEmptyGroupMessage(group.items) ? (
              <p className="mt-4 rounded-lg border border-dashed border-border bg-surface-subtle p-4 text-sm text-text-muted">
                {getEmptyGroupMessage(group.items)}
              </p>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {group.items.map((item) => (
                  <WorkspaceItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}

function WorkspaceItemCard({ item }: { item: WorkspaceItem }) {
  const title =
    "title" in item ? item.title : "name" in item ? item.name : "Item";
  const body =
    "detail" in item
      ? item.detail
      : "description" in item
        ? item.description
        : "outcome" in item
          ? item.outcome
          : "definition" in item
            ? item.definition
            : "rationale" in item
              ? item.rationale
              : "summary" in item
                ? item.summary
                : "";
  const metadata = getMetadata(item);

  return (
    <article className="rounded-lg border border-border bg-surface-subtle p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium leading-5">{title}</h3>
        {metadata ? (
          <span className="shrink-0 rounded-full border border-border px-2 py-1 text-[0.625rem] uppercase tracking-wide text-text-muted">
            {metadata}
          </span>
        ) : null}
      </div>
      {"summary" in item && item.summary !== body ? (
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {item.summary}
        </p>
      ) : null}
      <p className="mt-2 text-xs leading-5 text-text-muted">{body}</p>
      {"rationale" in item && item.rationale !== body ? (
        <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-text-muted">
          {item.rationale}
        </p>
      ) : null}
      {"nextAction" in item ? (
        <p className="mt-3 text-xs font-medium text-accent-primary">
          Next: {item.nextAction}
        </p>
      ) : null}
      {"mitigation" in item ? (
        <p className="mt-3 text-xs leading-5 text-text-secondary">
          Mitigation: {item.mitigation}
        </p>
      ) : null}
      {"target" in item ? (
        <p className="mt-3 text-xs font-medium text-accent-secondary">
          Target: {item.target}
        </p>
      ) : null}
    </article>
  );
}

function getMetadata(item: WorkspaceItem) {
  if ("evidenceStatus" in item) return item.evidenceStatus;
  if ("severity" in item) return `${item.severity} risk`;
  if ("priority" in item) return item.priority;
  if ("sequence" in item) return `Step ${item.sequence}`;
  return null;
}

function getSectionGroups(
  section: ForgeSection,
  analysis: ForgeWorkspaceAnalysis,
): Array<{ title: string; items: WorkspaceItem[] }> {
  switch (section) {
    case "discover":
      return [
        {
          title: "Customer Segments",
          items: analysis.discover.customerSegments,
        },
        { title: "Pain Points", items: analysis.discover.painPoints },
        { title: "Market Signals", items: analysis.discover.marketSignals },
        {
          title: "Competitor Patterns",
          items: analysis.discover.competitorPatterns,
        },
        { title: "Opportunities", items: analysis.discover.opportunities },
      ];
    case "decide":
      return [
        { title: "Assumptions", items: analysis.decide.assumptions },
        { title: "Risks", items: analysis.decide.risks },
        { title: "Tradeoffs", items: analysis.decide.tradeoffs },
        {
          title: "Recommended Positioning",
          items: [analysis.decide.recommendedPositioning],
        },
        {
          title: "Business Model Options",
          items: analysis.decide.businessModelOptions,
        },
      ];
    case "design":
      return [
        { title: "Personas", items: analysis.design.personas },
        { title: "MVP Features", items: analysis.design.mvpFeatures },
        { title: "User Journey", items: analysis.design.userJourney },
        {
          title: "Experience Principles",
          items: analysis.design.experiencePrinciples,
        },
      ];
    case "build":
      return [
        {
          title: "Architecture Summary",
          items: [analysis.build.architectureSummary],
        },
        { title: "System Components", items: analysis.build.systemComponents },
        { title: "Data Entities", items: analysis.build.dataEntities },
        { title: "API Capabilities", items: analysis.build.apiCapabilities },
        {
          title: "Implementation Milestones",
          items: analysis.build.implementationMilestones,
        },
        { title: "Technical Risks", items: analysis.build.technicalRisks },
      ];
    case "validate":
      return [
        {
          title: "Critical Questions",
          items: analysis.validate.criticalQuestions,
        },
        { title: "Experiments", items: analysis.validate.experiments },
        { title: "Success Metrics", items: analysis.validate.successMetrics },
        { title: "Evidence Needed", items: analysis.validate.evidenceNeeded },
      ];
    case "launch":
      return [
        {
          title: "Go-to-Market Strategy",
          items: [analysis.launch.goToMarketStrategy],
        },
        { title: "Launch Milestones", items: analysis.launch.launchMilestones },
        { title: "Channels", items: analysis.launch.channels },
        { title: "Launch Risks", items: analysis.launch.launchRisks },
        { title: "First Thirty Days", items: analysis.launch.firstThirtyDays },
      ];
  }
}

const sectionDescriptions: Record<ForgeSection, string> = {
  discover:
    "Understand the customer, problem landscape, and opportunity signals shaping this project.",
  decide:
    "Make the assumptions, risks, tradeoffs, and strategic direction explicit.",
  design:
    "Define the people, experience, journey, and minimum product worth building.",
  build:
    "Translate the product direction into systems, data, APIs, and delivery milestones.",
  validate:
    "Turn uncertainty into focused questions, experiments, evidence, and measures.",
  launch:
    "Prepare the path to market, operating sequence, channels, and early risks.",
};

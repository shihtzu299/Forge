import {
  forgeWorkspaceAnalysisSchema,
  type ForgeAnalysisRequest,
  type ForgeWorkspaceAnalysis,
} from "../../../contracts/forge-ai.ts";
import {
  proptechAnalysisRequest,
  proptechWorkspaceAnalysis,
} from "../../../contracts/mocks/proptech-workspace-analysis.ts";
import { deriveProjectName } from "../../project-name.ts";
import type { DelayFunction } from "../types.ts";
import type { AnalysisProvider } from "./analysis-provider.ts";

const defaultDelay: DelayFunction = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function isCanonicalProptechRequest(request: ForgeAnalysisRequest) {
  const expected = proptechAnalysisRequest.projectDNA;
  const actual = request.projectDNA;

  return (
    actual.idea === expected.idea &&
    actual.firstCustomer === expected.firstCustomer &&
    actual.coreProblem === expected.coreProblem &&
    actual.desiredOutcome === expected.desiredOutcome &&
    actual.biggestConstraint === expected.biggestConstraint
  );
}

function adaptStructuredValue(
  value: unknown,
  request: ForgeAnalysisRequest,
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => adaptStructuredValue(item, request));
  }

  if (!value || typeof value !== "object") return value;

  const item = value as Record<string, unknown>;
  const dna = request.projectDNA;

  if ("evidenceStatus" in item) {
    return {
      ...item,
      title: "Project insight to validate",
      summary: `Initial mock insight for ${deriveProjectName(dna.idea)}.`,
      detail:
        "This deterministic placeholder is derived from Project DNA and requires real provider analysis before use as evidence.",
      evidenceStatus: "assumption",
    };
  }

  if ("severity" in item && "mitigation" in item) {
    return {
      ...item,
      title: "Project risk to validate",
      summary: `The stated constraint may affect delivery: ${dna.biggestConstraint}`,
      severity: "medium",
      mitigation:
        "Validate the constraint with direct evidence and reduce scope before committing significant resources.",
    };
  }

  if ("priority" in item) {
    return {
      ...item,
      name: "Initial outcome capability",
      description: `Support the desired customer outcome: ${dna.desiredOutcome}`,
      priority: "must",
      rationale:
        "This neutral mock capability connects the proposed product to the stated outcome without claiming completed analysis.",
    };
  }

  if ("sequence" in item) {
    return {
      ...item,
      title: "Validate the project foundation",
      outcome:
        "Produce direct evidence for the customer, problem, outcome, and delivery constraint.",
    };
  }

  if ("definition" in item && "target" in item) {
    return {
      ...item,
      name: "Customer outcome signal",
      definition: `Measure whether the project creates this change: ${dna.desiredOutcome}`,
      target: "Set a target after baseline evidence is collected",
    };
  }

  if ("nextAction" in item) {
    return {
      ...item,
      title: "Validate the core opportunity",
      summary: "Collect direct evidence before expanding the project plan.",
      rationale:
        "The mock provider cannot verify assumptions and therefore recommends evidence gathering first.",
      nextAction:
        "Interview five people matching the first-customer definition.",
    };
  }

  if ("description" in item && "rationale" in item) {
    return {
      ...item,
      title: "Initial architecture direction",
      description:
        "Use a simple modular system aligned to the validated customer workflow.",
      rationale: `The architecture must respect the stated constraint: ${dna.biggestConstraint}`,
    };
  }

  return Object.fromEntries(
    Object.entries(item).map(([key, nestedValue]) => [
      key,
      adaptStructuredValue(nestedValue, request),
    ]),
  );
}

function createAdaptedAnalysis(
  request: ForgeAnalysisRequest,
): ForgeWorkspaceAnalysis {
  const adapted = adaptStructuredValue(
    structuredClone(proptechWorkspaceAnalysis),
    request,
  ) as ForgeWorkspaceAnalysis;
  const dna = request.projectDNA;

  adapted.project = {
    title: deriveProjectName(dna.idea),
    elevatorPitch: `A project for ${dna.firstCustomer} focused on a clear, measurable customer outcome.`,
    problemStatement: dna.coreProblem,
    targetCustomer: dna.firstCustomer,
    valueProposition: dna.desiredOutcome,
  };
  adapted.intelligence.confidence = 35;
  adapted.intelligence.unresolvedQuestions = [
    "What direct evidence confirms the stated customer problem?",
    `How will the project work within this constraint: ${dna.biggestConstraint}`,
  ];

  return forgeWorkspaceAnalysisSchema.parse(adapted);
}

export class MockAnalysisProvider implements AnalysisProvider {
  readonly name = "mock";
  private readonly delayMilliseconds: number;
  private readonly delay: DelayFunction;

  constructor(delayMilliseconds = 0, delay: DelayFunction = defaultDelay) {
    if (delayMilliseconds < 0) {
      throw new RangeError("Mock provider delay cannot be negative");
    }

    this.delayMilliseconds = delayMilliseconds;
    this.delay = delay;
  }

  async analyze(request: ForgeAnalysisRequest): Promise<unknown> {
    if (this.delayMilliseconds > 0) {
      await this.delay(this.delayMilliseconds);
    }

    const result = isCanonicalProptechRequest(request)
      ? structuredClone(proptechWorkspaceAnalysis)
      : createAdaptedAnalysis(request);
    const validated = forgeWorkspaceAnalysisSchema.parse(result);

    return structuredClone(validated);
  }
}

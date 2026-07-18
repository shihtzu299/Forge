import { z } from "zod";

import type { ProjectDNA } from "@/types/project";

export const FORGE_CONTRACT_VERSION = 1 as const;

export const forgeSections = [
  "discover",
  "decide",
  "design",
  "build",
  "validate",
  "launch",
] as const;

export type ForgeSection = (typeof forgeSections)[number];

export type ForgeAnalysisRequest = {
  projectDNA: ProjectDNA;
  requestedSections: ForgeSection[];
  generationMode: "initial";
  contractVersion: typeof FORGE_CONTRACT_VERSION;
};

const markdownPattern =
  /(^|\n)\s{0,3}(#{1,6}\s|[-*+]\s|\d+\.\s|```|>\s)|\*\*|__/;

const requiredText = z
  .string()
  .trim()
  .min(1, "Required text cannot be empty")
  .max(1_000, "UI-ready text cannot exceed 1,000 characters")
  .refine((value) => !markdownPattern.test(value), {
    message: "Markdown is not allowed in structured text",
  });

const conciseText = requiredText.max(240);
const structuredId = z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*-\d+$/, {
  message: "IDs must use lowercase kebab-case with a numeric suffix",
});

const projectDNASchema: z.ZodType<ProjectDNA> = z.strictObject({
  idea: requiredText,
  firstCustomer: requiredText,
  coreProblem: requiredText,
  desiredOutcome: requiredText,
  biggestConstraint: requiredText,
});

export const forgeAnalysisRequestSchema = z.strictObject({
  projectDNA: projectDNASchema,
  requestedSections: z
    .array(z.enum(forgeSections))
    .min(1)
    .refine((sections) => new Set(sections).size === sections.length, {
      message: "Requested sections must not contain duplicates",
    }),
  generationMode: z.literal("initial"),
  contractVersion: z.literal(FORGE_CONTRACT_VERSION),
});

export const insightItemSchema = z.strictObject({
  id: structuredId,
  title: conciseText,
  summary: conciseText,
  detail: requiredText,
  evidenceStatus: z.enum(["assumption", "signal", "validated"]),
});

export type InsightItem = z.infer<typeof insightItemSchema>;

export const riskItemSchema = z.strictObject({
  id: structuredId,
  title: conciseText,
  summary: conciseText,
  severity: z.enum(["low", "medium", "high"]),
  mitigation: requiredText,
});

export type RiskItem = z.infer<typeof riskItemSchema>;

export const featureItemSchema = z.strictObject({
  id: structuredId,
  name: conciseText,
  description: requiredText,
  priority: z.enum(["must", "should", "could"]),
  rationale: requiredText,
});

export type FeatureItem = z.infer<typeof featureItemSchema>;

export const milestoneItemSchema = z.strictObject({
  id: structuredId,
  title: conciseText,
  outcome: requiredText,
  sequence: z.number().int().positive(),
});

export type MilestoneItem = z.infer<typeof milestoneItemSchema>;

export const metricItemSchema = z.strictObject({
  id: structuredId,
  name: conciseText,
  definition: requiredText,
  target: conciseText,
});

export type MetricItem = z.infer<typeof metricItemSchema>;

export const architectureItemSchema = z.strictObject({
  id: structuredId,
  title: conciseText,
  description: requiredText,
  rationale: requiredText,
});

export type ArchitectureItem = z.infer<typeof architectureItemSchema>;

export const recommendationItemSchema = z.strictObject({
  id: structuredId,
  title: conciseText,
  summary: conciseText,
  rationale: requiredText,
  nextAction: conciseText,
});

export type RecommendationItem = z.infer<typeof recommendationItemSchema>;

const nonEmpty = <T extends z.ZodType>(schema: T) => z.array(schema).min(1);

export const forgeWorkspaceAnalysisSchema = z.strictObject({
  contractVersion: z.literal(FORGE_CONTRACT_VERSION),
  project: z.strictObject({
    title: conciseText,
    elevatorPitch: conciseText,
    problemStatement: conciseText,
    targetCustomer: conciseText,
    valueProposition: conciseText,
  }),
  discover: z.strictObject({
    customerSegments: nonEmpty(insightItemSchema),
    painPoints: nonEmpty(insightItemSchema),
    marketSignals: nonEmpty(insightItemSchema),
    competitorPatterns: nonEmpty(insightItemSchema),
    opportunities: nonEmpty(insightItemSchema),
  }),
  decide: z.strictObject({
    assumptions: nonEmpty(insightItemSchema),
    risks: nonEmpty(riskItemSchema),
    tradeoffs: nonEmpty(insightItemSchema),
    recommendedPositioning: recommendationItemSchema,
    businessModelOptions: nonEmpty(insightItemSchema),
  }),
  design: z.strictObject({
    personas: nonEmpty(insightItemSchema),
    mvpFeatures: nonEmpty(featureItemSchema),
    userJourney: nonEmpty(milestoneItemSchema),
    experiencePrinciples: nonEmpty(insightItemSchema),
  }),
  build: z.strictObject({
    architectureSummary: architectureItemSchema,
    systemComponents: nonEmpty(architectureItemSchema),
    dataEntities: nonEmpty(architectureItemSchema),
    apiCapabilities: nonEmpty(architectureItemSchema),
    implementationMilestones: nonEmpty(milestoneItemSchema),
    technicalRisks: nonEmpty(riskItemSchema),
  }),
  validate: z.strictObject({
    criticalQuestions: nonEmpty(insightItemSchema),
    experiments: nonEmpty(milestoneItemSchema),
    successMetrics: nonEmpty(metricItemSchema),
    evidenceNeeded: nonEmpty(insightItemSchema),
  }),
  launch: z.strictObject({
    goToMarketStrategy: recommendationItemSchema,
    launchMilestones: nonEmpty(milestoneItemSchema),
    channels: nonEmpty(insightItemSchema),
    launchRisks: nonEmpty(riskItemSchema),
    firstThirtyDays: nonEmpty(milestoneItemSchema),
  }),
  intelligence: z.strictObject({
    projectHealth: insightItemSchema,
    momentum: insightItemSchema,
    nextRecommendation: recommendationItemSchema,
    confidence: z.number().min(0).max(100),
    unresolvedQuestions: nonEmpty(requiredText),
  }),
});

export type ForgeWorkspaceAnalysis = z.infer<
  typeof forgeWorkspaceAnalysisSchema
>;

export function validateForgeWorkspaceAnalysis(
  input: unknown,
): ForgeWorkspaceAnalysis {
  return forgeWorkspaceAnalysisSchema.parse(input);
}

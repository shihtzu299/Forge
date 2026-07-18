import { forgeWorkspaceAnalysisSchema } from "../src/contracts/forge-ai.ts";
import { proptechWorkspaceAnalysis } from "../src/contracts/mocks/proptech-workspace-analysis.ts";
import type { ForgeWorkspaceAnalysis } from "../src/contracts/forge-ai.ts";

function assertAccepted(label: string, value: unknown) {
  const result = forgeWorkspaceAnalysisSchema.safeParse(value);

  if (!result.success) {
    throw new Error(`${label} should be accepted: ${result.error.message}`);
  }

  console.log(`PASS accepted: ${label}`);
}

function assertRejected(label: string, value: unknown) {
  const result = forgeWorkspaceAnalysisSchema.safeParse(value);

  if (result.success) {
    throw new Error(`${label} should be rejected`);
  }

  console.log(`PASS rejected: ${label}`);
}

assertAccepted("canonical proptech response", proptechWorkspaceAnalysis);

const missingSection = structuredClone(
  proptechWorkspaceAnalysis,
) as Partial<ForgeWorkspaceAnalysis>;
delete missingSection.discover;
assertRejected("missing required section", missingSection);

const unsupportedVersion = structuredClone(proptechWorkspaceAnalysis);
(unsupportedVersion as { contractVersion: number }).contractVersion = 2;
assertRejected("unsupported contract version", unsupportedVersion);

const excessiveConfidence = structuredClone(proptechWorkspaceAnalysis);
excessiveConfidence.intelligence.confidence = 101;
assertRejected("confidence above 100", excessiveConfidence);

const malformedId = structuredClone(proptechWorkspaceAnalysis);
malformedId.discover.painPoints[0].id = "Pain item one";
assertRejected("malformed structured item ID", malformedId);

const unknownTopLevelProperty = structuredClone(proptechWorkspaceAnalysis) as
  ForgeWorkspaceAnalysis | Record<string, unknown>;
(unknownTopLevelProperty as Record<string, unknown>).commentary =
  "Unstructured model prose";
assertRejected("unknown top-level property", unknownTopLevelProperty);

const emptyRequiredText = structuredClone(proptechWorkspaceAnalysis);
emptyRequiredText.project.title = "   ";
assertRejected("empty required text", emptyRequiredText);

const emptyRequiredArray = structuredClone(proptechWorkspaceAnalysis);
emptyRequiredArray.discover.opportunities = [];
assertRejected("empty required array", emptyRequiredArray);

const markdownInsteadOfStructuredText = structuredClone(
  proptechWorkspaceAnalysis,
);
markdownInsteadOfStructuredText.project.elevatorPitch =
  "## A free-form model response";
assertRejected(
  "markdown replacing structured text",
  markdownInsteadOfStructuredText,
);

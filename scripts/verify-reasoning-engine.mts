import {
  forgeSections,
  forgeWorkspaceAnalysisSchema,
} from "../src/contracts/forge-ai.ts";
import { proptechAnalysisRequest } from "../src/contracts/mocks/proptech-workspace-analysis.ts";
import { proptechWorkspaceAnalysis } from "../src/contracts/mocks/proptech-workspace-analysis.ts";
import { ForgeAnalysisOrchestrator } from "../src/lib/ai/analysis-orchestrator.ts";
import {
  ForgeAnalysisError,
  ProviderFailureError,
} from "../src/lib/ai/errors.ts";
import { GptAnalysisProvider } from "../src/lib/ai/providers/gpt-analysis-provider.ts";
import { MockAnalysisProvider } from "../src/lib/ai/providers/mock-analysis-provider.ts";
import type { AnalysisProvider } from "../src/lib/ai/providers/analysis-provider.ts";
import type { AnalysisInput } from "../src/lib/ai/types.ts";
import type { ProjectDNA } from "../src/types/project.ts";

const noDelay = async () => {};
const canonicalSnapshot = JSON.stringify(proptechWorkspaceAnalysis);
const proptechInput: AnalysisInput = {
  mode: "mock",
  projectDNA: proptechAnalysisRequest.projectDNA,
  requestedSections: [...forgeSections],
  generationMode: "initial",
};

function createOrchestrator(mockProvider: AnalysisProvider) {
  return new ForgeAnalysisOrchestrator({
    providers: {
      mock: mockProvider,
      gpt: new GptAnalysisProvider({ environment: {} }),
    },
    retryDelayMilliseconds: 0,
    delay: noDelay,
  });
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function assertErrorCode(
  label: string,
  expectedCode: ForgeAnalysisError["code"],
  operation: () => Promise<unknown>,
) {
  try {
    await operation();
  } catch (error) {
    assert(
      error instanceof ForgeAnalysisError,
      `${label} returned an untyped error`,
    );
    assert(
      error.code === expectedCode,
      `${label} returned ${error.code}, expected ${expectedCode}`,
    );
    console.log(`PASS rejected: ${label} (${expectedCode})`);
    return;
  }

  throw new Error(`${label} should have failed with ${expectedCode}`);
}

const mockOrchestrator = createOrchestrator(new MockAnalysisProvider());
const proptechResult = await mockOrchestrator.analyze(proptechInput);
assert(
  forgeWorkspaceAnalysisSchema.safeParse(proptechResult).success,
  "Proptech result must satisfy the response contract",
);
assert(
  proptechResult.project.title === proptechWorkspaceAnalysis.project.title,
  "Canonical proptech analysis should retain the fixture identity",
);
console.log("PASS accepted: canonical proptech mock analysis");

proptechResult.project.title = "Caller mutation";
assert(
  JSON.stringify(proptechWorkspaceAnalysis) === canonicalSnapshot,
  "Caller mutation must not change the canonical fixture",
);
console.log("PASS isolated: canonical fixture remains immutable to callers");

const nonProptechDNA: ProjectDNA = {
  idea: "Create an AI tool that helps students prepare for exams.",
  firstCustomer: "University students preparing for high-stakes final exams.",
  coreProblem:
    "Students struggle to turn scattered course material into a focused study plan.",
  desiredOutcome:
    "Students know what to study next and can measure their readiness before an exam.",
  biggestConstraint:
    "Limited access to consistent curriculum-aligned practice data.",
};
const adaptedResult = await mockOrchestrator.analyze({
  ...proptechInput,
  projectDNA: nonProptechDNA,
});
assert(
  forgeWorkspaceAnalysisSchema.safeParse(adaptedResult).success,
  "Adapted mock must satisfy the response contract",
);
assert(
  adaptedResult.project.targetCustomer === nonProptechDNA.firstCustomer,
  "Adapted mock must use the supplied customer",
);
assert(
  !JSON.stringify(adaptedResult)
    .toLocaleLowerCase()
    .includes("property agency"),
  "Adapted mock must not claim the project is a property agency product",
);
console.log("PASS accepted: contract-valid non-proptech adapted mock");

await assertErrorCode("empty requested sections", "INVALID_REQUEST", () =>
  mockOrchestrator.analyze({ ...proptechInput, requestedSections: [] }),
);

await assertErrorCode("incomplete Project DNA", "INVALID_REQUEST", () =>
  mockOrchestrator.analyze({
    ...proptechInput,
    projectDNA: { idea: "Incomplete project" } as ProjectDNA,
  }),
);

await assertErrorCode(
  "unsupported runtime mode",
  "UNSUPPORTED_ANALYSIS_MODE",
  () =>
    mockOrchestrator.analyze({
      ...proptechInput,
      mode: "unknown",
    } as unknown as AnalysisInput),
);

await assertErrorCode(
  "unconfigured GPT provider",
  "PROVIDER_NOT_CONFIGURED",
  () => mockOrchestrator.analyze({ ...proptechInput, mode: "gpt" }),
);

const missingModelProvider = new GptAnalysisProvider({
  environment: { OPENAI_API_KEY: "test-key", OPENAI_MODEL: undefined },
});
await assertErrorCode(
  "GPT provider without model",
  "PROVIDER_NOT_CONFIGURED",
  () =>
    new ForgeAnalysisOrchestrator({
      providers: { gpt: missingModelProvider },
    }).analyze({ ...proptechInput, mode: "gpt" }),
);

const missingKeyProvider = new GptAnalysisProvider({
  environment: { OPENAI_API_KEY: undefined, OPENAI_MODEL: "test-model" },
});
await assertErrorCode(
  "GPT provider without API key",
  "PROVIDER_NOT_CONFIGURED",
  () =>
    new ForgeAnalysisOrchestrator({
      providers: { gpt: missingKeyProvider },
    }).analyze({ ...proptechInput, mode: "gpt" }),
);

let malformedCalls = 0;
const malformedProvider: AnalysisProvider = {
  name: "malformed",
  async analyze() {
    malformedCalls += 1;
    return { unvalidated: "raw provider value" };
  },
};
await assertErrorCode(
  "malformed provider output",
  "INVALID_PROVIDER_RESPONSE",
  () => createOrchestrator(malformedProvider).analyze(proptechInput),
);
assert(malformedCalls === 1, "Schema-validation failures must not be retried");
console.log("PASS bounded: invalid provider response was not retried");

let transientCalls = 0;
const transientProvider: AnalysisProvider = {
  name: "transient",
  async analyze() {
    transientCalls += 1;

    if (transientCalls === 1) {
      throw new ProviderFailureError("Temporary provider interruption", {
        retryable: true,
      });
    }

    return structuredClone(proptechWorkspaceAnalysis);
  },
};
const recoveredResult =
  await createOrchestrator(transientProvider).analyze(proptechInput);
assert(
  transientCalls === 2,
  "Retryable failure must succeed on the second attempt",
);
assert(
  forgeWorkspaceAnalysisSchema.safeParse(recoveredResult).success,
  "Recovered result must still pass validation",
);
console.log("PASS recovered: transient provider succeeded after one retry");

let exhaustedCalls = 0;
const exhaustedProvider: AnalysisProvider = {
  name: "exhausted",
  async analyze() {
    exhaustedCalls += 1;
    throw new ProviderFailureError("Persistent transient failure", {
      retryable: true,
    });
  },
};
await assertErrorCode("retry exhaustion", "RETRY_EXHAUSTED", () =>
  createOrchestrator(exhaustedProvider).analyze(proptechInput),
);
assert(exhaustedCalls === 2, "Retry exhaustion must stop after two attempts");
console.log("PASS bounded: retry exhausted after one retry");

const safeFailure =
  await createOrchestrator(malformedProvider).safeAnalyze(proptechInput);
assert(
  !safeFailure.ok,
  "safeAnalyze must represent expected failure explicitly",
);
assert(
  safeFailure.error.code === "INVALID_PROVIDER_RESPONSE",
  "safeAnalyze must retain the typed validation error",
);
console.log("PASS contained: no raw unvalidated provider value escaped");

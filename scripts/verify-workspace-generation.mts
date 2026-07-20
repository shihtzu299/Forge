import { NextRequest } from "next/server.js";

import { forgeWorkspaceAnalysisSchema } from "../src/contracts/forge-ai.ts";
import { proptechAnalysisRequest } from "../src/contracts/mocks/proptech-workspace-analysis.ts";
import type { WorkspaceGenerationResponse } from "../src/contracts/workspace-generation.ts";
import { createWorkspaceAnalysisHandler } from "../src/lib/ai/workspace-analysis-handler.ts";
import {
  createGeneratedWorkspaceSnapshot,
  createProjectOverview,
  DEFAULT_ANALYSIS_MODE,
  EMPTY_GROUP_MESSAGE,
  getEmptyGroupMessage,
  visibleProviderOptions,
} from "../src/components/workspace/workspace-generation-config.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const persistenceEvents: string[] = [];
const POST = createWorkspaceAnalysisHandler({
  mockDelayMilliseconds: 0,
  store: {
    async saveDNA(projectId) {
      persistenceEvents.push(`dna:${projectId}`);
    },
    async saveAnalysis(projectId, _analysis, mode) {
      persistenceEvents.push(`analysis:${projectId}:${mode}`);
    },
  },
});

const projectId = "cm12345678901234567890";

async function post(
  body: unknown,
  options: { contentType?: string; origin?: string } = {},
) {
  const request = new NextRequest("http://localhost/api/workspace-analysis", {
    method: "POST",
    headers: {
      "Content-Type": options.contentType ?? "application/json",
      ...(options.origin ? { Origin: options.origin } : {}),
    },
    body: JSON.stringify(body),
  });

  const response = await POST(request);
  const payload = (await response.json()) as WorkspaceGenerationResponse;
  return { response, payload };
}

const validResult = await post({
  projectId,
  mode: "mock",
  projectDNA: proptechAnalysisRequest.projectDNA,
});
assert(validResult.response.status === 200, "Mock generation must return 200");
assert(validResult.payload.ok, "Mock generation must return success");
assert(
  forgeWorkspaceAnalysisSchema.safeParse(validResult.payload.analysis).success,
  "Route success must contain a contract-valid workspace",
);
console.log("PASS route: validated mock workspace generated");
assert(
  persistenceEvents.join(",") === `dna:${projectId},analysis:${projectId}:mock`,
  "Route must persist DNA before validated analysis and mode",
);
console.log("PASS persistence: DNA and validated analysis saved in order");

assert(DEFAULT_ANALYSIS_MODE === "mock", "Mock must remain the default mode");
console.log("PASS settings: Mock remains the default provider");

const gemini = visibleProviderOptions.find(
  (provider) => provider.id === "gemini",
);
const huggingFace = visibleProviderOptions.find(
  (provider) => provider.id === "hugging-face",
);
assert(gemini?.enabled === false, "Gemini must be disabled");
assert(
  gemini.description === "Coming soon",
  "Gemini must be labelled Coming soon",
);
assert(huggingFace?.enabled === false, "Hugging Face must be disabled");
assert(
  huggingFace.description === "Coming soon",
  "Hugging Face must be labelled Coming soon",
);
console.log("PASS settings: future providers are disabled and labelled");

const snapshot = createGeneratedWorkspaceSnapshot(
  validResult.payload.analysis,
  "mock",
);
assert(
  snapshot.mode === "mock",
  "Successful generation must preserve its mode",
);
assert(
  snapshot.analysis === validResult.payload.analysis,
  "Snapshot must preserve analysis",
);
console.log("PASS state: successful provider mode is preserved");

const overview = createProjectOverview(
  validResult.payload.analysis.project,
  snapshot.mode,
);
assert(
  overview.title === validResult.payload.analysis.project.title,
  "Overview title must map directly",
);
assert(
  overview.elevatorPitch ===
    validResult.payload.analysis.project.elevatorPitch &&
    overview.problemStatement ===
      validResult.payload.analysis.project.problemStatement &&
    overview.targetCustomer ===
      validResult.payload.analysis.project.targetCustomer &&
    overview.valueProposition ===
      validResult.payload.analysis.project.valueProposition,
  "Overview fields must map directly from analysis.project",
);
assert(
  overview.provider === "Mock",
  "Overview must show the successful provider",
);
console.log("PASS overview: project fields and provider map directly");

assert(
  getEmptyGroupMessage([]) === EMPTY_GROUP_MESSAGE,
  "Empty workspace groups must return the defensive fallback",
);
assert(
  getEmptyGroupMessage(["item"]) === null,
  "Populated groups must not show fallback",
);
console.log("PASS rendering: empty groups receive a defensive fallback");

const invalidMode = await post({
  projectId,
  mode: "unsupported",
  projectDNA: proptechAnalysisRequest.projectDNA,
});
assert(invalidMode.response.status === 400, "Invalid mode must return 400");
assert(!invalidMode.payload.ok, "Invalid mode must return a safe error");
assert(
  !("diagnosticMessage" in invalidMode.payload.error),
  "Serialized errors must not expose diagnostics",
);
for (const forbiddenKey of [
  "stack",
  "cause",
  "prompt",
  "model",
  "environment",
  "credentials",
]) {
  assert(
    !(forbiddenKey in invalidMode.payload.error),
    `Serialized errors must not expose ${forbiddenKey}`,
  );
}
console.log("PASS boundary: invalid mode rejected safely");

const crossOrigin = await post(
  { projectId, mode: "mock", projectDNA: proptechAnalysisRequest.projectDNA },
  { origin: "https://attacker.example" },
);
assert(
  crossOrigin.response.status === 403,
  "Cross-origin request must return 403",
);
console.log("PASS security: cross-origin request rejected");

const wrongContentType = await post(
  { projectId, mode: "mock", projectDNA: proptechAnalysisRequest.projectDNA },
  { contentType: "text/plain" },
);
assert(
  wrongContentType.response.status === 415,
  "Wrong content type must return 415",
);
console.log("PASS security: non-JSON request rejected");

console.log(
  "Workspace generation verification passed without a paid API call.",
);

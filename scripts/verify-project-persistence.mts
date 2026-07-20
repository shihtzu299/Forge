import { projectIdSchema } from "../src/contracts/project-persistence.ts";
import {
  proptechAnalysisRequest,
  proptechWorkspaceAnalysis,
} from "../src/contracts/mocks/proptech-workspace-analysis.ts";
import { parseStoredProject } from "../src/lib/projects/project-storage.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const projectId = "cm12345678901234567890";
assert(
  projectIdSchema.safeParse(projectId).success,
  "Stable project ID must validate",
);
assert(
  `/projects/${projectId}` === `/projects/${projectId}`,
  "Stable project URL must be deterministic",
);
console.log("PASS URL: stable project identifier maps deterministically");

const validProject = parseStoredProject({
  id: projectId,
  name: proptechWorkspaceAnalysis.project.title,
  idea: proptechAnalysisRequest.projectDNA.idea,
  projectDNA: structuredClone(proptechAnalysisRequest.projectDNA),
  analysis: structuredClone(proptechWorkspaceAnalysis),
  analysisMode: "mock",
});
assert(validProject.projectDNA !== null, "Valid stored Project DNA must load");
assert(validProject.analysis !== null, "Valid stored analysis must load");
assert(validProject.analysisMode === "mock", "Valid stored mode must load");
assert(validProject.loadWarning === null, "Valid stored JSON must not warn");
console.log("PASS load: valid stored JSON is parsed before rendering");

const corruptAnalysis = parseStoredProject({
  id: projectId,
  name: "Stored project",
  idea: proptechAnalysisRequest.projectDNA.idea,
  projectDNA: structuredClone(proptechAnalysisRequest.projectDNA),
  analysis: { unvalidated: "workspace" },
  analysisMode: "mock",
});
assert(
  corruptAnalysis.analysis === null,
  "Invalid stored analysis must be discarded",
);
assert(
  Boolean(corruptAnalysis.loadWarning),
  "Invalid stored analysis must produce a safe warning",
);
assert(
  !JSON.stringify(corruptAnalysis).includes("unvalidated"),
  "Invalid stored payload must not escape to rendering state",
);
console.log("PASS boundary: malformed stored analysis cannot render");

const missingMode = parseStoredProject({
  id: projectId,
  name: "Stored project",
  idea: proptechAnalysisRequest.projectDNA.idea,
  projectDNA: structuredClone(proptechAnalysisRequest.projectDNA),
  analysis: structuredClone(proptechWorkspaceAnalysis),
  analysisMode: null,
});
assert(
  missingMode.analysis === null,
  "Analysis without a valid mode must not render",
);
console.log("PASS boundary: incomplete stored analysis metadata is rejected");

console.log(
  "Project persistence verification passed without database or provider access.",
);

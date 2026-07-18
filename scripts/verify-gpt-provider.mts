import { forgeSections } from "../src/contracts/forge-ai.ts";
import { proptechAnalysisRequest } from "../src/contracts/mocks/proptech-workspace-analysis.ts";
import { ForgeAnalysisOrchestrator } from "../src/lib/ai/analysis-orchestrator.ts";
import { GptAnalysisProvider } from "../src/lib/ai/providers/gpt-analysis-provider.ts";

if (process.env.RUN_REAL_GPT_TEST !== "true") {
  console.log(
    "SKIP: set RUN_REAL_GPT_TEST=true to explicitly authorize a real OpenAI API call.",
  );
  process.exit(0);
}

try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if (!isMissingFileError(error)) throw error;
}

const startedAt = performance.now();
const orchestrator = new ForgeAnalysisOrchestrator({
  providers: { gpt: new GptAnalysisProvider() },
});
const analysis = await orchestrator.analyze({
  mode: "gpt",
  projectDNA: proptechAnalysisRequest.projectDNA,
  requestedSections: [...forgeSections],
  generationMode: "initial",
});

console.log("GPT provider verification passed", {
  projectTitle: analysis.project.title,
  confidence: analysis.intelligence.confidence,
  sectionItemCounts: {
    discover: countArrays(analysis.discover),
    decide: countArrays(analysis.decide),
    design: countArrays(analysis.design),
    build: countArrays(analysis.build),
    validate: countArrays(analysis.validate),
    launch: countArrays(analysis.launch),
  },
  elapsedMilliseconds: Math.round(performance.now() - startedAt),
  contractValidation: "passed",
});

function countArrays(value: object) {
  return Object.values(value).reduce(
    (total, item) => total + (Array.isArray(item) ? item.length : 1),
    0,
  );
}

function isMissingFileError(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

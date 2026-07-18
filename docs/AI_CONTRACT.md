# Forge AI Contract

## Purpose

The Forge AI Contract is the versioned boundary between completed Project DNA,
GPT-5.6, and the workspace UI. It prevents model output from becoming an
unbounded prose response. Every generated value must fit a known structure,
pass runtime validation, and map to a specific product surface before Forge can
render it.

The TypeScript and runtime definitions live in
`src/contracts/forge-ai.ts`. The current contract version is `1`.

## Request Structure

`ForgeAnalysisRequest` contains four fields:

| Field               | Contract                                    |
| ------------------- | ------------------------------------------- |
| `projectDNA`        | The complete, unchanged `ProjectDNA` object |
| `requestedSections` | One or more unique workspace section names  |
| `generationMode`    | The literal value `initial`                 |
| `contractVersion`   | The literal value `1`                       |

Supported section names are `discover`, `decide`, `design`, `build`,
`validate`, and `launch`. Version 1 accepts only initial generation. New modes
must be introduced deliberately through a compatible contract change.

## Response Structure

`ForgeWorkspaceAnalysis` requires these top-level fields and rejects unknown
top-level properties:

| Field             | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| `contractVersion` | Identifies the exact response contract                         |
| `project`         | Workspace title, pitch, problem, customer, and value summary   |
| `discover`        | Customer, problem, market, competitor, and opportunity context |
| `decide`          | Assumptions, risks, tradeoffs, positioning, and models         |
| `design`          | Personas, MVP scope, journey, and experience principles        |
| `build`           | Architecture, systems, data, APIs, milestones, and risks       |
| `validate`        | Questions, experiments, metrics, and required evidence         |
| `launch`          | Go-to-market, milestones, channels, risks, and first 30 days   |
| `intelligence`    | Health, momentum, recommendation, confidence, and unknowns     |

All nested objects are strict and all required collections must contain at
least one item.

## Structured Item Types

Forge uses a small set of concrete shapes rather than representing every field
as a string:

- `InsightItem` records a title, summary, detail, and evidence status of
  `assumption`, `signal`, or `validated`.
- `RiskItem` records severity and a mitigation.
- `FeatureItem` records product scope, priority, and rationale.
- `MilestoneItem` records a sequenced outcome.
- `MetricItem` records a definition and target.
- `ArchitectureItem` records a technical decision and rationale.
- `RecommendationItem` records a recommendation, rationale, and next action.

These types are intentionally specific. Forge does not use a recursive generic
content schema because each workspace surface needs predictable data.

## Structured ID Convention

Every structured item has a stable model-generated ID. IDs must:

- begin with a lowercase letter;
- use lowercase letters, numbers, and kebab-case segments only;
- end with a hyphen and positive-style numeric sequence;
- describe the item category where practical.

Valid examples include `pain-1`, `market-signal-2`, `risk-1`, `feature-3`, and
`launch-milestone-1`. Values such as `Pain 1`, `risk`, and `feature_one` are
invalid. IDs allow future UI state, citations, edits, and regeneration to refer
to a stable item without depending on array position.

## Validation Rules

Zod performs runtime validation at the model boundary. The validator rejects:

- missing required sections or fields;
- unsupported contract versions or generation modes;
- unknown properties in strict objects;
- empty or whitespace-only required text;
- Markdown syntax in structured text;
- empty required arrays;
- duplicate requested sections;
- malformed structured IDs;
- invalid enums, priorities, severities, or evidence states;
- non-positive milestone sequence numbers;
- confidence below `0` or above `100`.

TypeScript types alone are insufficient because model output enters the system
as unknown runtime data. `validateForgeWorkspaceAnalysis` must succeed before
the response is stored, rendered, or used by another generation step.

## Workspace Mapping

### Project Header and Summary

`project` supplies the permanent workspace identity and summary. `title` maps
to the top bar. The remaining fields map to the Project Summary surface and
high-level project context.

### Discover

| Response field       | Workspace surface                   |
| -------------------- | ----------------------------------- |
| `customerSegments`   | Customer segments                   |
| `painPoints`         | Customer pains                      |
| `marketSignals`      | Market signals                      |
| `competitorPatterns` | Competitor and alternative patterns |
| `opportunities`      | Opportunity areas                   |

### Decide

| Response field           | Workspace surface              |
| ------------------------ | ------------------------------ |
| `assumptions`            | Assumption register            |
| `risks`                  | Strategic risk register        |
| `tradeoffs`              | Decision tradeoffs             |
| `recommendedPositioning` | Recommended strategic position |
| `businessModelOptions`   | Business model options         |

### Design

| Response field         | Workspace surface             |
| ---------------------- | ----------------------------- |
| `personas`             | Initial personas              |
| `mvpFeatures`          | Prioritized MVP scope         |
| `userJourney`          | Sequenced user journey        |
| `experiencePrinciples` | Product experience principles |

### Build

| Response field             | Workspace surface       |
| -------------------------- | ----------------------- |
| `architectureSummary`      | Architecture overview   |
| `systemComponents`         | System component map    |
| `dataEntities`             | Data model candidates   |
| `apiCapabilities`          | API capability map      |
| `implementationMilestones` | Delivery sequence       |
| `technicalRisks`           | Technical risk register |

### Validate

| Response field      | Workspace surface    |
| ------------------- | -------------------- |
| `criticalQuestions` | Validation questions |
| `experiments`       | Experiment backlog   |
| `successMetrics`    | Success measures     |
| `evidenceNeeded`    | Evidence backlog     |

### Launch

| Response field       | Workspace surface                 |
| -------------------- | --------------------------------- |
| `goToMarketStrategy` | Recommended go-to-market strategy |
| `launchMilestones`   | Launch sequence                   |
| `channels`           | Acquisition and distribution      |
| `launchRisks`        | Launch risk register              |
| `firstThirtyDays`    | First 30-day operating plan       |

### Intelligence Panel

`intelligence.projectHealth`, `intelligence.momentum`, and
`intelligence.nextRecommendation` map directly to the three permanent panel
cards. `confidence` supports a restrained confidence signal. Unresolved
questions remain a structured backlog and must not be hidden by a confident
summary.

## Error Handling Principles

Model output is untrusted until validation succeeds. A future API route must:

1. parse the model response as unknown data;
2. validate it against the requested contract version;
3. return a typed success only when the complete schema passes;
4. log validation diagnostics without exposing prompts, secrets, or sensitive
   Project DNA;
5. return a controlled product error when validation fails;
6. never partially render an invalid response;
7. optionally retry with validation feedback under a bounded retry policy.

Forge does not render arbitrary model prose because prose has no stable mapping
to navigation, editing, state, validation, or future regeneration. Markdown and
unsupported keys are rejected rather than interpreted.

## Contract Versioning

Version `1` is represented as a literal in both request and response. A response
with any other version is invalid. Breaking field or meaning changes require a
new contract version and an explicit migration or adapter. Additive changes are
not automatically safe because all objects reject unknown keys.

The canonical fixture in
`src/contracts/mocks/proptech-workspace-analysis.ts` proves that a complete,
realistic workspace can satisfy version 1. The executable verification script
also proves required invalid cases are rejected.

## Future Assumption Changes

Future workflows will reference stable item IDs and submit updated Project DNA,
changed assumptions, or evidence through an explicitly versioned request mode.
The response will still use the same section shapes and pass the same runtime
boundary before replacing workspace state. Version 1 exposes only `initial`, so
assumption-regeneration behavior cannot be added implicitly.

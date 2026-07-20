# Workspace Generation

## Purpose

Workspace Generation turns completed Project DNA into a validated, navigable
Forge workspace. The milestone connects the existing Generate Workspace action
to the reasoning engine while preserving the permanent application shell and
keeping active interaction state in memory while persisting projects and
validated generation results in PostgreSQL.

## Request Flow

1. The Project DNA Builder collects all five required Project DNA values.
2. Developer Settings presents Mock, GPT-5.6, Gemini, and Hugging Face. Mock is
   the default; only Mock and GPT-5.6 are currently enabled.
3. Generate Workspace submits `{ projectId, mode, projectDNA }` to
   `POST /api/workspace-analysis`.
4. The Route Handler validates origin, content type, body size, mode, and
   Project DNA before invoking the reasoning orchestrator.
5. The orchestrator builds the versioned request, selects the provider,
   performs its bounded retry policy, and validates the complete response.
6. The Route Handler returns either a validated analysis or a small serialized
   error.
7. The client validates the success payload again before storing or rendering
   it.

No partially valid provider response is rendered.

## Why a Route Handler

Workspace analysis is an explicit JSON operation with meaningful HTTP status
codes and retry behavior. A Route Handler provides a durable boundary that is
independent of React form execution and leaves clear insertion points for
authentication, authorization, rate limiting, request tracing, and persistence.
A Server Action would be appropriate for a tightly coupled form mutation, but
would make this provider-neutral API contract less visible and reusable.

## Server Security Boundary

The Route Handler runs on the Node.js runtime. It:

- accepts only same-origin browser requests;
- requires `application/json`;
- rejects declared bodies larger than 64 KiB;
- uses a strict Zod request schema;
- supplies all six supported sections server-side;
- constructs providers only on the server;
- reads GPT credentials and model configuration only through the GPT provider;
- sets `Cache-Control: no-store` on every response;
- logs only stable error code and retryability;
- never returns diagnostics, causes, prompts, raw provider output, environment
  values, or credentials.

The current origin check is defense in depth. Production authentication and
authorization remain required before multi-user deployment.

## State Management

`WorkspaceGeneration` owns a small discriminated state machine:

- `idle`: Project DNA can be completed and settings changed;
- `generating`: submission is locked and progress is visible;
- `success`: validated analysis and the provider mode used are held in memory
  and rendered;
- `error`: a safe message, provider context, and retry Project DNA are held in
  memory.

It also owns the selected provider mode, active workspace section, Project DNA
progress, and visual progress step. React local state remains sufficient for
active interaction because the state has one owner. Durable fields are stored
server-side instead. Refreshing the stable project URL reloads and validates
the stored workspace.

## Developer Settings

Developer Settings is a compact accessible gear disclosure. It presents Mock,
GPT-5.6, Gemini, and Hugging Face. Mock and GPT-5.6 are selectable; Gemini and
Hugging Face are disabled and labelled `Coming soon`. It defaults to Mock, is
disabled during generation, and makes clear that selection is session-only. It
never requests, displays, or stores an API key or model string in the browser.
Selecting GPT alone does not make a request; generation begins only after the
user presses Generate Workspace.

## Progress and Retry

The generation experience shows eight restrained stages while one orchestrator
request is in flight: understanding Project DNA; discovering customers and
opportunities; evaluating assumptions and risks; designing the product
experience; planning the technical build; defining validation experiments;
preparing the launch strategy; and finalizing project intelligence. These are
presentation stages, not eight API calls, and a completed response is rendered
immediately. Reduced-motion support remains active.

Transient server failures are retried at most once by the reasoning
orchestrator. If a retryable failure still reaches the client, the error surface
offers an explicit Retry generation action using the same in-memory Project
DNA. The error surface identifies the safe provider label, retains access to
Developer Settings, and offers Edit Project DNA. Non-retryable failures show a
safe message without a misleading retry. Internal diagnostics remain excluded.

## Workspace Rendering

After success, the setup surfaces are replaced by
`WorkspaceSectionRenderer`. The left navigation selects Discover, Decide,
Design, Build, Validate, or Launch. A typed switch maps each contract field to
a named group, and a shared structured-item card renders only known contract
fields. The renderer never interprets Markdown or arbitrary provider HTML.

The project title from validated analysis replaces the locally derived title.
A compact overview maps title, elevator pitch, problem statement, target
customer, and value proposition directly from `analysis.project`. It also shows
the successful provider mode preserved in memory.

Although contract validation requires non-empty groups, every rendered group
includes the defensive fallback `No items were generated for this group.` This
does not weaken or bypass contract validation.

## Intelligence Panel

Validated `projectHealth`, `momentum`, and `nextRecommendation` values populate
the permanent cards. Confidence is shown as a restrained percentage and bar.
Unresolved questions remain visible below the cards so uncertainty is not
hidden by the summary.

Before and during generation, the panel shows deterministic lifecycle content
rather than fabricated analysis.

## Verification

Run:

```sh
npm run verify:workspace-generation
```

The focused script invokes the Route Handler directly in Mock mode and verifies
a contract-valid success, safe invalid-mode serialization, same-origin
protection, and JSON content-type enforcement. It never selects GPT and cannot
make a paid provider request.

Normal formatting, lint, TypeScript, contract, reasoning-engine, and production
build checks remain network-free except for the existing build-time Google font
download.

## Milestone Boundary

Project persistence is documented in `docs/PROJECT_PERSISTENCE.md`. This
workflow still adds no authentication, streaming, or automatic real-provider
test. GPT mode remains available only through the secure server boundary.

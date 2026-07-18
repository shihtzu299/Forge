# Forge AI Workflow

## Roles

GPT-5.6 is Forge's reasoning engine. It will transform completed Project DNA
into structured workspace analysis across Discover, Decide, Design, Build,
Validate, Launch, and Intelligence.

Codex defines, implements, and tests the boundary around that reasoning. Its
role includes maintaining the contract, fixtures, validation behavior, system
prompt specification, and future API integration. Codex does not substitute
unvalidated model prose for application state.

## Strict Contract Flow

1. The user completes a typed `ProjectDNA` object.
2. Forge constructs a versioned `ForgeAnalysisRequest`.
3. The future server integration sends the request and system specification to
   GPT-5.6.
4. GPT-5.6 returns only the required structured JSON response.
5. Forge treats the response as unknown data.
6. Zod validates the complete response before any storage or rendering.
7. A valid `ForgeWorkspaceAnalysis` maps deterministically into the six
   workspace areas and Intelligence panel.
8. An invalid response produces a controlled failure and is never partially
   rendered.

The authoritative contract and UI mapping are documented in
`docs/AI_CONTRACT.md`.

## Reasoning Rules

GPT-5.6 must reason from Project DNA, separate assumptions from evidence, make
uncertainty visible, avoid claims of verified current market knowledge, and
preserve consistency across all sections. Output must be concise and ready for
known UI surfaces. Markdown, code fences, unsupported keys, and prose outside
the contract are invalid.

## Validation Before Rendering

TypeScript protects Forge's own code but cannot validate external JSON at
runtime. The shared Zod schema enforces contract version, strict object keys,
required text and arrays, structured IDs, enumerated states, numeric bounds,
and the absence of Markdown. Only parsed output is allowed to become workspace
state.

## Current Milestone Boundary

This milestone defines and verifies the contract only. It does not call the
OpenAI API, use an API key, persist data, add an API route, or populate the
current workspace UI. The future API milestone will consume the existing
request type, system-prompt specification, runtime validator, and canonical
fixture rather than inventing a parallel response shape.

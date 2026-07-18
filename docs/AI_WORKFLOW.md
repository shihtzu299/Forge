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
2. The request builder constructs and validates a versioned
   `ForgeAnalysisRequest`.
3. The reasoning orchestrator selects an injected analysis provider.
4. Mock mode returns deterministic contract fixtures. GPT mode sends the
   request and system specification to the configured GPT-5.6 Responses API
   model and requests Zod-backed structured output.
5. Every provider returns `unknown`; no provider response is trusted.
6. The orchestrator validates the complete response with Zod before returning.
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

## Provider Boundary and Orchestrator

Analysis providers implement one framework-independent asynchronous interface.
The mock and GPT implementations share this boundary, but neither can return a
trusted workspace type directly. The orchestrator owns request
building, provider selection, response validation, typed error mapping, and the
bounded retry policy.

Providers and retry timing are dependency-injected. This keeps verification
deterministic and avoids global mutable clients.

## Analysis Modes

`mock` mode supports local and CI verification without network access. It uses
the canonical proptech fixture only for matching Project DNA and creates a
neutral contract-valid adaptation for other projects.

`gpt` mode uses the official OpenAI SDK and Responses API. It requires explicit
`OPENAI_API_KEY` and `OPENAI_MODEL` server environment values and fails with
`PROVIDER_NOT_CONFIGURED` before network access when either is absent. The SDK
uses the shared Zod contract for structured parsing; the orchestrator still
performs authoritative validation.

## Retry Principles

The engine makes at most one retry. Only provider failures explicitly marked
retryable are retried. Invalid requests, unsupported modes, unconfigured
providers, schema failures, and unclassified errors fail immediately. Retry
timing is injectable so direct verification does not wait.

## Server Responsibility

The reasoning engine lives under `src/lib/ai` and is server-side application
code. Client components must not import it. It contains no React, Next.js route,
browser, database, or embedded secret concerns. Only the GPT provider owns
network access. A future API route will call the orchestrator as a thin server
adapter.

Detailed architecture and error codes are documented in
`docs/REASONING_ENGINE.md`.

## Current Milestone Boundary

The reasoning pipeline, deterministic mock mode, and opt-in GPT provider are
implemented. Normal verification remains network-free, and no paid call is
made without `RUN_REAL_GPT_TEST=true`. This milestone does not persist data,
add an API route, or populate the current workspace UI. The future API
milestone will compose the existing orchestrator with the GPT provider rather
than placing reasoning logic inside a route. Operational details are in
`docs/GPT_PROVIDER.md`.

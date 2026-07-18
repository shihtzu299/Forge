# Forge Reasoning Engine

## Purpose

The Forge Reasoning Engine is the framework-independent server-side pipeline
between completed Project DNA and a validated Forge workspace analysis. It can
run with deterministic mock data today and accept a real GPT-5.6 provider later
without changing the contract, UI, or orchestration rules.

The engine must run on the server. Client components must never import modules
from `src/lib/ai`. The current implementation intentionally avoids browser,
React, Next.js, API route, database, environment-variable, and network APIs.

## Architecture

| Module                                | Responsibility                                      |
| ------------------------------------- | --------------------------------------------------- |
| `types.ts`                            | Analysis modes, inputs, results, and delay contract |
| `errors.ts`                           | Stable typed errors and safe user messages          |
| `request-builder.ts`                  | Versioned request construction and validation       |
| `providers/analysis-provider.ts`      | Untrusted provider boundary                         |
| `providers/mock-analysis-provider.ts` | Deterministic canonical or adapted analysis         |
| `providers/gpt-analysis-provider.ts`  | Explicit unconfigured future integration point      |
| `analysis-orchestrator.ts`            | Selection, retry, response validation, and results  |

The existing AI contract and system prompt remain the single sources of truth.
The engine does not duplicate their response schema or prompt instructions.

## Execution Flow

1. A server caller supplies analysis mode, completed Project DNA, requested
   sections, and generation mode.
2. The request builder adds contract version `1` and validates the complete
   request with `forgeAnalysisRequestSchema`.
3. The orchestrator selects an injected provider for `mock` or `gpt` mode.
4. The provider receives a typed `ForgeAnalysisRequest` and returns `unknown`.
5. The orchestrator validates the unknown value with
   `forgeWorkspaceAnalysisSchema`.
6. Only a validated `ForgeWorkspaceAnalysis` is returned.
7. Expected callers may use `safeAnalyze` for a discriminated success/failure
   result; `analyze` throws typed errors.

No provider can bypass the response validation boundary.

## Analysis Modes

### Mock

Mock mode is asynchronous and accepts an optional delay. When Project DNA
exactly matches the canonical proptech fixture, the provider returns a fresh
clone of that fixture.

For other Project DNA, the provider creates a transparent neutral adaptation:

- project identity comes from the supplied DNA;
- structured insights are marked as assumptions;
- risks reference the supplied constraint;
- capabilities reference the desired outcome;
- recommendations request direct customer evidence;
- confidence is reduced;
- real-estate-specific prose is removed from structured items.

The adapted response is validated inside the mock provider and again by the
orchestrator. Every call returns a fresh clone so callers cannot mutate the
canonical source fixture.

### GPT

GPT mode currently implements the same provider interface but always throws
`PROVIDER_NOT_CONFIGURED`. It contains no SDK, API call, secret lookup, or fake
response.

The future integration will replace the placeholder body with a server-side
GPT-5.6 call using `FORGE_SYSTEM_PROMPT`, serialize the validated request, and
return the parsed model value as `unknown`. The orchestrator will continue to
own validation and retries.

## Provider Interface

An analysis provider has a stable name and one method:

```ts
interface AnalysisProvider {
  readonly name: string;
  analyze(request: ForgeAnalysisRequest): Promise<unknown>;
}
```

Returning `unknown` is deliberate. TypeScript cannot make an external provider
trustworthy, so only runtime parsing can promote its response into workspace
state.

## Dependency Injection

`ForgeAnalysisOrchestrator` receives a provider map through its constructor. It
also accepts retry delay duration and a delay function. Tests inject in-memory
providers and a zero-delay function; future server composition can inject the
configured GPT provider. There is no global mutable provider singleton.

`createDefaultAnalysisProviders` is a convenience factory, not global state.

## Error Codes

| Code                        | Meaning                                         |
| --------------------------- | ----------------------------------------------- |
| `INVALID_REQUEST`           | Project DNA or request fields failed validation |
| `PROVIDER_NOT_CONFIGURED`   | The selected provider is unavailable            |
| `PROVIDER_FAILURE`          | A provider operation failed                     |
| `INVALID_PROVIDER_RESPONSE` | Provider output failed the response schema      |
| `UNSUPPORTED_ANALYSIS_MODE` | The runtime mode is not `mock` or `gpt`         |
| `RETRY_EXHAUSTED`           | A retryable provider failed twice               |

Each `ForgeAnalysisError` has a stable code, safe user-facing message, internal
diagnostic message, retryability flag, and optional cause. User-facing messages
never contain raw provider payloads, prompts, credentials, or Project DNA.

## Retry Policy

The engine permits at most one retry after the initial provider attempt.
Retries occur only when a `ForgeAnalysisError` explicitly declares itself
retryable.

The engine never retries:

- invalid requests;
- unsupported modes;
- an unconfigured provider;
- schema-validation failures;
- unknown errors that have not been classified as transient.

After a second retryable failure, the engine throws `RETRY_EXHAUSTED`. No
third-party retry package is used.

## Validation Boundary

Request and response validation reuse the schemas in
`src/contracts/forge-ai.ts`. Provider output remains `unknown` until the full
strict response schema succeeds. Partial, malformed, free-form, or extra-key
responses never escape through `analyze` or `safeAnalyze`.

## Framework Independence

The reasoning engine has no React component lifecycle, HTTP request/response
type, route handler, browser API, or network dependency. This lets the direct
Node verification script exercise the same production modules that a future
API route will call. The API route will be a thin server adapter around the
orchestrator rather than the owner of reasoning behavior.

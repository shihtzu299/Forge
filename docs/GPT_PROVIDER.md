# GPT-5.6 Provider

## Purpose

The GPT provider is Forge's production analysis adapter. It sends a validated
`ForgeAnalysisRequest` to the OpenAI Responses API and returns structured data
to the reasoning orchestrator. The provider does not bypass the orchestrator or
write directly to application state.

## SDK and API

Forge pins the official `openai` JavaScript SDK. The provider uses
`responses.parse` with `zodTextFormat` and the existing
`forgeWorkspaceAnalysisSchema`. This keeps the Zod contract as the single
source of truth and avoids maintaining a second hand-written JSON Schema.

The SDK parses structured output first. The orchestrator then validates the
returned value again at Forge's authoritative trust boundary.

## Runtime Configuration

The provider reads these server-only environment variables:

- `OPENAI_API_KEY`: an OpenAI API key.
- `OPENAI_MODEL`: the explicit Responses API model ID.

Neither setting has a code fallback. Missing or blank values fail with
`PROVIDER_NOT_CONFIGURED` before a network client is created. For this
milestone, set `OPENAI_MODEL=gpt-5.6-sol` in `.env.local`.

Request behavior is centralized in `src/lib/ai/config.ts`:

- reasoning effort: `medium`
- maximum output tokens: `16000`
- timeout: `120000` milliseconds
- SDK retries: disabled

The output allowance accommodates the complete Forge workspace contract while
the medium reasoning setting remains deliberate and cost-conscious. The
orchestrator owns Forge's single retry, preventing nested retry loops.

## Local Verification

Normal formatting, lint, type, build, contract, and reasoning-engine checks do
not use the network. The real-provider script exits successfully without a
request unless the operator explicitly opts in:

```sh
RUN_REAL_GPT_TEST=true npm run verify:gpt-provider
```

On PowerShell:

```powershell
$env:RUN_REAL_GPT_TEST = "true"
npm run verify:gpt-provider
```

The script loads `.env.local`, analyzes the canonical proptech Project DNA in
GPT mode through the orchestrator, and prints only project title, confidence,
section item counts, elapsed time, and contract-validation status. It never
prints the API key, Project DNA, prompt, or raw response.

## Failure Policy

Authentication and model refusal failures are non-retryable. Rate limits,
timeouts, connection failures, and server-side OpenAI failures are transient
and may receive the orchestrator's one retry. Other API errors, incomplete
responses, content filtering, output-limit exhaustion, and malformed output
fail safely without retry.

Logs contain only the model ID, elapsed time, stable Forge error code,
retryability, provider status, and request ID when available. Prompts, request
content, raw responses, and secrets are excluded.

## Scope Boundary

This integration is server-side infrastructure only. It adds no route, user
interface behavior, database access, streaming, or secret to source control.

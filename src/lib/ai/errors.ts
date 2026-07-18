export type ForgeAnalysisErrorCode =
  | "INVALID_REQUEST"
  | "PROVIDER_NOT_CONFIGURED"
  | "PROVIDER_FAILURE"
  | "INVALID_PROVIDER_RESPONSE"
  | "UNSUPPORTED_ANALYSIS_MODE"
  | "RETRY_EXHAUSTED";

type ForgeAnalysisErrorOptions = {
  code: ForgeAnalysisErrorCode;
  userMessage: string;
  diagnosticMessage: string;
  retryable?: boolean;
  cause?: unknown;
};

export class ForgeAnalysisError extends Error {
  readonly code: ForgeAnalysisErrorCode;
  readonly userMessage: string;
  readonly retryable: boolean;

  constructor({
    code,
    userMessage,
    diagnosticMessage,
    retryable = false,
    cause,
  }: ForgeAnalysisErrorOptions) {
    super(diagnosticMessage, { cause });
    this.name = "ForgeAnalysisError";
    this.code = code;
    this.userMessage = userMessage;
    this.retryable = retryable;
  }
}

export class InvalidAnalysisRequestError extends ForgeAnalysisError {
  constructor(diagnosticMessage: string, cause?: unknown) {
    super({
      code: "INVALID_REQUEST",
      userMessage: "The project information is incomplete or invalid.",
      diagnosticMessage,
      cause,
    });
    this.name = "InvalidAnalysisRequestError";
  }
}

export class ProviderNotConfiguredError extends ForgeAnalysisError {
  constructor(providerName: string) {
    super({
      code: "PROVIDER_NOT_CONFIGURED",
      userMessage: "The requested analysis provider is not available.",
      diagnosticMessage: `${providerName} is not configured`,
    });
    this.name = "ProviderNotConfiguredError";
  }
}

export class ProviderFailureError extends ForgeAnalysisError {
  constructor(
    diagnosticMessage: string,
    options: { retryable: boolean; cause?: unknown },
  ) {
    super({
      code: "PROVIDER_FAILURE",
      userMessage: "Forge could not complete the analysis.",
      diagnosticMessage,
      retryable: options.retryable,
      cause: options.cause,
    });
    this.name = "ProviderFailureError";
  }
}

export class InvalidProviderResponseError extends ForgeAnalysisError {
  constructor(diagnosticMessage: string, cause?: unknown) {
    super({
      code: "INVALID_PROVIDER_RESPONSE",
      userMessage: "Forge received an invalid analysis response.",
      diagnosticMessage,
      cause,
    });
    this.name = "InvalidProviderResponseError";
  }
}

export class UnsupportedAnalysisModeError extends ForgeAnalysisError {
  constructor(mode: unknown) {
    super({
      code: "UNSUPPORTED_ANALYSIS_MODE",
      userMessage: "The requested analysis mode is not supported.",
      diagnosticMessage: `Unsupported analysis mode: ${String(mode)}`,
    });
    this.name = "UnsupportedAnalysisModeError";
  }
}

export class RetryExhaustedError extends ForgeAnalysisError {
  constructor(cause: ForgeAnalysisError) {
    super({
      code: "RETRY_EXHAUSTED",
      userMessage: "Forge could not complete the analysis after retrying.",
      diagnosticMessage: "The analysis provider failed after one retry",
      cause,
    });
    this.name = "RetryExhaustedError";
  }
}

export function toForgeAnalysisError(error: unknown) {
  if (error instanceof ForgeAnalysisError) return error;

  return new ProviderFailureError(
    "The analysis provider threw an unknown error",
    {
      retryable: false,
      cause: error,
    },
  );
}

import { NextResponse, type NextRequest } from "next/server.js";

import {
  forgeSections,
  type ForgeWorkspaceAnalysis,
} from "../../contracts/forge-ai.ts";
import {
  workspaceGenerationRequestSchema,
  type WorkspaceGenerationResponse,
} from "../../contracts/workspace-generation.ts";
import type { ProjectDNA } from "../../types/project.ts";
import {
  createDefaultAnalysisProviders,
  ForgeAnalysisOrchestrator,
} from "./analysis-orchestrator.ts";
import {
  ForgeAnalysisError,
  InvalidAnalysisRequestError,
  toForgeAnalysisError,
} from "./errors.ts";
import type { AnalysisMode } from "./types.ts";

const maximumRequestBytes = 64 * 1024;

export type WorkspaceStore = {
  saveDNA: (projectId: string, projectDNA: ProjectDNA) => Promise<unknown>;
  saveAnalysis: (
    projectId: string,
    analysis: ForgeWorkspaceAnalysis,
    mode: AnalysisMode,
  ) => Promise<unknown>;
};

export function createWorkspaceAnalysisHandler({
  store,
  mockDelayMilliseconds = 1_200,
}: {
  store: WorkspaceStore;
  mockDelayMilliseconds?: number;
}) {
  return async function workspaceAnalysisHandler(request: NextRequest) {
    if (!isSameOrigin(request)) {
      return errorResponse(
        new InvalidAnalysisRequestError("Cross-origin request rejected"),
        403,
      );
    }

    if (!request.headers.get("content-type")?.includes("application/json")) {
      return errorResponse(
        new InvalidAnalysisRequestError(
          "Content-Type must be application/json",
        ),
        415,
      );
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);

    if (contentLength > maximumRequestBytes) {
      return errorResponse(
        new InvalidAnalysisRequestError("Request body exceeds 64 KiB"),
        413,
      );
    }

    try {
      const bodyText = await request.text();

      if (new TextEncoder().encode(bodyText).byteLength > maximumRequestBytes) {
        return errorResponse(
          new InvalidAnalysisRequestError("Request body exceeds 64 KiB"),
          413,
        );
      }

      const parsedBody = workspaceGenerationRequestSchema.safeParse(
        parseJsonBody(bodyText),
      );

      if (!parsedBody.success) {
        throw new InvalidAnalysisRequestError(
          "Workspace generation request failed validation",
          parsedBody.error,
        );
      }

      const orchestrator = new ForgeAnalysisOrchestrator({
        providers: createDefaultAnalysisProviders({ mockDelayMilliseconds }),
      });

      await store.saveDNA(
        parsedBody.data.projectId,
        parsedBody.data.projectDNA,
      );

      const result = await orchestrator.safeAnalyze({
        mode: parsedBody.data.mode,
        projectDNA: parsedBody.data.projectDNA,
        requestedSections: [...forgeSections],
        generationMode: "initial",
      });

      if (!result.ok) {
        return errorResponse(result.error, statusForError(result.error));
      }

      await store.saveAnalysis(
        parsedBody.data.projectId,
        result.analysis,
        parsedBody.data.mode,
      );

      const response: WorkspaceGenerationResponse = {
        ok: true,
        analysis: result.analysis,
      };

      return NextResponse.json(response, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      const forgeError = toForgeAnalysisError(error);
      return errorResponse(forgeError, statusForError(forgeError));
    }
  };
}

function parseJsonBody(body: string): unknown {
  try {
    return JSON.parse(body) as unknown;
  } catch (error) {
    throw new InvalidAnalysisRequestError(
      "Request body is not valid JSON",
      error,
    );
  }
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

function statusForError(error: ForgeAnalysisError) {
  switch (error.code) {
    case "INVALID_REQUEST":
    case "UNSUPPORTED_ANALYSIS_MODE":
      return 400;
    case "PROVIDER_NOT_CONFIGURED":
      return 503;
    case "RETRY_EXHAUSTED":
    case "PROVIDER_FAILURE":
    case "INVALID_PROVIDER_RESPONSE":
      return 502;
  }
}

function errorResponse(error: ForgeAnalysisError, status: number) {
  console.error("[forge-workspace] Analysis request failed", {
    code: error.code,
    retryable: error.retryable,
  });

  const response: WorkspaceGenerationResponse = {
    ok: false,
    error: {
      code: error.code,
      message: error.userMessage,
      retryable: error.retryable,
    },
  };

  return NextResponse.json(response, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

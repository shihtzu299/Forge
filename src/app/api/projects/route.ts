import { NextResponse, type NextRequest } from "next/server.js";

import {
  createProjectRequestSchema,
  type CreateProjectResponse,
} from "../../../contracts/project-persistence.ts";
import { createProject } from "../../../lib/projects/project-repository.ts";

export const runtime = "nodejs";

const maximumRequestBytes = 16 * 1024;

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return errorResponse("Forge could not create this project.", 403);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return errorResponse("Forge could not create this project.", 415);
  }

  try {
    const bodyText = await request.text();

    if (new TextEncoder().encode(bodyText).byteLength > maximumRequestBytes) {
      return errorResponse("The project idea is too large.", 413);
    }

    const body: unknown = JSON.parse(bodyText);
    const result = createProjectRequestSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("Add a valid project idea before continuing.", 400);
    }

    const project = await createProject(result.data.idea);
    const response: CreateProjectResponse = {
      ok: true,
      projectId: project.id,
      projectUrl: `/projects/${project.id}`,
    };

    return NextResponse.json(response, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return errorResponse("Forge could not create this project right now.", 503);
  }
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

function errorResponse(message: string, status: number) {
  const response: CreateProjectResponse = {
    ok: false,
    error: { message },
  };

  return NextResponse.json(response, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

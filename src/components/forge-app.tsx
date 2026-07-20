"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProjectCreation } from "@/components/creation/project-creation";
import type { CreateProjectResponse } from "@/contracts/project-persistence";

type CreationState = "idle" | "creating" | "committing";

export function ForgeApp() {
  const router = useRouter();
  const [state, setState] = useState<CreationState>("idle");
  const [error, setError] = useState("");

  async function createWorkspace(projectIdea: string) {
    if (state !== "idle") return;

    setState("creating");
    setError("");

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: projectIdea }),
      });
      const payload = (await response.json()) as CreateProjectResponse;

      if (!payload.ok) {
        setError(payload.error.message);
        setState("idle");
        return;
      }

      setState("committing");

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(payload.projectUrl);
        return;
      }

      window.setTimeout(() => router.push(payload.projectUrl), 220);
    } catch {
      setError("Forge could not create this project right now.");
      setState("idle");
    }
  }

  return (
    <div className="relative h-dvh overflow-hidden bg-background text-text-primary">
      <ProjectCreation
        isCreating={state !== "idle"}
        isCommitting={state === "committing"}
        isHidden={false}
        externalError={error}
        onCreate={createWorkspace}
      />
    </div>
  );
}

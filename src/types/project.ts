export type ProjectDNA = {
  idea: string;
  firstCustomer: string;
  coreProblem: string;
  desiredOutcome: string;
  biggestConstraint: string;
};

export type ProjectDNAProgress =
  "not-started" | "in-progress" | "complete" | "ready";

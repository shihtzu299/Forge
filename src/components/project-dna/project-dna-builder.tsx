"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import type { ProjectDNA, ProjectDNAProgress } from "@/types/project";

type AnswerKey = Exclude<keyof ProjectDNA, "idea">;

const questions: readonly {
  key: AnswerKey;
  question: string;
  supportingText: string;
}[] = [
  {
    key: "firstCustomer",
    question: "Who is your first customer?",
    supportingText:
      "Describe the specific person or organization you want to serve first.",
  },
  {
    key: "coreProblem",
    question: "What problem are they struggling with?",
    supportingText:
      "Focus on the painful situation that makes your project necessary.",
  },
  {
    key: "desiredOutcome",
    question: "What outcome will your product create?",
    supportingText:
      "Describe the change your customer should experience after using it.",
  },
  {
    key: "biggestConstraint",
    question: "What is your biggest constraint?",
    supportingText:
      "Consider time, budget, technology, regulation, distribution, or access.",
  },
];

const initialAnswers: Record<AnswerKey, string> = {
  firstCustomer: "",
  coreProblem: "",
  desiredOutcome: "",
  biggestConstraint: "",
};

export function ProjectDNABuilder({
  idea,
  onProgressChange,
}: {
  idea: string;
  onProgressChange: (progress: ProjectDNAProgress) => void;
}) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState("");
  const [completedDNA, setCompletedDNA] = useState<ProjectDNA | null>(null);
  const [isReadyForAnalysis, setIsReadyForAnalysis] = useState(false);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const summaryHeadingRef = useRef<HTMLHeadingElement>(null);
  const readyHeadingRef = useRef<HTMLHeadingElement>(null);
  const shouldFocusQuestionRef = useRef(false);
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (completedDNA) {
      summaryHeadingRef.current?.focus();
      return;
    }

    if (shouldFocusQuestionRef.current) {
      questionHeadingRef.current?.focus();
      shouldFocusQuestionRef.current = false;
    }
  }, [completedDNA, currentQuestionIndex]);

  useEffect(() => {
    if (isReadyForAnalysis) {
      readyHeadingRef.current?.focus();
    }
  }, [isReadyForAnalysis]);

  function updateCurrentAnswer(value: string) {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.key]: value,
    }));
    setError("");

    if (value.trim()) {
      onProgressChange("in-progress");
    }
  }

  function continueFlow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedAnswer = answers[currentQuestion.key].trim();

    if (!normalizedAnswer) {
      setError("Add an answer before continuing.");
      return;
    }

    const nextAnswers = {
      ...answers,
      [currentQuestion.key]: normalizedAnswer,
    };
    setAnswers(nextAnswers);

    if (currentQuestionIndex === questions.length - 1) {
      setCompletedDNA({ idea, ...nextAnswers });
      onProgressChange("complete");
      return;
    }

    shouldFocusQuestionRef.current = true;
    setCurrentQuestionIndex((current) => current + 1);
    onProgressChange("in-progress");
  }

  function goBack() {
    setError("");
    shouldFocusQuestionRef.current = true;
    setCurrentQuestionIndex((current) => Math.max(0, current - 1));
  }

  function generateWorkspace() {
    setIsReadyForAnalysis(true);
    onProgressChange("ready");
  }

  if (completedDNA) {
    const summaryItems = [
      ["Idea", completedDNA.idea],
      ["First Customer", completedDNA.firstCustomer],
      ["Core Problem", completedDNA.coreProblem],
      ["Desired Outcome", completedDNA.desiredOutcome],
      ["Biggest Constraint", completedDNA.biggestConstraint],
    ] as const;

    return (
      <section className="rounded-xl border border-border bg-surface-elevated p-6 shadow-md sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-accent-secondary">
              Foundation defined
            </p>
            <h2
              ref={summaryHeadingRef}
              tabIndex={-1}
              className="mt-2 text-xl tracking-tight"
            >
              Project DNA
            </h2>
          </div>
          <span className="text-xs text-text-muted">4 of 4</span>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {summaryItems.map(([label, value], index) => (
            <div
              key={label}
              className={`rounded-lg border border-border bg-surface-subtle p-4 ${
                index === 0 ? "sm:col-span-2" : ""
              }`}
            >
              <dt className="text-xs font-medium text-text-muted">{label}</dt>
              <dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {isReadyForAnalysis ? (
          <div
            role="status"
            className="mt-6 rounded-lg border border-accent-primary/40 bg-accent-primary/10 p-4"
          >
            <h3
              ref={readyHeadingRef}
              tabIndex={-1}
              className="text-sm font-medium text-text-primary"
            >
              Project DNA ready for GPT-5.6 analysis.
            </h3>
          </div>
        ) : (
          <button
            type="button"
            onClick={generateWorkspace}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-accent-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-accent-primary/90"
          >
            Generate Workspace
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface-elevated p-6 shadow-md sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-medium text-accent-primary">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        <div
          className="flex gap-1.5"
          role="progressbar"
          aria-label="Project DNA progress"
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-valuenow={currentQuestionIndex + 1}
        >
          {questions.map((question, index) => (
            <span
              key={question.key}
              className={`h-1 w-7 rounded-full ${
                index <= currentQuestionIndex
                  ? "bg-accent-primary"
                  : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <form className="mt-6" onSubmit={continueFlow} noValidate>
        <h2
          ref={questionHeadingRef}
          tabIndex={-1}
          className="text-xl tracking-tight sm:text-2xl"
        >
          {currentQuestion.question}
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          {currentQuestion.supportingText}
        </p>

        <label htmlFor="dna-answer" className="sr-only">
          {currentQuestion.question}
        </label>
        <textarea
          id="dna-answer"
          value={answers[currentQuestion.key]}
          onChange={(event) => updateCurrentAnswer(event.target.value)}
          rows={5}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "dna-answer-error" : undefined}
          className="mt-5 w-full resize-y rounded-lg border border-border bg-surface-subtle p-4 text-sm leading-6 text-text-primary outline-none transition-colors duration-200 placeholder:text-text-muted focus:border-accent-primary"
        />

        <div className="mt-3 min-h-6">
          {error ? (
            <p
              id="dna-answer-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-accent-primary/90"
          >
            Continue
          </button>
          {currentQuestionIndex > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface-subtle px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary"
            >
              Back
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

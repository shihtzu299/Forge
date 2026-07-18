const leadingVerbs = new Set(["build", "create", "develop", "launch", "make"]);

const fillerWords = new Set([
  "a",
  "an",
  "and",
  "for",
  "help",
  "helps",
  "independent",
  "leading",
  "of",
  "platform",
  "product",
  "solution",
  "that",
  "the",
  "to",
  "tool",
  "with",
]);

const normalizedTerms = new Map([
  ["africa", "African"],
  ["africa's", "African"],
  ["africa’s", "African"],
  ["agencies", "Agency"],
  ["ai", "AI"],
  ["api", "API"],
  ["exams", "Exam"],
  ["fintech", "Fintech"],
  ["prepare", "Prep"],
  ["proptech", "PropTech"],
  ["saas", "SaaS"],
  ["students", "Student"],
]);

export function deriveProjectName(idea: string) {
  const words = idea
    .replace(/[^\p{L}\p{N}'\u2019-]+/gu, " ")
    .trim()
    .split(/\s+/);
  const firstWord = words[0]?.toLocaleLowerCase();
  const withoutLeadingVerb = leadingVerbs.has(firstWord)
    ? words.slice(1)
    : words;
  const meaningfulWords = withoutLeadingVerb
    .filter((word) => !fillerWords.has(word.toLocaleLowerCase()))
    .slice(0, 5)
    .map((word) => {
      const lowerWord = word.toLocaleLowerCase();

      return (
        normalizedTerms.get(lowerWord) ??
        `${word.charAt(0).toLocaleUpperCase()}${word.slice(1)}`
      );
    });

  return meaningfulWords.join(" ") || "Untitled project";
}

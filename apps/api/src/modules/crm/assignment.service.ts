const ADVISORS = ["advisor-1", "advisor-2", "advisor-3"];
let cursor = 0;

export function pickAdvisor(): string {
  const advisor = ADVISORS[cursor % ADVISORS.length];
  cursor++;
  return advisor;
}

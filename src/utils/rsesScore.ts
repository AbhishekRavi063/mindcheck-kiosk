// RSES-10 scoring — response scale is 0–3 (Strongly disagree=0, Disagree=1,
// Agree=2, Strongly agree=3), matching the 4-option slider in QuestionScreen.
//
// Positively-worded items (Q1, Q2, Q4, Q6, Q7 — 1-indexed, 0-indexed: 0,1,3,5,6)
// use raw directly so that "Strongly agree" (raw=3) contributes 3 points.
//
// Negatively-worded items (Q3, Q5, Q8, Q9, Q10 — 1-indexed, 0-indexed: 2,4,7,8,9)
// are scored as 3 − raw so that "Strongly agree" (raw=3, e.g. "I am a failure")
// correctly contributes 0 points.
//
// Total range: 0–30.

// 0-indexed positions of the negatively-worded items (Q3, Q5, Q8, Q9, Q10)
const RSES_NEGATIVE = new Set([2, 4, 7, 8, 9]);

export function calculateRsesScore(answers: number[]): number {
  return answers.reduce(
    (total, raw, index) => total + (RSES_NEGATIVE.has(index) ? 3 - raw : raw),
    0
  );
}

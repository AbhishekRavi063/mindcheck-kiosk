// PSS-10 scoring — response scale is 0–4 (Never=0, Almost Never=1, Sometimes=2,
// Fairly Often=3, Very Often=4). Items 4, 5, 7, 8 (1-indexed) are positively-worded
// coping/control items and must be reverse scored (scored = 4 − raw) before summing.
// All other items (1, 2, 3, 6, 9, 10) use the raw response directly.
// Total range: 0–40.

// 0-indexed positions of the reversed items (items 4, 5, 7, 8 in 1-indexed)
const PSS_REVERSED = new Set([3, 4, 6, 7]);

export function calculatePssScore(answers: number[]): number {
  return answers.reduce(
    (total, raw, index) => total + (PSS_REVERSED.has(index) ? 4 - raw : raw),
    0
  );
}

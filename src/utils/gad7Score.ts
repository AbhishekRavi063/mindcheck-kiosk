// GAD-7 scoring — response scale is 0–3 (Not at all=0, Several days=1,
// More than half the days=2, Nearly every day=3). No reverse scoring —
// all 7 items use raw responses directly. Total range: 0–21.

export function calculateGad7Score(answers: number[]): number {
  return answers.reduce((a, b) => a + b, 0);
}

export function getGad7SeverityLabel(score: number): string {
  if (score <= 4)  return 'Minimal';
  if (score <= 9)  return 'Mild';
  if (score <= 14) return 'Moderate';
  return 'Severe';
}

import { describe, it, expect } from 'vitest';
import { calculateGad7Score, getGad7SeverityLabel } from './gad7Score';

// Response scale: 0–3. No reverse scoring. Max score = 7 × 3 = 21.

describe('calculateGad7Score', () => {
  it('all zeros → 0', () => {
    expect(calculateGad7Score([0, 0, 0, 0, 0, 0, 0])).toBe(0);
  });

  it('all threes → 21 (maximum)', () => {
    expect(calculateGad7Score([3, 3, 3, 3, 3, 3, 3])).toBe(21);
  });

  it('known answer array → expected score', () => {
    // [1, 2, 1, 0, 1, 2, 1] = 8
    expect(calculateGad7Score([1, 2, 1, 0, 1, 2, 1])).toBe(8);
  });
});

describe('getGad7SeverityLabel', () => {
  it('0 → Minimal', ()   => expect(getGad7SeverityLabel(0)).toBe('Minimal'));
  it('4 → Minimal', ()   => expect(getGad7SeverityLabel(4)).toBe('Minimal'));
  it('5 → Mild', ()      => expect(getGad7SeverityLabel(5)).toBe('Mild'));
  it('9 → Mild', ()      => expect(getGad7SeverityLabel(9)).toBe('Mild'));
  it('10 → Moderate', () => expect(getGad7SeverityLabel(10)).toBe('Moderate'));
  it('14 → Moderate', () => expect(getGad7SeverityLabel(14)).toBe('Moderate'));
  it('15 → Severe', ()   => expect(getGad7SeverityLabel(15)).toBe('Severe'));
  it('21 → Severe', ()   => expect(getGad7SeverityLabel(21)).toBe('Severe'));
});

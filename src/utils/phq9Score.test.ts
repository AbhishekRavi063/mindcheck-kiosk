import { describe, it, expect } from 'vitest';
import { calculatePhq9Score, getPhq9SeverityLabel } from './phq9Score';

// Response scale: 0–3. No reverse scoring. Max score = 9 × 3 = 27.

describe('calculatePhq9Score', () => {
  it('all zeros → 0', () => {
    expect(calculatePhq9Score([0, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(0);
  });

  it('all threes → 27 (maximum)', () => {
    expect(calculatePhq9Score([3, 3, 3, 3, 3, 3, 3, 3, 3])).toBe(27);
  });

  it('known answer array → expected score', () => {
    // [1, 2, 1, 0, 1, 2, 1, 0, 1] = 9
    expect(calculatePhq9Score([1, 2, 1, 0, 1, 2, 1, 0, 1])).toBe(9);
  });
});

describe('getPhq9SeverityLabel', () => {
  it('0 → Minimal', ()   => expect(getPhq9SeverityLabel(0)).toBe('Minimal'));
  it('4 → Minimal', ()   => expect(getPhq9SeverityLabel(4)).toBe('Minimal'));
  it('5 → Mild', ()      => expect(getPhq9SeverityLabel(5)).toBe('Mild'));
  it('9 → Mild', ()      => expect(getPhq9SeverityLabel(9)).toBe('Mild'));
  it('10 → Moderate', () => expect(getPhq9SeverityLabel(10)).toBe('Moderate'));
  it('14 → Moderate', () => expect(getPhq9SeverityLabel(14)).toBe('Moderate'));
  it('15 → Moderately Severe', () => expect(getPhq9SeverityLabel(15)).toBe('Moderately Severe'));
  it('19 → Moderately Severe', () => expect(getPhq9SeverityLabel(19)).toBe('Moderately Severe'));
  it('20 → Severe', ()   => expect(getPhq9SeverityLabel(20)).toBe('Severe'));
  it('27 → Severe', ()   => expect(getPhq9SeverityLabel(27)).toBe('Severe'));
});

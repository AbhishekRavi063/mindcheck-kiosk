import { describe, it, expect } from 'vitest';
import { calculateRsesScore } from './rsesScore';

// Response scale: 0=Strongly disagree, 1=Disagree, 2=Agree, 3=Strongly agree
// Positively-worded items (indices 0,1,3,5,6): scored as raw
// Negatively-worded items (indices 2,4,7,8,9): scored as 3 − raw
//
// Note: uniform responses always produce 15 (not 0 or 30) because 5 positive
// and 5 negative items cancel each other exactly for any constant raw value.

describe('calculateRsesScore', () => {
  it('all zeros → 15 (SD on positives=0 pts each, SD on negatives=3 pts each)', () => {
    // Positives: 0×5=0; Negatives: (3-0)×5=15
    expect(calculateRsesScore([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(15);
  });

  it('all threes → 15 (SA on positives=3 pts each, SA on negatives=0 pts each)', () => {
    // Positives: 3×5=15; Negatives: (3-3)×5=0
    expect(calculateRsesScore([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toBe(15);
  });

  it('all twos → 15 (midpoint preserved)', () => {
    // Positives: 2×5=10; Negatives: (3-2)×5=5
    expect(calculateRsesScore([2, 2, 2, 2, 2, 2, 2, 2, 2, 2])).toBe(15);
  });

  it('all ones → 15 (midpoint preserved)', () => {
    // Positives: 1×5=5; Negatives: (3-1)×5=10
    expect(calculateRsesScore([1, 1, 1, 1, 1, 1, 1, 1, 1, 1])).toBe(15);
  });

  it('[0,0,3,0,3,0,0,3,3,3] → 0 (minimum — lowest self-esteem)', () => {
    // Positives (indices 0,1,3,5,6) all SD (raw=0): 0 pts each
    // Negatives (indices 2,4,7,8,9) all SA (raw=3, "I am a failure"): 3-3=0 pts each
    expect(calculateRsesScore([0, 0, 3, 0, 3, 0, 0, 3, 3, 3])).toBe(0);
  });

  it('[3,3,0,3,0,3,3,0,0,0] → 30 (maximum — highest self-esteem)', () => {
    // Positives (indices 0,1,3,5,6) all SA (raw=3): 3 pts each
    // Negatives (indices 2,4,7,8,9) all SD (raw=0, "disagree I am a failure"): 3-0=3 pts each
    expect(calculateRsesScore([3, 3, 0, 3, 0, 3, 3, 0, 0, 0])).toBe(30);
  });
});

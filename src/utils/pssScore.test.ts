import { describe, it, expect } from 'vitest';
import { calculatePssScore } from './pssScore';

// Items 4, 5, 7, 8 (1-indexed) = indices 3, 4, 6, 7 (0-indexed) are reverse scored.
// Reverse formula: scored = 4 − raw. All other items use raw directly.

describe('calculatePssScore', () => {
  it('all zeros → 16 (four reversed items each become 4, six forward stay 0)', () => {
    expect(calculatePssScore([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(16);
  });

  it('all fours → 24 (four reversed items each become 0, six forward stay 4)', () => {
    expect(calculatePssScore([4, 4, 4, 4, 4, 4, 4, 4, 4, 4])).toBe(24);
  });

  it('all twos → 20 (midpoint preserved for both forward and reversed items)', () => {
    expect(calculatePssScore([2, 2, 2, 2, 2, 2, 2, 2, 2, 2])).toBe(20);
  });

  it('[0,0,0,4,4,0,4,4,0,0] → 0 (minimum possible stress)', () => {
    // Forward items (indices 0,1,2,5,8,9): all 0 → 0
    // Reversed items (indices 3,4,6,7): all 4 → 4−4=0 each
    expect(calculatePssScore([0, 0, 0, 4, 4, 0, 4, 4, 0, 0])).toBe(0);
  });

  it('[4,4,4,0,0,4,0,0,4,4] → 40 (maximum possible stress)', () => {
    // Forward items (indices 0,1,2,5,8,9): all 4 → 4 each (×6 = 24)
    // Reversed items (indices 3,4,6,7): all 0 → 4−0=4 each (×4 = 16)
    expect(calculatePssScore([4, 4, 4, 0, 0, 4, 0, 0, 4, 4])).toBe(40);
  });
});

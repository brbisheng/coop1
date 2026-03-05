import { describe, expect, it } from 'vitest';
import { evaluateStop } from '../src/policies/economic_stop';

describe('economic stop policy', () => {
  it('returns success_stop when economic gate fails but readiness passes', () => {
    const result = evaluateStop({
      expectedDeltaValue: 0.01,
      expectedDeltaCost: 0.02,
      opportunityCost: 0.01,
      readinessScore: 90,
      readinessThreshold: 80,
      blockerCount: 0,
    });

    expect(result.continue).toBe(false);
    if (!result.continue) {
      expect(result.reason).toBe('success_stop');
    }
  });

  it('returns constrained_stop when both gates fail', () => {
    const result = evaluateStop({
      expectedDeltaValue: 0.01,
      expectedDeltaCost: 0.02,
      opportunityCost: 0.01,
      readinessScore: 50,
      readinessThreshold: 80,
      blockerCount: 2,
    });

    expect(result.continue).toBe(false);
    if (!result.continue) {
      expect(result.reason).toBe('constrained_stop');
    }
  });
});

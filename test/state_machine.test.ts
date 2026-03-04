import { describe, expect, it } from 'vitest';
import { nextPhase } from '../src/orchestrator/state_machine';

describe('state machine', () => {
  it('moves through core phases', () => {
    expect(nextPhase('framing', 'framing_ok')).toBe('synthesis');
    expect(nextPhase('synthesis', 'synthesis_ok')).toBe('verification');
    expect(nextPhase('verification', 'verification_ok')).toBe('readiness');
    expect(nextPhase('readiness', 'readiness_ok')).toBe('stopped');
  });

  it('rolls back when contradiction appears', () => {
    expect(nextPhase('verification', 'contradiction_found')).toBe('synthesis');
  });
});

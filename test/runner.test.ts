import { describe, expect, it } from 'vitest';
import { runSimulation } from '../src/orchestrator/runner';

describe('runner simulation', () => {
  it('stops with success_stop when gates indicate optimal stop', () => {
    const result = runSimulation(
      [
        {
          event: 'framing_ok',
          expectedDeltaValue: 0.08,
          expectedDeltaCost: 0.03,
          opportunityCost: 0.01,
          readinessScore: 40,
          readinessThreshold: 80,
          blockerCount: 1,
        },
        {
          event: 'synthesis_ok',
          expectedDeltaValue: 0.01,
          expectedDeltaCost: 0.02,
          opportunityCost: 0.01,
          readinessScore: 82,
          readinessThreshold: 80,
          blockerCount: 0,
        },
      ],
      { maxRounds: 4 },
    );

    expect(result.stopped).toBe(true);
    expect(result.stop_reason).toBe('success_stop');
    expect(result.final_phase).toBe('stopped');
    expect(result.rounds).toHaveLength(2);
  });
});

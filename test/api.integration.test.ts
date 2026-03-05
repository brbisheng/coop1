import { beforeEach, describe, expect, it } from 'vitest';
import { existsSync, rmSync } from 'node:fs';
import { app } from '../src/api/server';

const STORE_PATH = 'data/store.json';

describe('api integration', () => {
  beforeEach(() => {
    if (existsSync(STORE_PATH)) rmSync(STORE_PATH);
  });

  it('persists simulate result and allows querying run details', async () => {
    const simulate = await app.inject({
      method: 'POST',
      url: '/runs/simulate',
      payload: {
        maxRounds: 3,
        rounds: [
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
            readinessScore: 85,
            readinessThreshold: 80,
            blockerCount: 0,
          },
        ],
      },
    });

    expect(simulate.statusCode).toBe(200);
    const payload = simulate.json();
    expect(payload.run_id).toBeTypeOf('string');
    expect(payload.stop_reason).toBe('success_stop');

    const runResp = await app.inject({ method: 'GET', url: `/runs/${payload.run_id}` });
    expect(runResp.statusCode).toBe(200);

    const roundsResp = await app.inject({ method: 'GET', url: `/runs/${payload.run_id}/rounds` });
    expect(roundsResp.statusCode).toBe(200);
    expect(roundsResp.json().rounds).toHaveLength(2);

    const eventsResp = await app.inject({ method: 'GET', url: `/runs/${payload.run_id}/events` });
    expect(eventsResp.statusCode).toBe(200);
    expect(eventsResp.json().events.length).toBeGreaterThanOrEqual(3);
  });
});

import { evaluateStop, type StopInput, type StopDecision } from '../policies/economic_stop';
import { nextPhase, type Event } from './state_machine';
import type { Phase, StopReasonCode } from '../types/core';

export interface RoundInput extends StopInput {
  event: Event;
}

export interface RoundResult {
  round: number;
  phase_before: Phase;
  phase_after: Phase;
  decision: StopDecision;
}

export interface RunResult {
  stopped: boolean;
  stop_reason?: StopReasonCode;
  rounds: RoundResult[];
  final_phase: Phase;
}

export interface RunConfig {
  maxRounds: number;
}

export function runSimulation(inputs: RoundInput[], config: RunConfig): RunResult {
  let phase: Phase = 'framing';
  const rounds: RoundResult[] = [];

  for (let i = 0; i < inputs.length && i < config.maxRounds; i += 1) {
    const row = inputs[i];
    const before = phase;
    phase = nextPhase(phase, row.event);

    const decision = evaluateStop(row);
    rounds.push({
      round: i + 1,
      phase_before: before,
      phase_after: phase,
      decision,
    });

    if (!decision.continue) {
      return {
        stopped: true,
        stop_reason: decision.reason,
        rounds,
        final_phase: 'stopped',
      };
    }
  }

  return {
    stopped: false,
    rounds,
    final_phase: phase,
  };
}

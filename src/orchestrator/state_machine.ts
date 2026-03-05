import type { Phase } from '../types/core';

export type Event =
  | 'framing_ok'
  | 'synthesis_ok'
  | 'verification_ok'
  | 'readiness_ok'
  | 'contradiction_found'
  | 'stop';

const transitions: Record<Phase, Partial<Record<Event, Phase>>> = {
  framing: { framing_ok: 'synthesis', stop: 'stopped' },
  synthesis: { synthesis_ok: 'verification', stop: 'stopped' },
  verification: { verification_ok: 'readiness', contradiction_found: 'synthesis', stop: 'stopped' },
  readiness: { readiness_ok: 'stopped', stop: 'stopped' },
  stopped: {},
};

export interface TransitionResult {
  from: Phase;
  event: Event;
  to: Phase;
  changed: boolean;
}

export function nextPhase(current: Phase, event: Event): Phase {
  const candidate = transitions[current][event];
  return candidate ?? current;
}

export function transition(current: Phase, event: Event): TransitionResult {
  const to = nextPhase(current, event);
  return {
    from: current,
    event,
    to,
    changed: to !== current,
  };
}

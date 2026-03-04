import type { Phase } from '../types/core';

export type Event =
  | 'framing_ok'
  | 'synthesis_ok'
  | 'verification_ok'
  | 'readiness_ok'
  | 'contradiction_found'
  | 'stop';

export function nextPhase(current: Phase, event: Event): Phase {
  if (current === 'framing' && event === 'framing_ok') return 'synthesis';
  if (current === 'synthesis' && event === 'synthesis_ok') return 'verification';
  if (current === 'verification' && event === 'verification_ok') return 'readiness';
  if (current === 'verification' && event === 'contradiction_found') return 'synthesis';
  if (current === 'readiness' && event === 'readiness_ok') return 'stopped';
  if (event === 'stop') return 'stopped';
  return current;
}

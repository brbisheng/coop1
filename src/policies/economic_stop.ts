import type { DecisionTrace, StopReasonCode } from '../types/core';

export interface StopInput {
  expectedDeltaValue: number;
  expectedDeltaCost: number;
  opportunityCost: number;
  readinessScore: number;
  readinessThreshold: number;
  blockerCount: number;
  budgetExceeded?: boolean;
}

export type StopDecision =
  | { continue: true; reason: 'continue'; trace: DecisionTrace }
  | { continue: false; reason: StopReasonCode; trace: DecisionTrace };

export function evaluateStop(input: StopInput): StopDecision {
  const economicGatePass = input.expectedDeltaValue > input.expectedDeltaCost + input.opportunityCost;
  const readinessGatePass = input.readinessScore >= input.readinessThreshold && input.blockerCount === 0;

  if (input.budgetExceeded) {
    return {
      continue: false,
      reason: 'budget_stop',
      trace: mkTrace(input, economicGatePass, readinessGatePass),
    };
  }

  if (!economicGatePass && readinessGatePass) {
    return {
      continue: false,
      reason: 'success_stop',
      trace: mkTrace(input, economicGatePass, readinessGatePass),
    };
  }

  if (!economicGatePass && !readinessGatePass) {
    return {
      continue: false,
      reason: 'constrained_stop',
      trace: mkTrace(input, economicGatePass, readinessGatePass),
    };
  }

  return {
    continue: true,
    reason: 'continue',
    trace: mkTrace(input, economicGatePass, readinessGatePass),
  };
}

function mkTrace(input: StopInput, economicGatePass: boolean, readinessGatePass: boolean): DecisionTrace {
  return {
    phase: readinessGatePass ? 'readiness' : 'verification',
    delta_value_est: input.expectedDeltaValue,
    delta_cost_est: input.expectedDeltaCost,
    opportunity_cost_est: input.opportunityCost,
    voi_score: input.expectedDeltaValue - input.expectedDeltaCost,
    economic_gate_pass: economicGatePass,
    readiness_gate_pass: readinessGatePass,
  };
}

export type AgentId = string;

export type Phase = 'framing' | 'synthesis' | 'verification' | 'readiness' | 'stopped';

export type StopReasonCode =
  | 'success_stop'
  | 'constrained_stop'
  | 'budget_stop'
  | 'schema_fail'
  | 'provider_timeout'
  | 'safety_stop';

export interface LLMRequest {
  session_id: string;
  agent_id: AgentId;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  constraints: {
    max_output_chars?: number;
    max_turn_seconds?: number;
    output_format?: 'text' | 'json';
    json_schema?: object;
    stop?: string[];
  };
  model_params?: Record<string, unknown>;
}

export interface LLMResponse {
  ok: boolean;
  content_text?: string;
  content_json?: unknown;
  raw_text: string;
  usage?: { input_tokens?: number; output_tokens?: number; cost_usd?: number };
  latency_ms: number;
  error?: { code: string; message: string; retryable: boolean; stage?: 'adapter' | 'orchestrator' };
}

export interface DecisionTrace {
  phase: Phase;
  delta_value_est: number;
  delta_cost_est: number;
  opportunity_cost_est: number;
  voi_score: number;
  economic_gate_pass: boolean;
  readiness_gate_pass: boolean;
}

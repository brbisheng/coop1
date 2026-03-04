# Orchestrator Skeleton (Task 1 + Task 2 foundation)

This repository contains a runnable Node + TypeScript skeleton with:

- Modular folders for adapters/api/orchestrator/policies/storage/schemas/config
- Core domain types (`LLMRequest`, `LLMResponse`, `Phase`, `StopReasonCode`, `DecisionTrace`)
- Phase-gate state machine with rollback support
- Economic stop policy (economic gate + readiness gate)
- Simulation runner for replayable phase transitions and stop decisions
- Fastify endpoints:
  - `GET /health`
  - `GET /demo-stop`
  - `POST /runs/simulate`
- Vitest unit tests for state transitions, stop policy, and simulation behavior

## Run

```bash
npm install
npm run dev
```

## Validate

```bash
npm run typecheck
npm run test
npm run build
```

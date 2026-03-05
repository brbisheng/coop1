# Orchestrator Skeleton (Task 1 + Task 2 + Task 3 foundation)

This repository contains a runnable Node + TypeScript skeleton with:

- Modular folders for adapters/api/orchestrator/policies/storage/schemas/config
- Core domain types (`LLMRequest`, `LLMResponse`, `Phase`, `StopReasonCode`, `DecisionTrace`)
- Phase-gate state machine with rollback support
- Economic stop policy (economic gate + readiness gate)
- Simulation runner for replayable phase transitions and stop decisions
- File-backed persistence for runs/rounds/events (`data/store.json`)
- Fastify endpoints:
  - `GET /health`
  - `GET /demo-stop`
  - `POST /runs/simulate`
  - `GET /runs/:id`
  - `GET /runs/:id/rounds`
  - `GET /runs/:id/events`
- Vitest unit and integration tests

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

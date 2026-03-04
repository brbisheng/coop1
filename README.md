# Orchestrator Skeleton (Task 1)

This repository now contains a runnable Node + TypeScript skeleton with:

- Modular folders for adapters/api/orchestrator/policies/storage/schemas/config
- Core types (`LLMRequest`, `LLMResponse`, `Phase`, `StopReasonCode`, `DecisionTrace`)
- Initial phase-gate state machine
- Initial economic stop policy
- Fastify demo server (`/health`, `/demo-stop`)
- Vitest unit test for phase transitions

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

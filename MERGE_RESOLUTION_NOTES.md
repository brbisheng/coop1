# Merge conflict resolution notes

Use these exact resolutions when GitHub reports conflicts for:

- `README.md`
- `src/api/server.ts`
- `src/orchestrator/state_machine.ts`
- `src/policies/economic_stop.ts`

## 1) README.md
Keep the **Task 1 + Task 2 foundation** version (single section), not duplicated Task 1-only text.

## 2) src/api/server.ts (conflict around line 26-63)
Use imports that keep both existing behavior and simulation endpoint:

```ts
import Fastify from 'fastify';
import { z } from 'zod';
import { evaluateStop } from '../policies/economic_stop';
import { runSimulation } from '../orchestrator/runner';
```

And keep endpoint set:
- `GET /health`
- `GET /demo-stop`
- `POST /runs/simulate`

## 3) src/orchestrator/state_machine.ts (line 11-49)
Use the transition-table implementation (supports rollback and structured transitions):

```ts
const transitions: Record<Phase, Partial<Record<Event, Phase>>> = {
  framing: { framing_ok: 'synthesis', stop: 'stopped' },
  synthesis: { synthesis_ok: 'verification', stop: 'stopped' },
  verification: { verification_ok: 'readiness', contradiction_found: 'synthesis', stop: 'stopped' },
  readiness: { readiness_ok: 'stopped', stop: 'stopped' },
  stopped: {},
};
```

## 4) src/policies/economic_stop.ts (line 1-5 and 18-25)
Keep typed decision model and budget branch:

```ts
import type { DecisionTrace, StopReasonCode } from '../types/core';
```

And budget handling block:

```ts
if (input.budgetExceeded) {
  return {
    continue: false,
    reason: 'budget_stop',
    trace: mkTrace(input, economicGatePass, readinessGatePass),
  };
}
```

## Command-line resolution recipe
If you can use CLI on the PR branch:

```bash
git fetch origin
git checkout <your-pr-branch>
git merge origin/main
# resolve the 4 files using rules above
git add README.md src/api/server.ts src/orchestrator/state_machine.ts src/policies/economic_stop.ts
git commit -m "Resolve merge conflicts with main for README/api/state_machine/economic_stop"
git push
```

Then rerun checks:

```bash
npm run typecheck
npm run test
npm run build
```

import Fastify from 'fastify';
import { z } from 'zod';
import { evaluateStop } from '../policies/economic_stop';
import { runSimulation } from '../orchestrator/runner';
import { FileRunRepository } from '../storage/repository';

const app = Fastify({ logger: true });
const repo = new FileRunRepository();

app.get('/health', async () => ({ ok: true }));

app.get('/demo-stop', async () => {
  const result = evaluateStop({
    expectedDeltaValue: 0.05,
    expectedDeltaCost: 0.04,
    opportunityCost: 0.02,
    readinessScore: 82,
    readinessThreshold: 80,
    blockerCount: 0,
  });
  return result;
});

const eventSchema = z.enum([
  'framing_ok',
  'synthesis_ok',
  'verification_ok',
  'readiness_ok',
  'contradiction_found',
  'stop',
]);

const roundSchema = z.object({
  event: eventSchema,
  expectedDeltaValue: z.number(),
  expectedDeltaCost: z.number(),
  opportunityCost: z.number(),
  readinessScore: z.number(),
  readinessThreshold: z.number(),
  blockerCount: z.number().int().nonnegative(),
  budgetExceeded: z.boolean().optional(),
});

const simulateSchema = z.object({
  maxRounds: z.number().int().positive().default(4),
  rounds: z.array(roundSchema).min(1),
});

app.post('/runs/simulate', async (request, reply) => {
  const parsed = simulateSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: 'invalid_payload', details: parsed.error.flatten() });
  }

  const result = runSimulation(parsed.data.rounds, { maxRounds: parsed.data.maxRounds });
  const run = repo.createRun({
    stopped: result.stopped,
    stop_reason: result.stop_reason,
    final_phase: result.final_phase,
  });

  repo.saveRounds(run.run_id, result.rounds);
  const events = FileRunRepository.deriveEvents(run.run_id, result.rounds, result.stop_reason);
  repo.saveEvents(events);

  return reply.send({ run_id: run.run_id, ...result });
});

app.get('/runs/:id', async (request, reply) => {
  const params = z.object({ id: z.string().min(1) }).parse(request.params);
  const run = repo.getRun(params.id);
  if (!run) return reply.status(404).send({ error: 'run_not_found' });
  return reply.send(run);
});

app.get('/runs/:id/rounds', async (request, reply) => {
  const params = z.object({ id: z.string().min(1) }).parse(request.params);
  const run = repo.getRun(params.id);
  if (!run) return reply.status(404).send({ error: 'run_not_found' });
  return reply.send({ run_id: params.id, rounds: repo.getRounds(params.id) });
});

app.get('/runs/:id/events', async (request, reply) => {
  const params = z.object({ id: z.string().min(1) }).parse(request.params);
  const run = repo.getRun(params.id);
  if (!run) return reply.status(404).send({ error: 'run_not_found' });
  return reply.send({ run_id: params.id, events: repo.getEvents(params.id) });
});

const start = async () => {
  try {
    await app.listen({ port: 8080, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

if (require.main === module) {
  void start();
}

export { app };

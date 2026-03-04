import Fastify from 'fastify';
import { evaluateStop } from '../policies/economic_stop';

const app = Fastify({ logger: true });

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

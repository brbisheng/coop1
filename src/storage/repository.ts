import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { RoundResult } from '../orchestrator/runner';
import type { Phase, StopReasonCode } from '../types/core';

export interface RunRecord {
  run_id: string;
  created_at: string;
  final_phase: Phase;
  stopped: boolean;
  stop_reason?: StopReasonCode;
}

export interface EventRecord {
  event_id: string;
  run_id: string;
  type: 'phase_entered' | 'gate_decision' | 'run_stopped';
  payload: Record<string, unknown>;
  created_at: string;
}

export interface RunDetails {
  run: RunRecord;
  rounds: RoundResult[];
  events: EventRecord[];
}

interface StoreFile {
  runs: RunRecord[];
  rounds: Array<{ run_id: string; round: RoundResult }>;
  events: EventRecord[];
}

const EMPTY_STORE: StoreFile = {
  runs: [],
  rounds: [],
  events: [],
};

export class FileRunRepository {
  constructor(private readonly filePath: string = 'data/store.json') {}

  createRun(params: Omit<RunRecord, 'run_id' | 'created_at'>): RunRecord {
    const store = this.load();
    const run: RunRecord = {
      run_id: randomUUID(),
      created_at: new Date().toISOString(),
      ...params,
    };
    store.runs.push(run);
    this.save(store);
    return run;
  }

  saveRounds(runId: string, rounds: RoundResult[]): void {
    const store = this.load();
    for (const round of rounds) {
      store.rounds.push({ run_id: runId, round });
    }
    this.save(store);
  }

  saveEvents(events: EventRecord[]): void {
    const store = this.load();
    store.events.push(...events);
    this.save(store);
  }

  getRun(runId: string): RunRecord | undefined {
    return this.load().runs.find((r) => r.run_id === runId);
  }

  getRounds(runId: string): RoundResult[] {
    return this.load()
      .rounds.filter((r) => r.run_id === runId)
      .map((r) => r.round)
      .sort((a, b) => a.round - b.round);
  }

  getEvents(runId: string): EventRecord[] {
    return this.load().events.filter((e) => e.run_id === runId);
  }

  getRunDetails(runId: string): RunDetails | undefined {
    const run = this.getRun(runId);
    if (!run) return undefined;
    return {
      run,
      rounds: this.getRounds(runId),
      events: this.getEvents(runId),
    };
  }

  static deriveEvents(runId: string, rounds: RoundResult[], stopReason?: StopReasonCode): EventRecord[] {
    const now = new Date().toISOString();
    const events: EventRecord[] = [];

    for (const row of rounds) {
      events.push({
        event_id: randomUUID(),
        run_id: runId,
        type: 'phase_entered',
        payload: {
          round: row.round,
          phase_before: row.phase_before,
          phase_after: row.phase_after,
        },
        created_at: now,
      });

      events.push({
        event_id: randomUUID(),
        run_id: runId,
        type: 'gate_decision',
        payload: {
          round: row.round,
          reason: row.decision.reason,
          trace: row.decision.trace,
        },
        created_at: now,
      });
    }

    if (stopReason) {
      events.push({
        event_id: randomUUID(),
        run_id: runId,
        type: 'run_stopped',
        payload: { stop_reason: stopReason },
        created_at: now,
      });
    }

    return events;
  }

  private load(): StoreFile {
    if (!existsSync(this.filePath)) return { ...EMPTY_STORE };
    try {
      const raw = readFileSync(this.filePath, 'utf8');
      const parsed = JSON.parse(raw) as StoreFile;
      return {
        runs: parsed.runs ?? [],
        rounds: parsed.rounds ?? [],
        events: parsed.events ?? [],
      };
    } catch {
      return { ...EMPTY_STORE };
    }
  }

  private save(store: StoreFile): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(store, null, 2));
  }
}

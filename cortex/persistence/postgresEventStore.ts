import type { CortexEvent, TaskId } from "../contracts/index.js";
import type { EventStore } from "../runtime/index.js";

export interface SqlExecutor {
  query<T>(sql: string, parameters: readonly unknown[]): Promise<{ readonly rows: readonly T[] }>;
}

interface EventRow {
  readonly event_type: CortexEvent["type"];
  readonly task_id: string;
  readonly occurred_at: string;
  readonly payload: CortexEvent["payload"];
}

/**
 * Postgres adapter without a vendor-specific driver dependency. Vercel
 * Functions can inject @vercel/postgres, Neon, or another compatible executor.
 */
export class PostgresEventStore implements EventStore {
  constructor(private readonly db: SqlExecutor) {}

  async append(event: CortexEvent): Promise<void> {
    await this.db.query(
      `insert into cortex_events (event_id, task_id, event_type, occurred_at, payload)
       values ($1, $2, $3, $4, $5::jsonb)`,
      [crypto.randomUUID(), event.taskId, event.type, event.occurredAt, JSON.stringify(event.payload)],
    );
  }

  async list(taskId: TaskId): Promise<readonly CortexEvent[]> {
    const result = await this.db.query<EventRow>(
      `select event_type, task_id, occurred_at, payload
         from cortex_events
        where task_id = $1
        order by sequence asc`,
      [taskId],
    );
    return result.rows.map((row) => ({
      type: row.event_type,
      taskId: row.task_id as TaskId,
      occurredAt: row.occurred_at,
      payload: row.payload,
    }));
  }
}

-- Cortex event-sourced persistence baseline.
-- The event payload remains JSON so upstream engine event shapes are not copied
-- into the Cortex database schema.

create table if not exists cortex_tasks (
  task_id text primary key,
  user_id text not null,
  workspace_id text not null,
  prompt text not null,
  repository_url text,
  status text not null,
  policy jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists cortex_events (
  sequence bigint generated always as identity primary key,
  event_id text not null unique,
  task_id text not null references cortex_tasks(task_id) on delete cascade,
  event_type text not null,
  occurred_at timestamptz not null,
  payload jsonb not null
);

create index if not exists cortex_events_task_sequence_idx
  on cortex_events(task_id, sequence);

create table if not exists cortex_artifacts (
  artifact_id text primary key,
  task_id text not null references cortex_tasks(task_id) on delete cascade,
  artifact_type text not null,
  uri text,
  payload jsonb not null,
  created_at timestamptz not null
);

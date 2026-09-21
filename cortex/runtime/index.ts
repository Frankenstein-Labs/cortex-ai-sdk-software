import type {
  AgentContext,
  CortexEvent,
  DesignContract,
  ExecutionReport,
  PermissionAction,
  TaskId,
  WorkspaceId,
} from "../contracts/index.js";

export interface WorkspaceHandle {
  readonly id: WorkspaceId;
  readonly status: "creating" | "ready" | "stopped" | "failed";
  readonly repositoryUrl: string | null;
}

export interface WorkspaceProvider {
  create(input: {
    readonly workspaceId: WorkspaceId;
    readonly repositoryUrl: string | null;
  }): Promise<WorkspaceHandle>;
  execute(input: {
    readonly workspace: WorkspaceHandle;
    readonly command: string;
    readonly permissions: readonly PermissionAction[];
  }): Promise<{ readonly exitCode: number; readonly stdout: string; readonly stderr: string }>;
  stop(workspace: WorkspaceHandle): Promise<void>;
}

export interface DesignAgentGateway {
  analyze(input: {
    readonly prompt: string;
    readonly workspace: WorkspaceHandle;
    readonly context: AgentContext;
  }): Promise<DesignContract>;
}

export interface EngineeringAgentGateway {
  build(input: {
    readonly prompt: string;
    readonly workspace: WorkspaceHandle;
    readonly designContract: DesignContract | null;
    readonly context: AgentContext;
  }): Promise<ExecutionReport>;
}

export interface EventStore {
  append(event: CortexEvent): Promise<void>;
  list(taskId: TaskId): Promise<readonly CortexEvent[]>;
}

export class MemoryEventStore implements EventStore {
  private readonly events = new Map<TaskId, CortexEvent[]>();

  async append(event: CortexEvent): Promise<void> {
    const events = this.events.get(event.taskId) ?? [];
    events.push(event);
    this.events.set(event.taskId, events);
  }

  async list(taskId: TaskId): Promise<readonly CortexEvent[]> {
    return [...(this.events.get(taskId) ?? [])];
  }
}

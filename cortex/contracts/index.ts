export type Brand<T, Name extends string> = T & { readonly __brand: Name };

export type TaskId = Brand<string, "TaskId">;
export type RunId = Brand<string, "RunId">;
export type WorkspaceId = Brand<string, "WorkspaceId">;
export type ArtifactId = Brand<string, "ArtifactId">;
export type ApprovalId = Brand<string, "ApprovalId">;

export type AgentRole = "design" | "engineering";
export type AutonomyLevel = "assist" | "guided" | "autonomous";
export type TaskStatus =
  | "draft"
  | "planning"
  | "designing"
  | "building"
  | "validating"
  | "waiting_for_approval"
  | "completed"
  | "failed"
  | "cancelled";

export type PermissionAction =
  | "read_repository"
  | "write_files"
  | "delete_files"
  | "execute_command"
  | "install_dependency"
  | "network_access"
  | "git_commit"
  | "git_push"
  | "create_pull_request";

export interface PermissionPolicy {
  readonly autonomy: AutonomyLevel;
  readonly allowed: readonly PermissionAction[];
  readonly approvalRequired: readonly PermissionAction[];
}

export interface TaskRequest {
  readonly taskId: TaskId;
  readonly userId: string;
  readonly prompt: string;
  readonly repositoryUrl: string | null;
  readonly workspaceId: WorkspaceId;
  readonly policy: PermissionPolicy;
  readonly createdAt: string;
}

export interface RouteSpec {
  readonly path: string;
  readonly purpose: string;
  readonly states: readonly string[];
}

export interface ComponentSpec {
  readonly name: string;
  readonly purpose: string;
  readonly variants: readonly string[];
  readonly states: readonly string[];
  readonly accessibilityNotes: readonly string[];
}

export interface DesignTokenSet {
  readonly colors: Readonly<Record<string, string>>;
  readonly typography: Readonly<Record<string, string>>;
  readonly spacing: Readonly<Record<string, string>>;
  readonly radii: Readonly<Record<string, string>>;
  readonly shadows: Readonly<Record<string, string>>;
}

export interface DesignContract {
  readonly artifactId: ArtifactId;
  readonly taskId: TaskId;
  readonly productSummary: string;
  readonly routes: readonly RouteSpec[];
  readonly components: readonly ComponentSpec[];
  readonly tokens: DesignTokenSet;
  readonly interactions: readonly string[];
  readonly responsiveRules: readonly string[];
  readonly accessibilityRules: readonly string[];
  readonly visualAcceptanceCriteria: readonly string[];
  readonly sourceReferences: readonly string[];
  readonly version: number;
}

export interface ExecutionStep {
  readonly id: string;
  readonly owner: AgentRole;
  readonly title: string;
  readonly description: string;
  readonly requires: readonly PermissionAction[];
  readonly status: "pending" | "active" | "completed" | "blocked" | "failed";
}

export interface ExecutionPlan {
  readonly taskId: TaskId;
  readonly steps: readonly ExecutionStep[];
  readonly createdAt: string;
  readonly version: number;
}

export interface TaskState {
  readonly task: TaskRequest;
  readonly status: TaskStatus;
  readonly activeRole: AgentRole | null;
  readonly designContract: DesignContract | null;
  readonly executionPlan: ExecutionPlan | null;
  readonly approvals: readonly ApprovalRequest[];
  readonly updatedAt: string;
}

export interface ApprovalRequest {
  readonly id: ApprovalId;
  readonly taskId: TaskId;
  readonly action: PermissionAction;
  readonly reason: string;
  readonly status: "pending" | "approved" | "rejected";
  readonly createdAt: string;
}

export interface AgentContext {
  readonly task: TaskRequest;
  readonly state: TaskState;
  readonly permissions: PermissionPolicy;
}

export interface DesignAgent {
  readonly role: "design";
  analyze(context: AgentContext): Promise<DesignContract>;
}

export interface EngineeringAgent {
  readonly role: "engineering";
  build(context: AgentContext, contract: DesignContract | null): Promise<ExecutionReport>;
}

export interface ExecutionReport {
  readonly summary: string;
  readonly filesChanged: readonly string[];
  readonly tests: readonly TestResult[];
  readonly commit: string | null;
}

export interface TestResult {
  readonly command: string;
  readonly status: "passed" | "failed" | "skipped";
  readonly output: string;
}

export interface CortexEvent {
  readonly type:
    | "task.created"
    | "plan.created"
    | "agent.started"
    | "approval.requested"
    | "artifact.created"
    | "task.completed"
    | "task.failed";
  readonly taskId: TaskId;
  readonly occurredAt: string;
  readonly payload: unknown;
}

export const CORTEX_CONTRACT_VERSION = 1;

export function asTaskId(value: string): TaskId {
  return value as TaskId;
}

export function asRunId(value: string): RunId {
  return value as RunId;
}

export function asWorkspaceId(value: string): WorkspaceId {
  return value as WorkspaceId;
}

export function isApprovalRequired(policy: PermissionPolicy, action: PermissionAction): boolean {
  return policy.approvalRequired.includes(action);
}

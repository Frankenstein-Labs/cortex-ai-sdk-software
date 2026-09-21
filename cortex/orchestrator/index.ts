import {
  type AgentContext,
  type AgentRole,
  type ApprovalRequest,
  type CortexEvent,
  type DesignAgent,
  type DesignContract,
  type EngineeringAgent,
  type ExecutionPlan,
  type PermissionAction,
  type TaskRequest,
  type TaskState,
  type TaskStatus,
  type TaskId,
  isApprovalRequired,
} from "../contracts/index.js";

export interface CortexOrchestratorOptions {
  readonly now?: () => string;
  readonly id?: () => string;
}

export interface CortexTaskResult {
  readonly state: TaskState;
  readonly events: readonly CortexEvent[];
}

const designActions: readonly PermissionAction[] = ["read_repository", "write_files"];
const engineeringActions: readonly PermissionAction[] = [
  "read_repository",
  "write_files",
  "execute_command",
  "install_dependency",
  "git_commit",
];

export class CortexOrchestrator {
  private readonly tasks = new Map<TaskId, TaskState>();
  private readonly events = new Map<TaskId, CortexEvent[]>();
  private readonly now: () => string;
  private readonly id: () => string;
  private designAgent: DesignAgent | null = null;
  private engineeringAgent: EngineeringAgent | null = null;

  constructor(options: CortexOrchestratorOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.id = options.id ?? (() => crypto.randomUUID());
  }

  registerDesignAgent(agent: DesignAgent): void {
    this.designAgent = agent;
  }

  registerEngineeringAgent(agent: EngineeringAgent): void {
    this.engineeringAgent = agent;
  }

  createTask(task: TaskRequest): TaskState {
    if (this.tasks.has(task.taskId)) {
      throw new Error(`Task already exists: ${task.taskId}`);
    }

    const state: TaskState = {
      task,
      status: "draft",
      activeRole: null,
      designContract: null,
      executionPlan: null,
      approvals: [],
      updatedAt: this.now(),
    };
    this.tasks.set(task.taskId, state);
    this.events.set(task.taskId, [this.event("task.created", task.taskId, task)]);
    return state;
  }

  createPlan(taskId: TaskId): ExecutionPlan {
    const state = this.requireTask(taskId);
    const plan: ExecutionPlan = {
      taskId,
      createdAt: this.now(),
      version: 1,
      steps: [
        {
          id: "design",
          owner: "design",
          title: "Concevoir l’expérience produit",
          description: "Analyser la demande et produire un DesignContract exploitable.",
          requires: designActions,
          status: "pending",
        },
        {
          id: "engineering",
          owner: "engineering",
          title: "Construire le logiciel",
          description: "Implémenter le contrat de design, exécuter les tests et préparer le résultat.",
          requires: engineeringActions,
          status: "pending",
        },
        {
          id: "validation",
          owner: "engineering",
          title: "Valider et livrer",
          description: "Vérifier les critères, produire le diff et préparer la livraison.",
          requires: ["execute_command", "git_commit"],
          status: "pending",
        },
      ],
    };

    this.updateState(taskId, { status: "planning", executionPlan: plan });
    this.appendEvent(this.event("plan.created", taskId, plan));
    return plan;
  }

  async runDesign(taskId: TaskId): Promise<DesignContract> {
    const state = this.requireTask(taskId);
    if (!this.designAgent) throw new Error("No DesignAgent registered");
    this.assertAllowed(state, designActions);

    this.updateState(taskId, { status: "designing", activeRole: "design" });
    this.appendEvent(this.event("agent.started", taskId, { role: "design" satisfies AgentRole }));

    const contract = await this.designAgent.analyze(this.context(state));
    this.updateState(taskId, { status: "building", activeRole: null, designContract: contract });
    this.appendEvent(this.event("artifact.created", taskId, contract));
    return contract;
  }

  async runEngineering(taskId: TaskId): Promise<CortexTaskResult> {
    const state = this.requireTask(taskId);
    if (!this.engineeringAgent) throw new Error("No EngineeringAgent registered");
    this.assertAllowed(state, engineeringActions);

    const current = this.requireTask(taskId);
    this.updateState(taskId, { status: "building", activeRole: "engineering" });
    this.appendEvent(this.event("agent.started", taskId, { role: "engineering" satisfies AgentRole }));
    await this.engineeringAgent.build(this.context(current), current.designContract);
    this.updateState(taskId, { status: "validating", activeRole: null });
    return this.result(taskId);
  }

  requestApproval(taskId: TaskId, action: PermissionAction, reason: string): ApprovalRequest {
    const state = this.requireTask(taskId);
    if (!isApprovalRequired(state.task.policy, action)) {
      throw new Error(`Approval is not configured for action: ${action}`);
    }

    const approval: ApprovalRequest = {
      id: this.id() as ApprovalRequest["id"],
      taskId,
      action,
      reason,
      status: "pending",
      createdAt: this.now(),
    };
    this.updateState(taskId, {
      status: "waiting_for_approval",
      approvals: [...state.approvals, approval],
    });
    this.appendEvent(this.event("approval.requested", taskId, approval));
    return approval;
  }

  approve(taskId: TaskId, approvalId: ApprovalRequest["id"], approved: boolean): TaskState {
    const state = this.requireTask(taskId);
    const approvals = state.approvals.map((approval) =>
      approval.id === approvalId
        ? {
            ...approval,
            status: approved ? ("approved" as const) : ("rejected" as const),
          }
        : approval,
    );
    const nextStatus: TaskStatus = approved ? "building" : "failed";
    return this.updateState(taskId, { approvals, status: nextStatus });
  }

  getTask(taskId: TaskId): TaskState {
    return this.requireTask(taskId);
  }

  getEvents(taskId: TaskId): readonly CortexEvent[] {
    return this.events.get(taskId) ?? [];
  }

  private context(state: TaskState): AgentContext {
    return { task: state.task, state, permissions: state.task.policy };
  }

  private assertAllowed(state: TaskState, actions: readonly PermissionAction[]): void {
    const missing = actions.filter((action) => !state.task.policy.allowed.includes(action));
    if (missing.length > 0) {
      throw new Error(`Permission policy does not allow: ${missing.join(", ")}`);
    }
  }

  private updateState(taskId: TaskId, patch: Partial<TaskState>): TaskState {
    const state = this.requireTask(taskId);
    const next = { ...state, ...patch, updatedAt: this.now() };
    this.tasks.set(taskId, next);
    return next;
  }

  private result(taskId: TaskId): CortexTaskResult {
    return { state: this.requireTask(taskId), events: this.getEvents(taskId) };
  }

  private requireTask(taskId: TaskId): TaskState {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Unknown task: ${taskId}`);
    return task;
  }

  private appendEvent(event: CortexEvent): void {
    this.events.get(event.taskId)?.push(event);
  }

  private event(type: CortexEvent["type"], taskId: TaskId, payload: unknown): CortexEvent {
    return { type, taskId, occurredAt: this.now(), payload };
  }
}

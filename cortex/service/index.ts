import {
  CortexOrchestrator,
  type CortexTaskResult,
} from "../orchestrator/index.js";
import type {
  ApprovalId,
  DesignAgent,
  EngineeringAgent,
  RunId,
  TaskId,
  TaskRequest,
  TaskState,
} from "../contracts/index.js";

export interface CortexServiceOptions {
  readonly orchestrator?: CortexOrchestrator;
}

export class CortexService {
  readonly orchestrator: CortexOrchestrator;

  constructor(options: CortexServiceOptions = {}) {
    this.orchestrator = options.orchestrator ?? new CortexOrchestrator();
  }

  registerDesignAgent(agent: DesignAgent): void {
    this.orchestrator.registerDesignAgent(agent);
  }

  registerEngineeringAgent(agent: EngineeringAgent): void {
    this.orchestrator.registerEngineeringAgent(agent);
  }

  createTask(task: TaskRequest): TaskState {
    return this.orchestrator.createTask(task);
  }

  planTask(taskId: TaskId) {
    return this.orchestrator.createPlan(taskId);
  }

  async designTask(taskId: TaskId) {
    return this.orchestrator.runDesign(taskId);
  }

  async buildTask(taskId: TaskId): Promise<CortexTaskResult> {
    return this.orchestrator.runEngineering(taskId);
  }

  getTask(taskId: TaskId): TaskState {
    return this.orchestrator.getTask(taskId);
  }

  getEvents(taskId: TaskId) {
    return this.orchestrator.getEvents(taskId);
  }

  approveToolCall(taskId: TaskId, approvalId: string, approved: boolean): TaskState {
    return this.orchestrator.approve(taskId, approvalId as ApprovalId, approved);
  }

  resumeRun(_runId: RunId): never {
    throw new Error("Durable resume is not connected yet; use Vercel Workflows adapter");
  }
}

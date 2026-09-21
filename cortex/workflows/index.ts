import type { CortexTaskResult } from "../orchestrator/index.js";
import type { TaskId } from "../contracts/index.js";
import { CortexService } from "../service/index.js";

export interface DurableRunContext {
  readonly runId: string;
  readonly taskId: TaskId;
  readonly signal?: AbortSignal;
}

export interface DurableWorkflowPort {
  run(context: DurableRunContext): Promise<CortexTaskResult>;
  waitForApproval(context: DurableRunContext, approvalId: string): Promise<boolean>;
}

/**
 * Framework-neutral workflow implementation. A Vercel Workflows adapter can
 * wrap each phase in a durable step and map waitForApproval to a hook.
 */
export class CortexTaskWorkflow implements DurableWorkflowPort {
  constructor(private readonly service: CortexService) {}

  async run(context: DurableRunContext): Promise<CortexTaskResult> {
    this.service.planTask(context.taskId);
    await this.service.designTask(context.taskId);
    return this.service.buildTask(context.taskId);
  }

  async waitForApproval(context: DurableRunContext, approvalId: string): Promise<boolean> {
    const state = this.service.getTask(context.taskId);
    const approval = state.approvals.find((item) => item.id === approvalId);
    if (!approval) throw new Error(`Unknown approval: ${approvalId}`);
    return approval.status === "approved";
  }
}

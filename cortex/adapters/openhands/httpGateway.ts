import type {
  AgentContext,
  DesignContract,
  ExecutionReport,
} from "../../contracts/index.js";
import { JsonHttpClient } from "../httpJson.js";
import type { EngineeringAgentGateway, WorkspaceHandle } from "../../runtime/index.js";

export interface OpenHandsHttpGatewayOptions {
  readonly client: JsonHttpClient;
  readonly buildPath: string;
}

export class OpenHandsHttpGateway implements EngineeringAgentGateway {
  constructor(private readonly options: OpenHandsHttpGatewayOptions) {}

  build(input: {
    readonly prompt: string;
    readonly workspace: WorkspaceHandle;
    readonly designContract: DesignContract | null;
    readonly context: AgentContext;
  }): Promise<ExecutionReport> {
    return this.options.client.post<ExecutionReport>(this.options.buildPath, {
      prompt: input.prompt,
      workspaceId: input.workspace.id,
      taskId: input.context.task.taskId,
      designContract: input.designContract,
      permissions: input.context.permissions,
      delivery: "execution-report",
    });
  }
}

import type { AgentContext, DesignContract } from "../../contracts/index.js";
import { JsonHttpClient } from "../httpJson.js";
import type { DesignAgentGateway, WorkspaceHandle } from "../../runtime/index.js";

export interface OpenDesignHttpGatewayOptions {
  readonly client: JsonHttpClient;
  readonly analyzePath: string;
}

export class OpenDesignHttpGateway implements DesignAgentGateway {
  constructor(private readonly options: OpenDesignHttpGatewayOptions) {}

  analyze(input: {
    readonly prompt: string;
    readonly workspace: WorkspaceHandle;
    readonly context: AgentContext;
  }): Promise<DesignContract> {
    return this.options.client.post<DesignContract>(this.options.analyzePath, {
      prompt: input.prompt,
      workspaceId: input.workspace.id,
      taskId: input.context.task.taskId,
      output: "design-contract",
      permissions: input.context.permissions,
    });
  }
}

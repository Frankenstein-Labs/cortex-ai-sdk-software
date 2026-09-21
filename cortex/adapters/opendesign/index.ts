import type {
  AgentContext,
  DesignAgent,
  DesignContract,
} from "../../contracts/index.js";
import type { DesignAgentGateway, WorkspaceHandle } from "../../runtime/index.js";

export interface OpenDesignAdapterOptions {
  readonly workspace: WorkspaceHandle;
  readonly gateway: DesignAgentGateway;
}

/**
 * Cortex-owned boundary around the OpenDesign runtime.
 * The upstream daemon stays vendor-owned; Cortex decides when and with what
 * permissions it may be called.
 */
export class OpenDesignAdapter implements DesignAgent {
  readonly role = "design" as const;

  constructor(private readonly options: OpenDesignAdapterOptions) {}

  analyze(context: AgentContext): Promise<DesignContract> {
    return this.options.gateway.analyze({
      prompt: context.task.prompt,
      workspace: this.options.workspace,
      context,
    });
  }
}

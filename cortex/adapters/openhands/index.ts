import type {
  AgentContext,
  DesignContract,
  EngineeringAgent,
  ExecutionReport,
} from "../../contracts/index.js";
import type { EngineeringAgentGateway, WorkspaceHandle } from "../../runtime/index.js";

export interface OpenHandsAdapterOptions {
  readonly workspace: WorkspaceHandle;
  readonly gateway: EngineeringAgentGateway;
}

/**
 * Cortex-owned boundary around the OpenHands SDK / Agent Server.
 * No provider process is spawned here: the gateway will later target a
 * managed Agent Server or a Vercel Sandbox-backed execution service.
 */
export class OpenHandsAdapter implements EngineeringAgent {
  readonly role = "engineering" as const;

  constructor(private readonly options: OpenHandsAdapterOptions) {}

  build(context: AgentContext, contract: DesignContract | null): Promise<ExecutionReport> {
    return this.options.gateway.build({
      prompt: context.task.prompt,
      workspace: this.options.workspace,
      designContract: contract,
      context,
    });
  }
}

export interface CortexVercelConfig {
  readonly workflowBaseUrl: string;
  readonly sandboxBaseUrl: string;
  readonly eventStore: "postgres" | "memory";
  readonly modelGateway: "vercel-ai-gateway" | "external";
}

export function loadVercelConfig(env: Record<string, string | undefined>): CortexVercelConfig {
  const workflowBaseUrl = required(env, "CORTEX_WORKFLOW_BASE_URL");
  const sandboxBaseUrl = required(env, "CORTEX_SANDBOX_BASE_URL");
  const eventStore = env.CORTEX_EVENT_STORE === "memory" ? "memory" : "postgres";
  const modelGateway = env.CORTEX_MODEL_GATEWAY === "external" ? "external" : "vercel-ai-gateway";

  return { workflowBaseUrl, sandboxBaseUrl, eventStore, modelGateway };
}

function required(env: Record<string, string | undefined>, name: string): string {
  const value = env[name];
  if (!value) throw new Error(`Missing required Cortex deployment variable: ${name}`);
  return value;
}

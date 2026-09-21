import {
  CortexOrchestrator,
  asTaskId,
  asWorkspaceId,
  type DesignContract,
  type DesignAgent,
  type EngineeringAgent,
  type TaskRequest,
} from "../index.js";

function equal(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

async function rejects(action: () => Promise<unknown>, pattern: RegExp): Promise<void> {
  try {
    await action();
  } catch (error) {
    if (pattern.test(error instanceof Error ? error.message : String(error))) return;
    throw new Error(`Unexpected error: ${String(error)}`);
  }
  throw new Error("Expected action to reject");
}

async function designToEngineeringFlow(): Promise<void> {
  const task: TaskRequest = {
    taskId: asTaskId("task_smoke"),
    userId: "user_smoke",
    prompt: "Build a dashboard from the product brief",
    repositoryUrl: "https://github.com/example/project",
    workspaceId: asWorkspaceId("workspace_smoke"),
    policy: {
      autonomy: "guided",
      allowed: ["read_repository", "write_files", "execute_command", "install_dependency", "git_commit"],
      approvalRequired: ["git_push"],
    },
    createdAt: "2026-09-21T00:00:00.000Z",
  };

  const contract: DesignContract = {
    artifactId: "artifact_smoke" as DesignContract["artifactId"],
    taskId: task.taskId,
    productSummary: "A dashboard",
    routes: [{ path: "/dashboard", purpose: "Show metrics", states: ["loading", "ready"] }],
    components: [],
    tokens: { colors: {}, typography: {}, spacing: {}, radii: {}, shadows: {} },
    interactions: [],
    responsiveRules: [],
    accessibilityRules: [],
    visualAcceptanceCriteria: ["The dashboard is readable on mobile"],
    sourceReferences: [],
    version: 1,
  };

  let received: DesignContract | null = null;
  const designAgent: DesignAgent = { role: "design", analyze: async () => contract };
  const engineeringAgent: EngineeringAgent = {
    role: "engineering",
    build: async (_context, designContract) => {
      received = designContract;
      return { summary: "ok", filesChanged: [], tests: [], commit: null };
    },
  };

  const orchestrator = new CortexOrchestrator({
    now: () => "2026-09-21T00:00:00.000Z",
    id: () => "approval_smoke",
  });
  orchestrator.registerDesignAgent(designAgent);
  orchestrator.registerEngineeringAgent(engineeringAgent);
  orchestrator.createTask(task);
  orchestrator.createPlan(task.taskId);
  await orchestrator.runDesign(task.taskId);
  await orchestrator.runEngineering(task.taskId);

  equal((received as DesignContract | null)?.productSummary, "A dashboard", "design handoff");
  equal(orchestrator.getTask(task.taskId).status, "validating", "final status");
  equal(
    orchestrator.getEvents(task.taskId).some((event) => event.type === "artifact.created"),
    true,
    "artifact event",
  );
}

async function permissionBoundary(): Promise<void> {
  const task: TaskRequest = {
    taskId: asTaskId("task_denied"),
    userId: "user_smoke",
    prompt: "Modify the repository",
    repositoryUrl: null,
    workspaceId: asWorkspaceId("workspace_denied"),
    policy: { autonomy: "assist", allowed: ["read_repository"], approvalRequired: [] },
    createdAt: "2026-09-21T00:00:00.000Z",
  };
  const orchestrator = new CortexOrchestrator();
  orchestrator.registerDesignAgent({ role: "design", analyze: async () => { throw new Error("not called"); } });
  orchestrator.createTask(task);
  await rejects(() => orchestrator.runDesign(task.taskId), /does not allow/);
}

await designToEngineeringFlow();
await permissionBoundary();
console.log("Cortex orchestration smoke tests passed");

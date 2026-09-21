import { CortexService } from "../service/index.js";
import { asTaskId, type CreateTaskInput, type TaskRequest } from "../contracts/index.js";

export interface CortexApiRequest {
  readonly method: "GET" | "POST";
  readonly path: string;
  readonly body?: unknown;
}

export interface CortexApiResponse {
  readonly status: number;
  readonly body: unknown;
}

export interface CortexApiOptions {
  readonly service: CortexService;
  readonly createTaskRequest?: (input: CreateTaskInput) => TaskRequest;
}

export function handleCortexRequest(
  request: CortexApiRequest,
  options: CortexApiOptions,
): Promise<CortexApiResponse> {
  const { service } = options;
  const taskMatch = /^\/api\/cortex\/tasks\/([^/]+)$/.exec(request.path);
  const eventsMatch = /^\/api\/cortex\/tasks\/([^/]+)\/events$/.exec(request.path);
  const approvalMatch = /^\/api\/cortex\/tasks\/([^/]+)\/approvals\/([^/]+)$/.exec(request.path);

  if (request.method === "POST" && request.path === "/api/cortex/tasks") {
    const input = request.body as CreateTaskInput;
    const task = service.createTask(
      options.createTaskRequest?.(input) ?? defaultTaskRequest(input),
    );
    const plan = service.planTask(task.task.taskId);
    return Promise.resolve({ status: 201, body: { task, plan } });
  }

  if (request.method === "GET" && taskMatch) {
    const taskId = asTaskId(taskMatch[1]!);
    return Promise.resolve({ status: 200, body: service.getTask(taskId) });
  }

  if (request.method === "GET" && eventsMatch) {
    const taskId = asTaskId(eventsMatch[1]!);
    return Promise.resolve({ status: 200, body: service.getEvents(taskId) });
  }

  if (request.method === "POST" && approvalMatch) {
    const taskId = asTaskId(approvalMatch[1]!);
    const approved = (request.body as { approved?: boolean }).approved === true;
    return Promise.resolve({
      status: 200,
      body: service.approveToolCall(taskId, approvalMatch[2]!, approved),
    });
  }

  return Promise.resolve({ status: 404, body: { error: "Cortex route not found" } });
}

function defaultTaskRequest(input: CreateTaskInput): TaskRequest {
  const now = new Date().toISOString();
  return {
    taskId: asTaskId(`task_${Date.now()}`),
    userId: "anonymous",
    prompt: input.prompt,
    repositoryUrl: null,
    workspaceId: input.workspaceId,
    policy: {
      autonomy: "guided",
      allowed: ["read_repository", "write_files"],
      approvalRequired: ["delete_files", "execute_command", "git_push"],
    },
    createdAt: now,
  };
}

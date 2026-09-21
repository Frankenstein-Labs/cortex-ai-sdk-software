import { handleCortexRequest } from "../api/index.js";
import type { CortexService } from "../service/index.js";

export interface VercelCortexHandlerOptions {
  readonly service: CortexService;
}

/**
 * Thin Vercel adapter. Persistence, agents, and workspace providers are
 * injected by the application entrypoint rather than created in this module.
 */
export function createVercelCortexHandler(options: VercelCortexHandlerOptions) {
  return async function handler(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const body = request.method === "POST" ? await request.json().catch(() => undefined) : undefined;
    const result = await handleCortexRequest(
      {
        method: request.method === "POST" ? "POST" : "GET",
        path: url.pathname,
        body,
      },
      { service: options.service },
    );

    return Response.json(result.body, { status: result.status });
  };
}

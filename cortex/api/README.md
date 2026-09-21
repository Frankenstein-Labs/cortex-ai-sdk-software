# Cortex API boundary

`handleCortexRequest` is a framework-neutral request handler for the first Cortex routes:

- `POST /api/cortex/tasks` creates a task and execution plan;
- `GET /api/cortex/tasks/:taskId` reads task state;
- `GET /api/cortex/tasks/:taskId/events` reads the event stream snapshot;
- `POST /api/cortex/tasks/:taskId/approvals/:approvalId` records an approval decision.

The handler does not own HTTP framework details. A Vercel Function can translate `Request`/`Response` to `CortexApiRequest`/`CortexApiResponse`, while tests and a local server can use the same service.

Production persistence and durable execution will replace the in-memory state through the `EventStore` and Workflow boundaries without changing these routes.

# Cortex integration boundary

## Runtime sequence

1. Cortex creates a task and a workspace.
2. Cortex creates an execution plan.
3. `OpenDesignAdapter` calls the OpenDesign gateway and expects a versioned `DesignContract`.
4. Cortex validates the contract and records it as an artifact.
5. `OpenHandsAdapter` receives the prompt, workspace, permissions, and design contract.
6. The engineering gateway returns an `ExecutionReport` with files, tests, and an optional commit.
7. Cortex records events and waits for approval before configured sensitive actions.

## Deployment boundary

- The web/API layer will run on Vercel Functions.
- Durable task coordination will run through Vercel Workflows or an equivalent durable runtime.
- `WorkspaceProvider` will target Vercel Sandbox first.
- `EventStore` will target Postgres in production; `MemoryEventStore` is for tests and local development.
- `JsonHttpClient` is intentionally generic. The exact upstream endpoint path is configuration, not a hardcoded assumption about OpenHands or OpenDesign internals.

## Security boundary

The model never receives database credentials or unrestricted host access. Every engine call receives a `PermissionPolicy`, and commands are executed through a workspace provider. The engine gateways do not create processes directly; process execution belongs behind the workspace/sandbox boundary.

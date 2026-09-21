# Cortex persistence and durable execution

The SQL schema stores the task projection, append-only execution events, and artifacts. Event payloads remain JSON so Cortex can evolve independently from OpenHands and OpenDesign event types.

`PostgresEventStore` accepts a small SQL executor interface. This keeps the core package independent from a particular Postgres driver while allowing a Vercel deployment to inject the selected Postgres integration.

`CortexTaskWorkflow` defines the durable sequence:

1. create the execution plan;
2. run OpenDesign and store the `DesignContract`;
3. run OpenHands with the contract;
4. record the execution report;
5. pause on approval hooks when a policy requires it.

The production Vercel adapter should map these phases to durable workflow steps and external approval hooks. It must never hold task state only in function memory.

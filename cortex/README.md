# Cortex Core

Cortex Core is the owner of task orchestration, permissions, state, and agent coordination.

## Agent responsibilities

- **DesignAgent**: understands product and visual intent and produces a structured `DesignContract`.
- **EngineeringAgent**: consumes the design contract, changes code in a workspace, runs tests, and prepares a delivery report.
- **CortexOrchestrator**: selects the role, creates the execution plan, enforces the permission policy, records events, and owns task state.

Neither upstream engine owns Cortex. The OpenHands and OpenDesign integrations will implement the agent interfaces from this package.

## Design contract

The `DesignContract` is the handoff artifact between design intelligence and software engineering. It contains routes, components, tokens, interactions, responsive rules, accessibility requirements, visual acceptance criteria, and source references.

## Current boundary

The initial orchestrator is deliberately provider-neutral and side-effect controlled. It does not spawn a process, write a repository, call a model, or access a sandbox. Those actions will be implemented behind explicit adapters and the permission policy in the next phase.

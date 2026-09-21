# Cortex AI SDK Software

Cortex AI SDK Software is the engine foundation for the Cortex web platform.

This repository intentionally contains **engine code only**. The product interface is developed separately. The initial foundation vendors two upstream projects in isolated directories:

- `engines/openhands-sdk`: OpenHands Software Agent SDK, Agent Server, tools, workspaces, and TypeScript client.
- `engines/opendesign-runtime`: OpenDesign daemon and runtime packages, without its desktop shell, web UI, design systems, or templates.

The two engines are preserved as separate upstream-derived sources for evaluation and integration. They are not yet merged into one runtime. The next development phase will define Cortex-owned adapters, permissions, task contracts, sandbox providers, and a Vercel deployment boundary around them.

## Source and licensing

See [`THIRD_PARTY/SOURCES.md`](THIRD_PARTY/SOURCES.md) and the included upstream license files before modifying or redistributing vendor-derived code.

## Planned Cortex layers

```text
Cortex API / Workflows
        ↓
Cortex-owned agent orchestration and permissions
        ↓
OpenHands SDK adapter + OpenDesign runtime adapter
        ↓
Vercel Sandbox or another isolated workspace provider
```

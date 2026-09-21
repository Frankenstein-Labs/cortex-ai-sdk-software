# Vendored engine sources

This repository vendors source snapshots for engine development only. Product UI, desktop shells, design systems, templates, screenshots, and marketing assets are intentionally excluded.

## OpenHands Software Agent SDK

- Repository: https://github.com/OpenHands/software-agent-sdk
- Snapshot commit: `5b2bb2a659b84f09e9802bb4ece775e494e5f2bf`
- Included: Python SDK, tools, workspace packages, Agent Server, TypeScript client
- License: MIT — see `OPENHANDS-LICENSE`

## OpenDesign runtime

- Repository: https://github.com/nexu-io/open-design
- Snapshot commit: `f2e649efb2bebf86e2d047b1d5ff7a404fbda5d1`
- Included: daemon and runtime/platform packages needed for engine work
- Excluded: `apps/web`, `apps/desktop`, `apps/packaged`, design systems, templates, screenshots, and product UI
- License: Apache-2.0 — see `OPENDESIGN-LICENSE`

These snapshots remain attributable to their original projects. Changes made under `engines/` must preserve the applicable upstream license and notices.

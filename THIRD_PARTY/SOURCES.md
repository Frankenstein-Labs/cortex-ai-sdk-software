# Vendored engine sources

This repository contains both complete upstream source snapshots under `upstream/` and curated runtime foundations under `engines/`. The complete snapshots are provided so Cortex can inspect, build, test, and integrate the real upstream projects without relying on external clones.

## OpenHands Software Agent SDK

- Repository: https://github.com/OpenHands/software-agent-sdk
- Snapshot commit: `5b2bb2a659b84f09e9802bb4ece775e494e5f2bf`
- Complete source: `upstream/openhands-software-agent-sdk/`
- Curated runtime source: `engines/openhands-sdk/`
- License: MIT — see `THIRD_PARTY/OPENHANDS-LICENSE` and the upstream snapshot's `LICENSE`

## OpenDesign

- Repository: https://github.com/nexu-io/open-design
- Snapshot commit: `f2e649efb2bebf86e2d047b1d5ff7a404fbda5d1`
- Complete source: `upstream/open-design/`
- Curated runtime source: `engines/opendesign-runtime/`
- License: Apache-2.0 — see `THIRD_PARTY/OPENDESIGN-LICENSE` and the upstream snapshot's `LICENSE`

The `upstream/` directories include the complete upstream repositories, including their original UI, desktop, design-system, template, test, and documentation code. The curated `engines/` directories remain the initial engine-only extraction for Cortex integration. Upstream source is attributed to its original projects and must retain all applicable notices.

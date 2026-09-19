# SatQuery AI Geospatial Workstation

## Goal
Build a production-quality, map-first React interface that presents Python backend data without duplicating geospatial or AI logic. Until the API is connected, every simulated response will be clearly labeled as demo data and isolated behind one replaceable adapter.

## User experience
- Create a responsive three-panel workstation: session and dataset controls, a dominant geospatial map, and an intelligence panel.
- Make the SIH demo path obvious: choose a raster, select a draft ROI, submit it for validation, ask a query, inspect the returned result and evidence, then save or branch the session.
- Use a restrained dark cartographic visual system with dense, legible typography, clear status colors, and only subtle functional motion.
- Collapse the side panels into accessible mobile drawers while preserving the map as the primary workspace.

## Interface scope
- **Workspace sidebar:** session search, filtering, tags, archive/restore/delete confirmation, checkpoints, fork/compare actions, dataset context, explicit temporal date selection, and backend-driven layer controls.
- **Geo workspace:** MapLibre map, zoom and navigation, polygon/rectangle drawing, draft-versus-validated ROI styling, clear/edit controls, layer opacity, legends, warnings, and backend overlay support.
- **Intelligence panel:** visible active context, conversation history, query composer, structured result renderer, all declared domain status states, evidence inspector, provenance timeline, and JSON export only when supplied.
- **Feedback:** contextual loading, empty, error, permission, unsupported, clarification, and insufficient-data states shown where they matter rather than only as notifications.

## Data and architecture
- Keep this repository frontend-only. Do not create or modify Python services, persistence, scientific processing, evidence generation, or Nemotron logic.
- Create exactly one data-access boundary under `src/api`: centralized flexible types, `SatQueryAdapter`, `demoAdapter`, and `realAdapter`. UI code never calls `fetch` directly.
- Match only the documented operations and exact flexible `ToolResult` envelope. Unsupported or undocumented capabilities remain explicit interface TODOs rather than browser implementations.
- Never silently fall back from the real adapter to demo data. Show a persistent system indicator for `Backend: Connected`, `Backend: Disconnected`, or `Demo Mode — Backend not connected`.
- Keep demo content isolated in `demoAdapter.ts`, unmistakably labeled, and free of fabricated measurements, dates, sensors, imagery, evidence, provenance, or scientific conclusions.
- Use TanStack Query for raster context, tools, sessions, evidence, validated ROI, and query mutations. Keep viewport, draft ROI, panel visibility, opacity, and layer visibility local.
- Lazy-load the browser-only map implementation to preserve server rendering safety.
- Break the interface into focused workspace, map, intelligence, status, evidence, provenance, and session components.

## Safety constraints
- No NDVI, NDWI, raster, temporal, spatial, crop, or context-resolution calculations in the browser.
- No fabricated scientific overlays or conclusions. Derived layers remain unavailable until the Python backend supplies them.
- Draft ROI is always visually distinct from backend-validated ROI and never treated as authoritative.
- Evidence and provenance are rendered only when supplied; export appears only when evidence JSON exists.
- All domain statuses are first-class result states, not automatically frontend errors.
- No provider credentials, environment details, filesystem paths, or direct NVIDIA/Nemotron calls in client code.
- Only `cotton` appears as currently supported crop guidance.

## Verification
- Check compilation through the project harness.
- Exercise desktop and mobile layouts in the running preview.
- Verify the adapter is the only data-access path and real-backend failures never fall back to simulated scientific results.
- Verify the demo query, draft/validated ROI controls, evidence availability rules, all domain statuses, session actions, delete confirmation, accessible mobile drawers, and absence of browser console errors.
- Confirm the home page metadata is unique and SatQuery-specific.

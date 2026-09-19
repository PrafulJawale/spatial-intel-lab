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
- Define strict TypeScript contracts matching only the documented `ToolResult` envelope and API operations; keep optional and nullable fields safe.
- Add an adapter boundary with `real` and `demo` implementations. The real adapter calls the documented Python endpoints; the demo adapter is visibly identified and returns fixture-shaped presentation data without claiming real analysis.
- Use TanStack Query for raster context, tools, sessions, evidence, validated ROI, and query mutations. Keep viewport, draft ROI, panel visibility, opacity, and layer visibility local.
- Lazy-load the browser-only map implementation to preserve server rendering safety.
- Break the interface into focused workspace, map, intelligence, status, evidence, provenance, and session components.

## Safety constraints
- No NDVI, NDWI, raster, temporal, spatial, crop, or context-resolution calculations in the browser.
- No invented production values or evidence; demo fixtures remain explicitly marked and never mix with real responses.
- No provider credentials, environment details, filesystem paths, or direct NVIDIA/Nemotron calls in client code.
- Only `cotton` appears as currently supported crop guidance.

## Verification
- Check compilation through the project harness.
- Exercise desktop and mobile layouts in the running preview.
- Verify the demo query, ROI controls, evidence expansion/export, status rendering, session actions, delete confirmation, panel controls, and absence of browser console errors.
- Confirm the home page metadata is unique and SatQuery-specific.

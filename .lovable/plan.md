# Map Experience Revision

## Goal
Upgrade only SatQuery’s map and nearby controls into a global Earth-observation workspace while preserving the adapter boundary, ROI workflow, sessions, intelligence, evidence, and all backend-authoritative analysis behavior.

## Map experience
- Open on a true MapLibre globe centered globally near `[0, 20]`, with whole-Earth framing, natural rotation/pan/zoom, and a restrained space background.
- Add real projection switching between MapLibre `globe` and `mercator`, preserving the current camera where practical.
- Add independent Satellite and Streets basemaps. Satellite uses legitimate visible-color public imagery with required attribution; Streets remains a readable global reference map.
- Keep draft and validated ROI sources above either basemap and preserve all current drawing and validation behavior.

## Search and controls
- Add a centralized, replaceable frontend geocoding service with debounced worldwide search and coordinate parsing.
- Selecting a result flies the map to it and places a temporary navigation marker; it never creates an ROI or starts analysis.
- Reorganize the map controls into a compact responsive toolbar: search, projection, basemap, then select/polygon/rectangle/edit/clear and Validate ROI.
- Add a compact status strip for projection, basemap, ROI state, and backend mode.

## Layer clarity
- Separate basemap controls from analytical-overlay controls in the sidebar.
- Keep RGB, False Color, NDVI, NDWI, Temporal Change, and Analysis Overlays unavailable until supplied by the Python backend, with explicit backend-not-connected copy.

## Architecture and verification
- Keep all changes frontend-only and do not add scientific calculations, generated overlays, evidence, or backend behavior.
- Verify globe curvature, projection switching, both basemaps, search/fly-to/marker behavior, ROI drawing and validation, desktop/mobile layouts, attribution, and browser errors in the running preview.

# SatQuery AI Workspace

Build a production-quality React + TypeScript frontend for SatQuery AI, an SIH 2026 geospatial intelligence application.

CRITICAL ARCHITECTURE RULE

This frontend is a presentation and interaction layer over an existing Python backend.

DO NOT:

rebuild the backend

replace the backend

duplicate the Python analysis engine

implement NDVI calculations in JavaScript

implement NDWI calculations in JavaScript

implement raster processing in JavaScript

implement temporal geospatial calculations in JavaScript

implement crop suitability calculations in JavaScript

generate fake satellite results

generate fake evidence

invent statistics, coordinates, dates, thresholds, datasets, or citations

expose NVIDIA/Nemotron API keys in the browser

create a second AI reasoning system

The Python deterministic geospatial engine is the source of truth.

Nemotron/NVIDIA is only a constrained planner/explainer. It does not perform or invent geospatial calculations.

The frontend must display what the backend actually returns.

PRODUCT

SatQuery AI is a conversational geospatial intelligence assistant.

The user should be able to interact naturally with satellite/geospatial data through:

conversational queries

interactive maps

ROI selection

NDVI analysis

NDWI analysis

temporal NDVI comparison

spatial queries

multi-condition spatial queries

crop suitability analysis

evidence

provenance

persistent sessions

The application should feel like a professional geospatial intelligence workstation, not a generic AI chatbot.

VISUAL DIRECTION

Create a polished, modern, technical geospatial interface.

Desired characteristics:

map-first

professional

dark/neutral technical visual language

excellent typography

high information density without clutter

clear visual hierarchy

subtle animations only where useful

responsive

accessible

credible for an SIH technical demonstration

Avoid:

generic ChatGPT clone styling

excessive gradients

excessive glassmorphism

fake futuristic decorations

fake statistics

fake satellite imagery

decorative dashboard cards with meaningless numbers

unnecessary animations

The UI should immediately communicate:

SATELLITE DATA → ANALYSIS → EVIDENCE

MAIN LAYOUT

Use a three-panel desktop workspace.

LEFT SIDEBAR

Include:

SatQuery branding

SatQuery AI

Subtitle:

Interactive Geospatial Intelligence

Session Browser

Support:

New Session

Save

Load

Search

Filter

Tags

Archive

Restore

Delete with confirmation

Checkpoints

Fork

Compare

Dataset Context

Show only information supplied by the backend.

Examples:

active raster

dataset/source

acquisition date

CRS

resolution

band mapping status

ROI status

Temporal Context

Show:

Before date

After date

temporal pair status

Never automatically select dates.

Layer Controls

Support layers only when the backend provides them:

Satellite / base map

RGB

False Color

NDVI

NDWI

Temporal Change

Analysis overlays

CENTER — GEO WORKSPACE

The center of the application should be dominated by an interactive map.

Use a modern map library such as MapLibre GL JS.

The frontend may handle:

map viewport

zoom

pan

drawing UI

temporary ROI geometry

layer visibility

opacity

legends

But the backend remains authoritative for:

validated ROI

raster analysis

geospatial calculations

analysis overlays

derived results

ROI

Allow users to:

draw polygon

draw rectangle

clear ROI

edit ROI

Display:

draft ROI

validated ROI

ROI warnings

ROI usability

After submission, display the backend's validated ROI state.

Do not treat the browser's draft geometry as authoritative.

RIGHT PANEL — INTELLIGENCE

The right panel contains:

Conversation

Example user queries:

"Calculate NDVI for this area."

"Compare vegetation between these two dates."

"Can cotton be grown here?"

"Show areas satisfying these conditions."

The frontend sends the natural-language query to the backend.

It does NOT answer the query itself.

RESULT CARDS

Render structured backend results.

Examples:

NDVI Analysis

Show backend-provided:

result

statistics

source

date

ROI

warnings

evidence availability

NDWI Analysis

Show backend-provided water-index information.

Do NOT label NDWI as flood detection.

Temporal Analysis

Show:

before

after

change

dates

evidence

limitations

Only display values actually returned by the backend.

Crop Suitability

Currently supported crop:

cotton

Do not present unsupported crops as supported.

Render:

result

conditions

evidence

limitations

data availability

Spatial / Multi-condition

Render:

conditions

thresholds

matched area

insufficient area

evidence

warnings

Unknown/insufficient data must remain visibly different from a non-match.

BACKEND STATUS HANDLING

The backend can return these domain statuses:

OK

NEEDS_ROI

NEEDS_NDVI_CONFIRMATION

NEEDS_TWO_DATES

NO_TEMPORAL_OVERLAP

NEEDS_THRESHOLD

NO_VALID_PIXELS

INSUFFICIENT_DATA

PARTIAL_DATA

UNSUPPORTED

UNSUPPORTED_CROP

UNSUPPORTED_CONDITION

UNKNOWN

ERROR

NEEDS_CLARIFICATION

Build dedicated UI states for these.

For example:

NEEDS_ROI

Show:

"Select an area on the map to continue."

with a clear action pointing to ROI selection.

NEEDS_TWO_DATES

Show a date-selection interface.

UNSUPPORTED_CROP

Clearly explain that the requested crop is not currently supported.

INSUFFICIENT_DATA

Explain that the available data is insufficient.

Do NOT turn these into fake successful results.

EVIDENCE

Evidence is a first-class part of SatQuery.

Create an expandable Evidence Inspector.

Show backend-provided information such as:

dataset/source

acquisition date

bands

index

tool used

parameters

thresholds

threshold provenance

CRS

resolution

grid alignment

counts

limitations

warnings

analysis boundary

provenance

Clearly separate:

AI explanation

from

deterministic evidence

The UI must make it obvious that evidence comes from the analysis backend.

Provide JSON evidence export if the backend exposes it.

Never invent evidence.

PROVENANCE

Create a visual provenance timeline such as:

User Query
↓
Planner
↓
Tool
↓
Dataset
↓
Analysis
↓
Evidence
↓
Result

Only display stages and metadata actually supported by the backend.

CONVERSATION CONTEXT

Create a visible context indicator.

For example:

ACTIVE CONTEXT

✓ ROI selected
✓ Dataset loaded
✓ NDVI mapping confirmed
○ Temporal pair not selected


If a follow-up query inherits previous context, make that clear.

Example:

User:

"Calculate NDVI here."

Then:

"Now compare it with last month."

The UI should show that the second query is using conversational context.

Do not duplicate backend context-resolution logic in React.

API ARCHITECTURE

Assume a thin Python API bridge will expose:

POST /api/workspaces

GET /api/workspaces/{id}/raster

PUT /api/workspaces/{id}/roi

GET /api/tools

POST /api/workspaces/{id}/query

GET /api/workspaces/{id}/layers/{layer}

GET /api/workspaces/{id}/evidence/latest

Session endpoints under:

/api/sessions

Use typed TypeScript API clients.

Do not invent undocumented response fields.

For query execution, send:

{
"query": "natural language query"
}

The query response is based on the backend ToolResult envelope:

{
"call_id": "...",
"tool_name": "...",
"status": "...",
"result": {},
"evidence": {},
"warnings": [],
"message": "...",
"error": {}
}

Treat nullable fields correctly.

COMPONENT ARCHITECTURE

Create a clean modular structure similar to:

AppShell
├── WorkspaceSidebar
│ ├── SessionBrowser
│ ├── DatasetContext
│ ├── TemporalPairSelector
│ └── LayerControl
│
├── GeoWorkspace
│ ├── MapToolbar
│ ├── ROISelector
│ ├── MapLegend
│ └── AnalysisOverlay
│
└── IntelligencePanel
├── ContextIndicator
├── MessageList
├── QueryComposer
├── AnalysisResultCard
├── StatusIndicator
├── EvidencePanel
└── ProvenancePanel

Use reusable components rather than putting everything into one large component.

STATE MANAGEMENT

Use TanStack Query for server state.

Frontend-local state should contain things such as:

map viewport

map layer visibility

opacity

draft ROI

UI panels

temporary loading state

Backend should remain authoritative for:

conversation state

validated ROI

raster context

analysis results

evidence

sessions

Do not create a competing implementation of ConversationState.

ERROR UX

Do not rely only on toast notifications.

Errors and domain states should be visible in the relevant workspace.

Examples:

missing raster

invalid ROI

unsupported crop

insufficient data

no valid pixels

planner clarification

provider unavailable

invalid session

permission error

Make them understandable to a human user.

LOADING UX

Use polished loading states.

For example:

Analyzing...

Planner
✓

Geospatial analysis
●

Evidence generation
○

But do not claim a backend stage completed unless the backend actually reports it.

SESSION UX

Integrate the backend session system.

Support:

new session

save

load

title

description

tags

annotations

search

filtering

archive

restore

delete confirmation

checkpoints

fork

compare

Clearly tell users when loading/forking/checkpoints requires the raster or ROI to be re-established.

SECURITY

Never expose:

SATQUERY_LLM_API_KEY

NVIDIA credentials

environment variables

server filesystem paths

external-data cache paths

All NVIDIA/Nemotron calls remain server-side.

All geospatial processing remains server-side.

IMPORTANT PRODUCT PRINCIPLE

SatQuery should NOT look like:

"ChatGPT + a map."

It should look like:

A geospatial intelligence workstation with a conversational interface.

The map and evidence are as important as the chat.

The core user journey should visually communicate:

Ask
 ↓
Locate
 ↓
Analyze
 ↓
Inspect Evidence
 ↓
Understand Result


DEMO FLOW

Optimize the UX for an SIH presentation.

A demo user should be able to:

Open SatQuery.

Load/select a raster.

Select an ROI.

Ask a natural-language question.

Watch the backend process it.

See the analysis on the map.

See the structured result.

Open evidence.

Inspect provenance.

Ask a follow-up question using context.

Save the session.

Make this flow extremely clear.

IMPLEMENTATION SAFETY

Initially create the frontend using mocked API responses ONLY for visual development if the real API is not yet available.

Clearly isolate mock data behind an API adapter.

Never mix mock results with real results.

Make it easy to replace the mock adapter with the real Python API.

Do not claim mocked data is real satellite data.

FINAL REQUIREMENT

Before making major architectural decisions, inspect the existing project structure if repository access is available.

If an API endpoint or backend capability is not actually available, create a clearly marked API adapter/interface rather than inventing backend behavior.

Keep the frontend independent from backend implementation details wherever possible.

The final result should be a polished, professional SatQuery AI geospatial intelligence frontend, ready to connect to the existing Python backend.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/28236bcb-3fb4-4322-8540-e109594ce582).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

import { SatQueryApiError, type SatQueryAdapter } from "./adapter";
import type { GeoJsonGeometry, LayerName, SaveSessionInput } from "./types";

async function request(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    let details: unknown;
    try { details = await response.json(); } catch { details = null; }
    throw new SatQueryApiError(`Backend request failed (${response.status})`, response.status, details);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const realAdapter: SatQueryAdapter = {
  status: { mode: "real", connected: true },
  createWorkspace: () => request("/api/workspaces", { method: "POST" }),
  getRaster: (id) => request(`/api/workspaces/${encodeURIComponent(id)}/raster`),
  setROI: (id, geometry: GeoJsonGeometry) => request(`/api/workspaces/${encodeURIComponent(id)}/roi`, { method: "PUT", body: JSON.stringify({ geometry }) }),
  listTools: () => request("/api/tools"),
  executeQuery: (id, query) => request(`/api/workspaces/${encodeURIComponent(id)}/query`, { method: "POST", body: JSON.stringify({ query }) }),
  getLayer: (id, layer: LayerName) => request(`/api/workspaces/${encodeURIComponent(id)}/layers/${encodeURIComponent(layer)}`),
  getEvidence: (id) => request(`/api/workspaces/${encodeURIComponent(id)}/evidence/latest`),
  listSessions: () => request("/api/sessions"),
  loadSession: (id) => request(`/api/sessions/${encodeURIComponent(id)}`),
  saveSession: (input: SaveSessionInput) => request(input.id ? `/api/sessions/${encodeURIComponent(input.id)}` : "/api/sessions", { method: input.id ? "PUT" : "POST", body: JSON.stringify(input) }),
  archiveSession: (id) => request(`/api/sessions/${encodeURIComponent(id)}/archive`, { method: "POST" }).then(() => undefined),
  restoreSession: (id) => request(`/api/sessions/${encodeURIComponent(id)}/restore`, { method: "POST" }).then(() => undefined),
  deleteSession: (id) => request(`/api/sessions/${encodeURIComponent(id)}`, { method: "DELETE" }).then(() => undefined),
  createCheckpoint: (id) => request(`/api/sessions/${encodeURIComponent(id)}/checkpoints`, { method: "POST" }),
  forkSession: (id) => request(`/api/sessions/${encodeURIComponent(id)}/fork`, { method: "POST" }),
  compareSessions: (ids) => request("/api/sessions/compare", { method: "POST", body: JSON.stringify({ session_ids: ids }) }),
};

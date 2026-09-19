import type { SatQueryAdapter } from "./adapter";
import type { GeoJsonGeometry, LayerName, SaveSessionInput, SessionSummary, ToolResult } from "./types";

const wait = (duration = 450) => new Promise<void>((resolve) => setTimeout(resolve, duration));

let sessions: SessionSummary[] = [
  { id: "demo-session", title: "Untitled demonstration", tags: ["DEMO"], archived: false },
];

export const demoAdapter: SatQueryAdapter = {
  status: { mode: "demo", connected: false },
  async createWorkspace() {
    await wait();
    return { id: "demo-workspace" };
  },
  async getRaster() {
    await wait(250);
    return { available: false, roi_status: "Not submitted" };
  },
  async setROI(_workspaceId: string, geometry: GeoJsonGeometry) {
    await wait();
    return {
      status: "DEMO",
      validated_geometry: geometry,
      warnings: ["DEMO / NOT REAL DATA — geometry has not been validated by the Python backend."],
      message: "Demo state only. Connect the Python backend to validate this ROI.",
    };
  },
  async listTools() {
    return [];
  },
  async executeQuery(_workspaceId: string, query: string): Promise<ToolResult> {
    await wait(900);
    const asksForDates = /compare|temporal|last month|before|after/i.test(query);
    const asksForRoi = /ndvi|ndwi|area|cotton|conditions/i.test(query);
    return {
      call_id: null,
      tool_name: "demo_placeholder",
      status: asksForDates ? "NEEDS_TWO_DATES" : asksForRoi ? "NEEDS_ROI" : "NEEDS_CLARIFICATION",
      result: null,
      evidence: null,
      warnings: ["DEMO MODE — no scientific analysis was performed."],
      message: asksForDates
        ? "Choose both dates to demonstrate the temporal request flow. Real analysis requires the Python backend."
        : asksForRoi
          ? "Select an area on the map to continue. Real analysis requires the Python backend."
          : "Demo result — connect the Python backend to display real analysis.",
      error: null,
    };
  },
  async getLayer(_workspaceId: string, layer: LayerName) {
    return { layer, available: false, message: "Unavailable until supplied by the Python backend." };
  },
  async getEvidence() {
    return null;
  },
  async listSessions() {
    await wait(200);
    return sessions;
  },
  async loadSession(sessionId: string) {
    await wait(250);
    return { session_id: sessionId, demo: true };
  },
  async saveSession(input: SaveSessionInput) {
    await wait(300);
    const session: SessionSummary = {
      id: input.id ?? `demo-${Date.now()}`,
      title: input.title ?? "Untitled demonstration",
      description: input.description,
      tags: input.tags ?? ["DEMO"],
      archived: false,
    };
    sessions = [session, ...sessions.filter((item) => item.id !== session.id)];
    return session;
  },
  async archiveSession(sessionId: string) {
    sessions = sessions.map((session) => session.id === sessionId ? { ...session, archived: true } : session);
  },
  async restoreSession(sessionId: string) {
    sessions = sessions.map((session) => session.id === sessionId ? { ...session, archived: false } : session);
  },
  async deleteSession(sessionId: string) {
    sessions = sessions.filter((session) => session.id !== sessionId);
  },
  async createCheckpoint(sessionId: string) {
    return { session_id: sessionId, demo: true };
  },
  async forkSession(sessionId: string) {
    const source = sessions.find((session) => session.id === sessionId);
    const fork: SessionSummary = {
      id: `demo-fork-${Date.now()}`,
      title: `${source?.title ?? "Untitled demonstration"} — fork`,
      tags: ["DEMO"],
      requires_raster: true,
      requires_roi: true,
    };
    sessions = [fork, ...sessions];
    return fork;
  },
  async compareSessions(sessionIds: string[]) {
    return { session_ids: sessionIds, demo: true };
  },
};

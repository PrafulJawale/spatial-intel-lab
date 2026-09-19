import type {
  AdapterStatus,
  GeoJsonGeometry,
  LayerName,
  LayerPayload,
  RasterContext,
  RoiResponse,
  SaveSessionInput,
  SessionSummary,
  ToolResult,
  WorkspaceRef,
} from "./types";

export interface SatQueryAdapter {
  readonly status: AdapterStatus;
  createWorkspace(): Promise<WorkspaceRef>;
  getRaster(workspaceId: string): Promise<RasterContext>;
  setROI(workspaceId: string, geometry: GeoJsonGeometry): Promise<RoiResponse>;
  listTools(): Promise<unknown>;
  executeQuery(workspaceId: string, query: string): Promise<ToolResult>;
  getLayer(workspaceId: string, layer: LayerName): Promise<LayerPayload>;
  getEvidence(workspaceId: string): Promise<unknown | null>;
  listSessions(): Promise<SessionSummary[]>;
  loadSession(sessionId: string): Promise<unknown>;
  saveSession(input: SaveSessionInput): Promise<SessionSummary>;
  archiveSession(sessionId: string): Promise<void>;
  restoreSession(sessionId: string): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  createCheckpoint(sessionId: string): Promise<unknown>;
  forkSession(sessionId: string): Promise<SessionSummary>;
  compareSessions(sessionIds: string[]): Promise<unknown>;
}

export class SatQueryApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "SatQueryApiError";
  }
}

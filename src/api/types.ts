export const DOMAIN_STATUSES = [
  "OK",
  "NEEDS_ROI",
  "NEEDS_NDVI_CONFIRMATION",
  "NEEDS_TWO_DATES",
  "NO_TEMPORAL_OVERLAP",
  "NEEDS_THRESHOLD",
  "NO_VALID_PIXELS",
  "INSUFFICIENT_DATA",
  "PARTIAL_DATA",
  "UNSUPPORTED",
  "UNSUPPORTED_CROP",
  "UNSUPPORTED_CONDITION",
  "UNKNOWN",
  "ERROR",
  "NEEDS_CLARIFICATION",
] as const;

export type DomainStatus = (typeof DOMAIN_STATUSES)[number];

export interface ToolResult {
  call_id: string | null;
  tool_name: string;
  status: string;
  result: unknown | null;
  evidence: unknown | null;
  warnings: string[];
  message: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
}

export interface GeoJsonGeometry {
  type: string;
  coordinates: unknown;
}

export interface WorkspaceRef {
  id: string;
}

export interface RasterContext {
  available: boolean;
  source?: string | null;
  acquisition_date?: string | null;
  crs?: string | null;
  resolution?: string | number | null;
  band_mapping_status?: string | null;
  roi_status?: string | null;
}

export interface RoiResponse {
  status: string;
  validated_geometry?: GeoJsonGeometry | null;
  warnings?: string[];
  message?: string;
}

export interface SessionSummary {
  id: string;
  title?: string | null;
  description?: string | null;
  tags?: string[];
  archived?: boolean;
  requires_raster?: boolean;
  requires_roi?: boolean;
}

export interface SaveSessionInput {
  id?: string;
  title?: string;
  description?: string;
  tags?: string[];
  annotations?: string;
}

export type LayerName = "satellite" | "rgb" | "false-color" | "ndvi" | "ndwi" | "temporal-change" | "analysis";

export interface LayerPayload {
  layer: LayerName;
  available: boolean;
  data?: unknown;
  message?: string;
}

export interface AdapterStatus {
  mode: "demo" | "real";
  connected: boolean;
}

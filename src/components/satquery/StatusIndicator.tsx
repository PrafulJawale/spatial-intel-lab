import { AlertCircle, CheckCircle2, CircleHelp, MapPinned, SlidersHorizontal } from "lucide-react";
import type { DomainStatus, ToolResult } from "@/api";

const statusCopy: Record<DomainStatus, { title: string; action?: string; tone: string }> = {
  OK: { title: "Analysis complete", tone: "text-success" },
  NEEDS_ROI: { title: "Select an area on the map to continue", action: "Draw and submit a draft ROI.", tone: "text-warning" },
  NEEDS_NDVI_CONFIRMATION: { title: "Band mapping confirmation required", action: "Confirm the mapping in dataset context.", tone: "text-warning" },
  NEEDS_TWO_DATES: { title: "Two dates are required", action: "Choose explicit before and after dates.", tone: "text-warning" },
  NO_TEMPORAL_OVERLAP: { title: "No temporal overlap", action: "The backend found no comparable coverage.", tone: "text-danger" },
  NEEDS_THRESHOLD: { title: "A threshold is required", action: "Clarify the requested condition.", tone: "text-warning" },
  NO_VALID_PIXELS: { title: "No valid pixels", action: "The selected data cannot support this analysis.", tone: "text-danger" },
  INSUFFICIENT_DATA: { title: "Insufficient data", action: "The backend cannot establish a result from available data.", tone: "text-warning" },
  PARTIAL_DATA: { title: "Partial data", action: "Review warnings and limitations before interpreting the result.", tone: "text-warning" },
  UNSUPPORTED: { title: "Request not supported", tone: "text-danger" },
  UNSUPPORTED_CROP: { title: "Crop not currently supported", action: "Cotton is the only supported crop at present.", tone: "text-danger" },
  UNSUPPORTED_CONDITION: { title: "Condition not supported", tone: "text-danger" },
  UNKNOWN: { title: "Status unavailable", tone: "text-muted-foreground" },
  ERROR: { title: "Analysis failed", tone: "text-danger" },
  NEEDS_CLARIFICATION: { title: "Clarification needed", action: "Add more detail to your request.", tone: "text-warning" },
};

export function StatusIndicator({ result }: { result: ToolResult }) {
  const known = Object.hasOwn(statusCopy, result.status);
  const status = known ? statusCopy[result.status as DomainStatus] : statusCopy.UNKNOWN;
  const Icon = result.status === "OK" ? CheckCircle2 : result.status === "NEEDS_ROI" ? MapPinned : result.status.startsWith("NEEDS_") ? CircleHelp : result.status === "PARTIAL_DATA" ? SlidersHorizontal : AlertCircle;
  return (
    <div className="border border-border bg-panel-muted p-3" role="status">
      <div className={`flex items-center gap-2 text-sm font-semibold ${status.tone}`}><Icon className="size-4" />{status.title}</div>
      {result.message && <p className="mt-2 text-sm leading-5 text-foreground">{result.message}</p>}
      {status.action && <p className="mt-1 text-xs leading-5 text-muted-foreground">{status.action}</p>}
      {result.warnings.map((warning) => <p key={warning} className="mt-2 border-l-2 border-warning pl-2 text-xs text-warning">{warning}</p>)}
      {result.error?.message && <p className="mt-2 text-xs text-danger">{result.error.message}</p>}
    </div>
  );
}

import { lazy, Suspense } from "react";
import { BoxSelect, Crosshair, Edit3, Layers, MousePointer2, Pentagon, Trash2 } from "lucide-react";
import type { GeoJsonGeometry } from "@/api";
import { Button } from "@/components/ui/button";

const GeoMap = lazy(() => import("./GeoMap").then((module) => ({ default: module.GeoMap })));

interface GeoWorkspaceProps {
  draftROI: GeoJsonGeometry | null;
  validatedROI: GeoJsonGeometry | null;
  drawingMode: "polygon" | "rectangle" | null;
  onDrawingMode: (mode: "polygon" | "rectangle" | null) => void;
  onDraftChange: (geometry: GeoJsonGeometry | null) => void;
  onSubmitROI: () => void;
  roiPending: boolean;
}

export function GeoWorkspace(props: GeoWorkspaceProps) {
  return <main className="relative min-h-0 overflow-hidden bg-map">
    <Suspense fallback={<div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Loading map…</div>}><GeoMap draftROI={props.draftROI} validatedROI={props.validatedROI} drawingMode={props.drawingMode} onDraftChange={props.onDraftChange} /></Suspense>
    <div className="absolute left-3 top-3 z-10 flex items-center gap-1 border border-border bg-panel/95 p-1 shadow-2xl backdrop-blur-sm">
      <Tool active={!props.drawingMode} label="Inspect" onClick={() => props.onDrawingMode(null)}><MousePointer2 /></Tool>
      <Tool active={props.drawingMode === "polygon"} label="Draw polygon" onClick={() => props.onDrawingMode("polygon")}><Pentagon /></Tool>
      <Tool active={props.drawingMode === "rectangle"} label="Draw rectangle" onClick={() => props.onDrawingMode("rectangle")}><BoxSelect /></Tool>
      <Tool active={false} label="Edit ROI" onClick={() => props.onDrawingMode("polygon")}><Edit3 /></Tool>
      <Tool active={false} label="Clear ROI" onClick={() => props.onDraftChange(null)}><Trash2 /></Tool>
      <span className="mx-1 h-5 w-px bg-border" />
      <Button size="sm" disabled={!props.draftROI || props.roiPending} onClick={props.onSubmitROI}>{props.roiPending ? "Submitting…" : "Submit ROI"}</Button>
    </div>
    <div className="absolute right-3 top-3 z-10 flex items-center gap-2 border border-border bg-panel/95 px-3 py-2 text-[10px] uppercase text-muted-foreground shadow-xl"><Crosshair className="size-3 text-primary" /> Geospatial workspace</div>
    <div className="absolute bottom-7 left-3 z-10 grid gap-1.5 border border-border bg-panel/95 p-3 text-[10px] shadow-xl">
      <span className="flex items-center gap-2 text-warning"><i className="w-5 border-t-2 border-dashed border-warning" />DRAFT ROI</span>
      <span className="flex items-center gap-2 text-success"><i className="w-5 border-t-2 border-success" />VALIDATED ROI</span>
      <span className="flex items-center gap-2 text-muted-foreground"><Layers className="size-3" />Derived layers unavailable</span>
    </div>
    {!props.draftROI && <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 mx-auto w-fit border border-border bg-panel/90 px-4 py-2 text-xs text-muted-foreground shadow-xl">Choose polygon or rectangle, then click the map to define a draft ROI.</div>}
  </main>;
}

function Tool({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: React.ReactNode }) { return <Button variant={active ? "secondary" : "ghost"} size="icon" aria-label={label} title={label} onClick={onClick} className="size-8">{children}</Button>; }

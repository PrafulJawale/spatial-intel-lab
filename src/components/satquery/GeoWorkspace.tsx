import { lazy, Suspense, useState } from "react";
import { BoxSelect, Edit3, Globe2, Layers, Map, MousePointer2, Pentagon, Satellite, Trash2 } from "lucide-react";
import type { GeoJsonGeometry } from "@/api";
import { Button } from "@/components/ui/button";
import type { GeocodingResult } from "@/map/geocoding";
import type { BasemapId, ProjectionMode } from "@/map/mapConfig";
import { LocationSearch } from "./LocationSearch";

const GeoMap = lazy(() => import("./GeoMap").then((module) => ({ default: module.GeoMap })));

interface GeoWorkspaceProps {
  draftROI: GeoJsonGeometry | null;
  validatedROI: GeoJsonGeometry | null;
  drawingMode: "polygon" | "rectangle" | null;
  onDrawingMode: (mode: "polygon" | "rectangle" | null) => void;
  onDraftChange: (geometry: GeoJsonGeometry | null) => void;
  onSubmitROI: () => void;
  roiPending: boolean;
  backendConnected: boolean;
}

export function GeoWorkspace(props: GeoWorkspaceProps) {
  const [projection, setProjection] = useState<ProjectionMode>("globe");
  const [basemap, setBasemap] = useState<BasemapId>("satellite");
  const [selectedLocation, setSelectedLocation] = useState<GeocodingResult | null>(null);
  const roiStatus = props.validatedROI ? "VALIDATED" : props.draftROI ? "DRAFT" : "NOT SELECTED";
  return <main className="relative min-h-0 overflow-hidden bg-map">
    <Suspense fallback={<div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Loading Earth…</div>}><GeoMap draftROI={props.draftROI} validatedROI={props.validatedROI} drawingMode={props.drawingMode} onDraftChange={props.onDraftChange} projection={projection} basemap={basemap} selectedLocation={selectedLocation} /></Suspense>
    <div className="absolute inset-x-2 top-2 z-20 grid gap-1.5 sm:inset-x-3 sm:top-3">
      <div className="flex min-w-0 items-center gap-1.5">
        <LocationSearch onSelect={setSelectedLocation} />
        <SegmentedControl label="Projection" options={[{ id: "globe", label: "Globe", icon: <Globe2 /> }, { id: "flat", label: "Flat", icon: <Map /> }]} value={projection} onChange={(value) => setProjection(value as ProjectionMode)} />
        <SegmentedControl label="Basemap" options={[{ id: "satellite", label: "Satellite", icon: <Satellite /> }, { id: "streets", label: "Streets", icon: <Map /> }]} value={basemap} onChange={(value) => setBasemap(value as BasemapId)} className="hidden md:flex" />
      </div>
      <div className="flex w-fit max-w-full items-center gap-1 overflow-x-auto border border-border bg-panel/95 p-1 shadow-xl backdrop-blur-sm">
        <div className="md:hidden"><SegmentedControl label="Basemap" options={[{ id: "satellite", label: "Satellite", icon: <Satellite /> }, { id: "streets", label: "Streets", icon: <Map /> }]} value={basemap} onChange={(value) => setBasemap(value as BasemapId)} /></div>
        <span className="mx-0.5 h-5 w-px shrink-0 bg-border" />
        <Tool active={!props.drawingMode} label="Select" onClick={() => props.onDrawingMode(null)}><MousePointer2 /></Tool>
        <Tool active={props.drawingMode === "polygon"} label="Polygon ROI" onClick={() => props.onDrawingMode("polygon")}><Pentagon /></Tool>
        <Tool active={props.drawingMode === "rectangle"} label="Rectangle ROI" onClick={() => props.onDrawingMode("rectangle")}><BoxSelect /></Tool>
        <Tool active={false} label="Edit ROI" onClick={() => props.onDrawingMode("polygon")}><Edit3 /></Tool>
        <Tool active={false} label="Clear ROI" onClick={() => props.onDraftChange(null)}><Trash2 /></Tool>
        <span className="mx-0.5 h-5 w-px shrink-0 bg-border" />
        <Button size="sm" className="shrink-0" disabled={!props.draftROI || props.roiPending} onClick={props.onSubmitROI}>{props.roiPending ? "Validating…" : "Validate ROI"}</Button>
      </div>
    </div>
    <div className="absolute bottom-7 left-3 z-10 grid gap-1.5 border border-border bg-panel/95 p-3 text-[10px] shadow-xl">
      <span className="flex items-center gap-2 text-warning"><i className="w-5 border-t-2 border-dashed border-warning" />DRAFT ROI</span>
      <span className="flex items-center gap-2 text-success"><i className="w-5 border-t-2 border-success" />VALIDATED ROI</span>
      <span className="flex items-center gap-2 text-muted-foreground"><Layers className="size-3" />Derived layers unavailable</span>
    </div>
    <div className="absolute bottom-2 right-2 z-10 flex max-w-[calc(100%-1rem)] flex-wrap items-center justify-end gap-x-3 gap-y-1 border border-border bg-panel/95 px-2.5 py-1.5 font-display text-[9px] uppercase text-muted-foreground shadow-xl backdrop-blur-sm sm:bottom-3 sm:right-3">
      <Status label="Projection" value={projection} /><Status label="Basemap" value={basemap} /><Status label="ROI" value={roiStatus} emphasize={roiStatus !== "NOT SELECTED"} /><Status label="Backend" value={props.backendConnected ? "CONNECTED" : "DEMO MODE"} />
    </div>
    {!props.draftROI && <div className="pointer-events-none absolute inset-x-0 bottom-20 z-10 mx-auto hidden w-fit border border-border bg-panel/90 px-4 py-2 text-xs text-muted-foreground shadow-xl sm:block">Search to navigate. Draw an ROI separately for analysis.</div>}
  </main>;
}

function Tool({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: React.ReactNode }) { return <Button variant={active ? "secondary" : "ghost"} size="icon" aria-label={label} title={label} onClick={onClick} className="size-8">{children}</Button>; }
function SegmentedControl({ label, options, value, onChange, className = "flex" }: { label: string; options: { id: string; label: string; icon: React.ReactNode }[]; value: string; onChange: (value: string) => void; className?: string }) { return <div className={`${className} shrink-0 items-center border border-border bg-panel/95 p-0.5 shadow-xl backdrop-blur-sm`} role="group" aria-label={label}>{options.map((option) => <Button key={option.id} variant={value === option.id ? "secondary" : "ghost"} size="sm" className="h-7 px-2 text-[9px] uppercase sm:px-2.5" aria-pressed={value === option.id} onClick={() => onChange(option.id)}>{option.icon}<span className="hidden sm:inline">{option.label}</span></Button>)}</div>; }
function Status({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) { return <span><span>{label}: </span><strong className={emphasize ? "text-warning" : "text-foreground"}>{value}</strong></span>; }

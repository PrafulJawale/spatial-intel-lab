import { useMemo, useState } from "react";
import { Archive, Check, Copy, GitFork, Layers3, Plus, Save, Search, Trash2 } from "lucide-react";
import type { LayerName, RasterContext, SessionSummary } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const layers: { id: LayerName; label: string; derived: boolean }[] = [
  { id: "satellite", label: "Base map", derived: false }, { id: "rgb", label: "RGB", derived: true },
  { id: "false-color", label: "False Color", derived: true }, { id: "ndvi", label: "NDVI", derived: true },
  { id: "ndwi", label: "NDWI", derived: true }, { id: "temporal-change", label: "Temporal Change", derived: true },
  { id: "analysis", label: "Analysis overlays", derived: true },
];

interface SidebarProps {
  sessions: SessionSummary[];
  raster: RasterContext;
  activeSessionId: string | null;
  onNew: () => void;
  onSave: () => void;
  onLoad: (id: string) => void;
  onArchive: (id: string, archived: boolean) => void;
  onDelete: (id: string) => void;
  onFork: (id: string) => void;
  onCheckpoint: (id: string) => void;
  beforeDate: string;
  afterDate: string;
  onBeforeDate: (value: string) => void;
  onAfterDate: (value: string) => void;
}

export function WorkspaceSidebar(props: SidebarProps) {
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [opacity, setOpacity] = useState([72]);
  const visibleSessions = useMemo(() => props.sessions.filter((session) => (showArchived || !session.archived) && (session.title ?? "Untitled").toLowerCase().includes(search.toLowerCase())), [props.sessions, search, showArchived]);
  return (
    <aside className="flex h-full min-h-0 flex-col bg-panel text-sm">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between"><div><p className="font-display text-lg font-bold text-foreground">SatQuery <span className="text-primary">AI</span></p><p className="text-[10px] uppercase text-muted-foreground">Interactive Geospatial Intelligence</p></div><div className="grid size-9 place-items-center border border-primary/40 bg-primary/10 text-primary"><Layers3 className="size-4" /></div></div>
        <div className="mt-4 grid grid-cols-2 gap-2"><Button size="sm" onClick={props.onNew}><Plus />New Session</Button><Button size="sm" variant="outline" onClick={props.onSave}><Save />Save</Button></div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Section title="Session browser">
          <div className="relative"><Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" /><Input aria-label="Search sessions" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sessions" className="h-8 pl-8 text-xs" /></div>
          <label className="mt-3 flex items-center justify-between text-xs text-muted-foreground">Show archived<Switch checked={showArchived} onCheckedChange={setShowArchived} /></label>
          <div className="mt-3 space-y-2">
            {visibleSessions.map((session) => <div key={session.id} className={`border p-3 ${props.activeSessionId === session.id ? "border-primary bg-primary/5" : "border-border bg-panel-muted"}`}>
              <button className="w-full text-left" onClick={() => props.onLoad(session.id)}><span className="block truncate font-medium text-foreground">{session.title ?? "Untitled session"}</span><span className="mt-1 flex gap-1">{session.tags?.map((tag) => <span key={tag} className="border border-border px-1.5 py-0.5 text-[9px] uppercase text-muted-foreground">{tag}</span>)}</span></button>
              {(session.requires_raster || session.requires_roi) && <p className="mt-2 text-[10px] text-warning">Raster or ROI must be re-established.</p>}
              <div className="mt-2 flex gap-1"><IconButton label="Checkpoint" onClick={() => props.onCheckpoint(session.id)}><Check /></IconButton><IconButton label="Fork" onClick={() => props.onFork(session.id)}><GitFork /></IconButton><IconButton label={session.archived ? "Restore" : "Archive"} onClick={() => props.onArchive(session.id, Boolean(session.archived))}><Archive /></IconButton><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Delete session" className="size-7 text-danger"><Trash2 /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this session?</AlertDialogTitle><AlertDialogDescription>This removes the session through the configured backend adapter. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => props.onDelete(session.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>
            </div>)}
          </div>
        </Section>
        <Section title="Dataset context">
          {props.raster.available ? <dl className="space-y-2 text-xs">{[["Active raster", props.raster.source], ["Acquisition", props.raster.acquisition_date], ["CRS", props.raster.crs], ["Resolution", props.raster.resolution], ["Band mapping", props.raster.band_mapping_status], ["ROI", props.raster.roi_status]].map(([label, value]) => value != null && <div key={String(label)} className="flex justify-between gap-3"><dt className="text-muted-foreground">{label}</dt><dd className="text-right text-foreground">{String(value)}</dd></div>)}</dl> : <EmptyLine text="No raster supplied by backend" />}
          <Button variant="outline" size="sm" className="mt-3 w-full" disabled><Plus />Select raster</Button>
        </Section>
        <Section title="Temporal context">
          <label className="grid gap-1 text-xs text-muted-foreground">Before date<Input type="date" value={props.beforeDate} onChange={(event) => props.onBeforeDate(event.target.value)} className="h-8" /></label>
          <label className="mt-2 grid gap-1 text-xs text-muted-foreground">After date<Input type="date" value={props.afterDate} onChange={(event) => props.onAfterDate(event.target.value)} className="h-8" /></label>
          <p className="mt-2 text-[10px] text-muted-foreground">Dates are never selected automatically.</p>
        </Section>
        <Section title="Layer controls">
          <div className="space-y-3">{layers.map((layer) => <label key={layer.id} className="flex items-center justify-between text-xs"><span className={layer.derived ? "text-muted-foreground" : "text-foreground"}>{layer.label}{layer.derived && <span className="ml-1 text-[9px]">UNAVAILABLE</span>}</span><Switch checked={!layer.derived && layer.id === "satellite"} disabled={layer.derived} /></label>)}</div>
          <div className="mt-4"><div className="mb-2 flex justify-between text-[10px] uppercase text-muted-foreground"><span>Base opacity</span><span>{opacity[0]}%</span></div><Slider value={opacity} onValueChange={setOpacity} max={100} /></div>
        </Section>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="border-b border-border p-4"><h2 className="mb-3 text-[10px] font-bold uppercase text-muted-foreground">{title}</h2>{children}</section>; }
function EmptyLine({ text }: { text: string }) { return <div className="border border-dashed border-border p-3 text-xs text-muted-foreground">{text}</div>; }
function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) { return <Button variant="ghost" size="icon" aria-label={label} title={label} onClick={onClick} className="size-7">{children}</Button>; }

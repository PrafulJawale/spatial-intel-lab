import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, Menu, MessageSquareText, ServerOff, X } from "lucide-react";
import { satQueryAdapter, type GeoJsonGeometry, type RasterContext, type SessionSummary } from "@/api";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { GeoWorkspace } from "./GeoWorkspace";
import { IntelligencePanel, type ChatMessage } from "./IntelligencePanel";
import { WorkspaceSidebar } from "./WorkspaceSidebar";

const workspaceId = "active";
const emptyRaster: RasterContext = { available: false, roi_status: "Not submitted" };

export function SatQueryApp() {
  const queryClient = useQueryClient();
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [drawingMode, setDrawingMode] = useState<"polygon" | "rectangle" | null>(null);
  const [draftROI, setDraftROI] = useState<GeoJsonGeometry | null>(null);
  const [validatedROI, setValidatedROI] = useState<GeoJsonGeometry | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>("demo-session");
  const [beforeDate, setBeforeDate] = useState("");
  const [afterDate, setAfterDate] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: "welcome", role: "assistant", text: "Define a region of interest, then ask a geospatial question. Analysis and evidence will only appear when supplied by the Python backend." }]);

  const rasterQuery = useQuery({ queryKey: ["satquery", "raster", workspaceId], queryFn: () => satQueryAdapter.getRaster(workspaceId) });
  const sessionsQuery = useQuery({ queryKey: ["satquery", "sessions"], queryFn: () => satQueryAdapter.listSessions() });
  const roiMutation = useMutation({ mutationFn: (geometry: GeoJsonGeometry) => satQueryAdapter.setROI(workspaceId, geometry), onSuccess: (response) => { setValidatedROI(response.validated_geometry ?? null); setDrawingMode(null); setMessages((current) => [...current, { id: `roi-${Date.now()}`, role: "assistant", text: response.message ?? "ROI response received from the backend." }]); } });
  const queryMutation = useMutation({ mutationFn: (query: string) => satQueryAdapter.executeQuery(workspaceId, query), onMutate: (query) => { setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", text: query, contextual: current.some((message) => message.role === "user") }]); }, onSuccess: (result) => { setMessages((current) => [...current, { id: `result-${Date.now()}`, role: "assistant", text: result.tool_name === "demo_placeholder" ? "Demo response" : result.tool_name, result }]); }, onError: (error) => { setMessages((current) => [...current, { id: `error-${Date.now()}`, role: "assistant", text: error instanceof Error ? error.message : "The backend request failed.", result: { call_id: null, tool_name: "request", status: "ERROR", result: null, evidence: null, warnings: [], message: "The real backend request failed. No demo result was substituted.", error: { code: "BACKEND_UNAVAILABLE", message: error instanceof Error ? error.message : "Request failed" } } }]); } });

  const refreshSessions = () => queryClient.invalidateQueries({ queryKey: ["satquery", "sessions"] });
  const sessionMutation = useMutation({ mutationFn: (task: () => Promise<unknown>) => task(), onSuccess: refreshSessions });
  const sessions = sessionsQuery.data ?? [];
  const sharedSidebarProps = {
    sessions,
    raster: rasterQuery.data ?? emptyRaster,
    activeSessionId,
    onNew: () => { setActiveSessionId(null); setMessages([{ id: `new-${Date.now()}`, role: "assistant", text: "New session ready. Raster and ROI context have not been established." }]); setDraftROI(null); setValidatedROI(null); },
    onSave: () => sessionMutation.mutate(() => satQueryAdapter.saveSession({ ...(activeSessionId ? { id: activeSessionId } : {}), title: "Untitled demonstration", tags: satQueryAdapter.status.mode === "demo" ? ["DEMO"] : [] })),
    onLoad: (id: string) => { setActiveSessionId(id); sessionMutation.mutate(() => satQueryAdapter.loadSession(id)); },
    onArchive: (id: string, archived: boolean) => sessionMutation.mutate(() => archived ? satQueryAdapter.restoreSession(id) : satQueryAdapter.archiveSession(id)),
    onDelete: (id: string) => sessionMutation.mutate(() => satQueryAdapter.deleteSession(id)),
    onFork: (id: string) => sessionMutation.mutate(() => satQueryAdapter.forkSession(id)),
    onCheckpoint: (id: string) => sessionMutation.mutate(() => satQueryAdapter.createCheckpoint(id)),
    beforeDate,
    afterDate,
    onBeforeDate: setBeforeDate,
    onAfterDate: setAfterDate,
  };

  useEffect(() => { if (sessionsQuery.data?.length && !activeSessionId) setActiveSessionId(sessionsQuery.data[0]?.id ?? null); }, [sessionsQuery.data, activeSessionId]);

  return <div className="flex h-dvh min-h-[620px] flex-col overflow-hidden bg-background text-foreground">
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-panel px-3 lg:px-4">
      <div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open workspace panel" onClick={() => setLeftOpen(true)}><Menu /></Button><div className="lg:hidden"><span className="font-display text-sm font-bold">SatQuery <span className="text-primary">AI</span></span></div><div className="hidden items-center gap-2 text-[10px] uppercase text-muted-foreground lg:flex"><Database className="size-3 text-primary" />Satellite data <span>→</span> Analysis <span>→</span> Evidence</div></div>
      <div className={`flex items-center gap-2 border px-2.5 py-1 text-[10px] font-semibold uppercase ${satQueryAdapter.status.connected ? "border-success/40 bg-success/10 text-success" : "border-warning/40 bg-warning/10 text-warning"}`}>{satQueryAdapter.status.connected ? <Database className="size-3" /> : <ServerOff className="size-3" />}{satQueryAdapter.status.mode === "demo" ? "Demo Mode — Backend not connected" : "Backend: Connected"}</div>
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open intelligence panel" onClick={() => setRightOpen(true)}><MessageSquareText /></Button>
    </header>
    <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_minmax(400px,1fr)_360px]">
      <div className="hidden min-h-0 border-r border-border lg:block"><WorkspaceSidebar {...sharedSidebarProps} /></div>
      <GeoWorkspace draftROI={draftROI} validatedROI={validatedROI} drawingMode={drawingMode} onDrawingMode={setDrawingMode} onDraftChange={setDraftROI} onSubmitROI={() => draftROI && roiMutation.mutate(draftROI)} roiPending={roiMutation.isPending} backendConnected={satQueryAdapter.status.connected} />
      <div className="hidden min-h-0 border-l border-border lg:block"><IntelligencePanel messages={messages} onSubmit={(query) => queryMutation.mutate(query)} pending={queryMutation.isPending} hasDraftROI={Boolean(draftROI)} hasValidatedROI={Boolean(validatedROI)} hasRaster={Boolean(rasterQuery.data?.available)} hasDates={Boolean(beforeDate && afterDate)} /></div>
    </div>
    <Sheet open={leftOpen} onOpenChange={setLeftOpen}><SheetContent side="left" className="w-[90vw] max-w-[320px] p-0"><SheetHeader className="sr-only"><SheetTitle>Workspace controls</SheetTitle><SheetDescription>Sessions, datasets, dates, and layers.</SheetDescription></SheetHeader><WorkspaceSidebar {...sharedSidebarProps} /></SheetContent></Sheet>
    <Sheet open={rightOpen} onOpenChange={setRightOpen}><SheetContent side="right" className="w-[94vw] max-w-[390px] p-0"><SheetHeader className="sr-only"><SheetTitle>Intelligence panel</SheetTitle><SheetDescription>Conversation, results, evidence, and provenance.</SheetDescription></SheetHeader><IntelligencePanel messages={messages} onSubmit={(query) => queryMutation.mutate(query)} pending={queryMutation.isPending} hasDraftROI={Boolean(draftROI)} hasValidatedROI={Boolean(validatedROI)} hasRaster={Boolean(rasterQuery.data?.available)} hasDates={Boolean(beforeDate && afterDate)} /></SheetContent></Sheet>
  </div>;
}

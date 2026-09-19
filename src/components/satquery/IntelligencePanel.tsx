import { FormEvent, useState } from "react";
import { Bot, ChevronDown, ChevronRight, Download, MapPinCheck, Send, Sparkles } from "lucide-react";
import type { ToolResult } from "@/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusIndicator } from "./StatusIndicator";

export interface ChatMessage { id: string; role: "user" | "assistant"; text: string; result?: ToolResult; contextual?: boolean; }

interface IntelligenceProps {
  messages: ChatMessage[];
  onSubmit: (query: string) => void;
  pending: boolean;
  hasDraftROI: boolean;
  hasValidatedROI: boolean;
  hasRaster: boolean;
  hasDates: boolean;
}

export function IntelligencePanel(props: IntelligenceProps) {
  const [query, setQuery] = useState("");
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const latestResult = [...props.messages].reverse().find((message) => message.result)?.result;
  function submit(event: FormEvent) { event.preventDefault(); const value = query.trim(); if (!value || props.pending) return; props.onSubmit(value); setQuery(""); }
  return <aside className="flex h-full min-h-0 flex-col bg-panel">
    <div className="border-b border-border p-4"><div className="flex items-center justify-between"><div><h2 className="font-display text-base font-semibold">Intelligence</h2><p className="text-[10px] uppercase text-muted-foreground">Conversation + evidence</p></div><Bot className="size-4 text-primary" /></div></div>
    <div className="border-b border-border bg-panel-muted p-3"><p className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">Active context</p><div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]"><Context ok={props.hasValidatedROI} label={props.hasDraftROI && !props.hasValidatedROI ? "Draft ROI only" : "ROI selected"} /><Context ok={props.hasRaster} label="Dataset loaded" /><Context ok={false} label="NDVI mapping confirmed" /><Context ok={props.hasDates} label="Temporal pair selected" /></div></div>
    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      <div className="space-y-4">{props.messages.map((message) => <article key={message.id} className={message.role === "user" ? "ml-7" : "mr-2"}>
        <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground"><span>{message.role === "user" ? "You" : "SatQuery"}</span>{message.contextual && <span className="border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-primary">Uses active context</span>}</div>
        <div className={message.role === "user" ? "bg-primary p-3 text-sm text-primary-foreground" : "border border-border bg-panel-muted p-3 text-sm text-foreground"}>{message.text}</div>
        {message.result && <div className="mt-2"><StatusIndicator result={message.result} /></div>}
      </article>)}
      {props.pending && <div className="border border-border bg-panel-muted p-3"><div className="flex items-center gap-2 text-sm text-foreground"><span className="size-2 animate-pulse rounded-full bg-primary" />Analyzing request…</div><div className="mt-3 grid grid-cols-[1fr_auto] gap-y-2 text-[11px]"><span>Planner / query submission</span><span className="text-primary">●</span><span className="text-muted-foreground">Geospatial analysis</span><span className="text-muted-foreground">○</span><span className="text-muted-foreground">Evidence</span><span className="text-muted-foreground">○</span></div></div>}
      </div>
    </div>
    <div className="border-t border-border">
      <Inspector title="Evidence inspector" open={evidenceOpen} onToggle={() => setEvidenceOpen(!evidenceOpen)}>{latestResult?.evidence != null ? <><pre className="max-h-40 overflow-auto bg-background p-3 text-[10px] text-muted-foreground">{JSON.stringify(latestResult.evidence, null, 2)}</pre><Button size="sm" variant="outline" className="mt-2" onClick={() => downloadJson(latestResult.evidence)}><Download />Export JSON</Button></> : <p className="text-xs text-muted-foreground">No backend evidence is available for this result.</p>}</Inspector>
      <Inspector title="Provenance" open={provenanceOpen} onToggle={() => setProvenanceOpen(!provenanceOpen)}>{latestResult?.evidence != null ? <p className="text-xs text-muted-foreground">Provenance will render only from backend-supplied evidence metadata.</p> : <p className="text-xs text-muted-foreground">No backend provenance is available.</p>}</Inspector>
      <form onSubmit={submit} className="p-3"><label htmlFor="query" className="sr-only">Ask SatQuery</label><div className="relative"><Textarea id="query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask about the selected area…" className="min-h-20 resize-none pr-12 text-sm" onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><Button type="submit" size="icon" aria-label="Send query" disabled={!query.trim() || props.pending} className="absolute bottom-2 right-2"><Send /></Button></div><p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground"><Sparkles className="size-3" />Responses come from the configured backend adapter.</p></form>
    </div>
  </aside>;
}

function Context({ ok, label }: { ok: boolean; label: string }) { return <span className={`flex items-center gap-1.5 ${ok ? "text-success" : "text-muted-foreground"}`}>{ok ? <MapPinCheck className="size-3" /> : <span className="ml-0.5 size-2 rounded-full border border-current" />}{label}</span>; }
function Inspector({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) { return <div className="border-b border-border"><Button variant="ghost" className="h-9 w-full justify-between rounded-none px-4 text-[10px] font-bold uppercase" onClick={onToggle}>{title}{open ? <ChevronDown /> : <ChevronRight />}</Button>{open && <div className="px-4 pb-4">{children}</div>}</div>; }
function downloadJson(value: unknown) { const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = "satquery-evidence.json"; link.click(); URL.revokeObjectURL(url); }
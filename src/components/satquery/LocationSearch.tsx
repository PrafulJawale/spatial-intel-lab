import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MapPin, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeocodingError, searchLocations, type GeocodingResult } from "@/map/geocoding";

interface LocationSearchProps {
  onSelect: (result: GeocodingResult) => void;
}

export function LocationSearch({ onSelect }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selectedRef = useRef(false);

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current = false;
      return;
    }
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setMessage(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setMessage(null);
      try {
        const next = await searchLocations(trimmed, controller.signal);
        setResults(next);
        setMessage(next.length ? null : "No locations found");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResults([]);
        setMessage(error instanceof GeocodingError ? error.message : "Location search is temporarily unavailable.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 450);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const choose = (result: GeocodingResult) => {
    selectedRef.current = true;
    setQuery(result.label);
    setResults([]);
    setMessage(null);
    onSelect(result);
  };

  return <div className="relative min-w-0 flex-1 sm:min-w-64">
    <Search className="pointer-events-none absolute left-2.5 top-2.5 z-10 size-3.5 text-muted-foreground" />
    <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search places, cities, countries, coordinates..." aria-label="Search places, cities, countries, or coordinates" role="combobox" aria-expanded={results.length > 0 || Boolean(message)} aria-controls="location-results" className="h-9 bg-panel/95 pl-8 pr-8 text-xs shadow-xl backdrop-blur-sm" />
    {loading ? <LoaderCircle className="absolute right-2.5 top-2.5 size-3.5 animate-spin text-primary" /> : query ? <Button variant="ghost" size="icon" className="absolute right-1 top-1 size-7" aria-label="Clear location search" onClick={() => setQuery("")}><X /></Button> : null}
    {(results.length > 0 || message) && <div id="location-results" role="listbox" className="absolute left-0 right-0 top-10 z-30 max-h-60 overflow-y-auto border border-border bg-panel shadow-2xl">
      {message ? <p className="px-3 py-3 text-xs text-muted-foreground">{message}</p> : results.map((result) => <button key={result.id} role="option" aria-selected="false" className="flex w-full items-start gap-2 border-b border-border px-3 py-2.5 text-left text-xs text-foreground last:border-b-0 hover:bg-accent focus-visible:bg-accent focus-visible:outline-none" onClick={() => choose(result)}><MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" /><span className="line-clamp-2">{result.label}</span></button>)}
    </div>}
  </div>;
}
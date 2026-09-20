import { createFileRoute } from "@tanstack/react-router";
import { SatQueryApp } from "@/components/satquery/SatQueryApp";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "SatQuery AI — Geospatial Intelligence Workstation" },
    { name: "description", content: "A map-first interface for conversational satellite analysis, evidence, and provenance." },
    { property: "og:title", content: "SatQuery AI — Geospatial Intelligence Workstation" },
    { property: "og:description", content: "A map-first interface for conversational satellite analysis, evidence, and provenance." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Index() {
  return <SatQueryApp />;
}

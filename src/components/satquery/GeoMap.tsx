import { useEffect, useRef } from "react";
import type { GeoJsonGeometry } from "@/api";

interface GeoMapProps {
  draftROI: GeoJsonGeometry | null;
  validatedROI: GeoJsonGeometry | null;
  drawingMode: "polygon" | "rectangle" | null;
  onDraftChange: (geometry: GeoJsonGeometry | null) => void;
}

export function GeoMap({ draftROI, validatedROI, drawingMode, onDraftChange }: GeoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const pointsRef = useRef<number[][]>([]);
  const modeRef = useRef(drawingMode);
  const changeRef = useRef(onDraftChange);

  useEffect(() => { modeRef.current = drawingMode; pointsRef.current = []; }, [drawingMode]);
  useEffect(() => { changeRef.current = onDraftChange; }, [onDraftChange]);

  useEffect(() => {
    let active = true;
    async function setup() {
      if (!containerRef.current || mapRef.current) return;
      const maplibregl = await import("maplibre-gl");
      if (!active || !containerRef.current) return;
      maplibregl.setWorkerUrl("/maplibre-gl-csp-worker.js");
      const map = new maplibregl.Map({
        container: containerRef.current,
        center: [78.9, 20.7],
        zoom: 4.35,
        attributionControl: false,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [{ id: "osm", type: "raster", source: "osm", paint: { "raster-saturation": -0.82, "raster-brightness-max": 0.57, "raster-contrast": 0.18 } }],
        },
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
      map.on("load", () => {
        map.addSource("draft-roi", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({ id: "draft-fill", type: "fill", source: "draft-roi", paint: { "fill-color": "#f5b840", "fill-opacity": 0.17 } });
        map.addLayer({ id: "draft-line", type: "line", source: "draft-roi", paint: { "line-color": "#f5b840", "line-width": 2, "line-dasharray": [2, 1.5] } });
        map.addSource("validated-roi", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({ id: "validated-fill", type: "fill", source: "validated-roi", paint: { "fill-color": "#34d399", "fill-opacity": 0.13 } });
        map.addLayer({ id: "validated-line", type: "line", source: "validated-roi", paint: { "line-color": "#34d399", "line-width": 2.5 } });
      });
      map.on("click", (event) => {
        const mode = modeRef.current;
        if (!mode) return;
        pointsRef.current = [...pointsRef.current, [event.lngLat.lng, event.lngLat.lat]];
        const points = pointsRef.current;
        if (mode === "rectangle" && points.length === 2) {
          const first = points[0];
          const second = points[1];
          if (!first || !second) return;
          changeRef.current({ type: "Polygon", coordinates: [[[first[0], first[1]], [second[0], first[1]], [second[0], second[1]], [first[0], second[1]], [first[0], first[1]]]] });
          pointsRef.current = [];
        } else if (mode === "polygon" && points.length >= 3) {
          changeRef.current({ type: "Polygon", coordinates: [[...points, points[0]]] });
        }
      });
      mapRef.current = map;
    }
    setup();
    return () => { active = false; mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const update = (sourceId: string, geometry: GeoJsonGeometry | null) => {
      const source = map.getSource(sourceId);
      if (!source || source.type !== "geojson") return;
      const geoJsonSource = map.getSource<import("maplibre-gl").GeoJSONSource>(sourceId);
      geoJsonSource?.setData({ type: "FeatureCollection", features: geometry ? [{ type: "Feature", properties: {}, geometry }] : [] });
    };
    update("draft-roi", draftROI);
    update("validated-roi", validatedROI);
  }, [draftROI, validatedROI]);

  return <div ref={containerRef} className="absolute inset-0" aria-label="Interactive geospatial map" />;
}

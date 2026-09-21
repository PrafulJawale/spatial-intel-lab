import { useEffect, useRef } from "react";
import type { GeoJsonGeometry } from "@/api";
import { BASEMAPS } from "@/map/basemaps";
import type { GeocodingResult } from "@/map/geocoding";
import { INITIAL_MAP_VIEW, SEARCH_FLY_ZOOM, type BasemapId, type ProjectionMode } from "@/map/mapConfig";

interface GeoMapProps {
  draftROI: GeoJsonGeometry | null;
  validatedROI: GeoJsonGeometry | null;
  drawingMode: "polygon" | "rectangle" | null;
  onDraftChange: (geometry: GeoJsonGeometry | null) => void;
  projection: ProjectionMode;
  basemap: BasemapId;
  selectedLocation: GeocodingResult | null;
}

export function GeoMap({ draftROI, validatedROI, drawingMode, onDraftChange, projection, basemap, selectedLocation }: GeoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const markerRef = useRef<import("maplibre-gl").Marker | null>(null);
  const markerClassRef = useRef<typeof import("maplibre-gl").Marker | null>(null);
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
      markerClassRef.current = maplibregl.Marker;
      maplibregl.setWorkerUrl("/maplibre-gl-csp-worker.js");
      const map = new maplibregl.Map({
        container: containerRef.current,
        center: INITIAL_MAP_VIEW.center,
        zoom: INITIAL_MAP_VIEW.zoom,
        bearing: INITIAL_MAP_VIEW.bearing,
        pitch: INITIAL_MAP_VIEW.pitch,
        attributionControl: false,
        style: {
          version: 8,
          sources: {
            satellite: {
              type: "raster",
              tiles: BASEMAPS.satellite.tiles,
              tileSize: BASEMAPS.satellite.tileSize,
              maxzoom: BASEMAPS.satellite.maxzoom,
              attribution: BASEMAPS.satellite.attribution,
            },
            streets: {
              type: "raster",
              tiles: BASEMAPS.streets.tiles,
              tileSize: BASEMAPS.streets.tileSize,
              maxzoom: BASEMAPS.streets.maxzoom,
              attribution: BASEMAPS.streets.attribution,
            },
          },
          layers: [
            { id: "satellite-basemap", type: "raster", source: "satellite", layout: { visibility: basemap === "satellite" ? "visible" : "none" } },
            { id: "streets-basemap", type: "raster", source: "streets", layout: { visibility: basemap === "streets" ? "visible" : "none" } },
          ],
        },
      });
      map.setProjection({ type: projection === "globe" ? "globe" : "mercator" });
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
          const [firstLng, firstLat] = first;
          const [secondLng, secondLat] = second;
          if (firstLng === undefined || firstLat === undefined || secondLng === undefined || secondLat === undefined) return;
          changeRef.current({ type: "Polygon", coordinates: [[[firstLng, firstLat], [secondLng, firstLat], [secondLng, secondLat], [firstLng, secondLat], [firstLng, firstLat]]] });
          pointsRef.current = [];
        } else if (mode === "polygon" && points.length >= 3) {
          const first = points[0];
          if (!first) return;
          changeRef.current({ type: "Polygon", coordinates: [[...points, first]] });
        }
      });
      mapRef.current = map;
    }
    setup();
    return () => { active = false; markerRef.current?.remove(); markerRef.current = null; mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setProjection({ type: projection === "globe" ? "globe" : "mercator" });
  }, [projection]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    map.setLayoutProperty("satellite-basemap", "visibility", basemap === "satellite" ? "visible" : "none");
    map.setLayoutProperty("streets-basemap", "visibility", basemap === "streets" ? "visible" : "none");
  }, [basemap]);

  useEffect(() => {
    const map = mapRef.current;
    const Marker = markerClassRef.current;
    if (!map || !Marker || !selectedLocation) return;
    markerRef.current?.remove();
    const markerElement = document.createElement("div");
    markerElement.className = "satquery-location-marker";
    markerElement.setAttribute("aria-label", `Selected location: ${selectedLocation.label}`);
    markerRef.current = new Marker({ element: markerElement, anchor: "bottom" }).setLngLat(selectedLocation.center).addTo(map);
    if (selectedLocation.boundingBox) {
      map.fitBounds([[selectedLocation.boundingBox[0], selectedLocation.boundingBox[1]], [selectedLocation.boundingBox[2], selectedLocation.boundingBox[3]]], { padding: 80, duration: 1400, maxZoom: SEARCH_FLY_ZOOM });
    } else {
      map.flyTo({ center: selectedLocation.center, zoom: Math.max(map.getZoom(), SEARCH_FLY_ZOOM), duration: 1400, essential: true });
    }
  }, [selectedLocation]);

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

  return <div className="absolute inset-0"><div ref={containerRef} className="h-full w-full" aria-label="Interactive geospatial map" /></div>;
}

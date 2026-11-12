import type { BasemapId } from "./mapConfig";

export interface BasemapDefinition {
  id: BasemapId;
  label: string;
  tiles: string[];
  tileSize: number;
  maxzoom: number;
  attribution: string;
}

export const BASEMAPS: Record<BasemapId, BasemapDefinition> = {
  satellite: {
    id: "satellite",
    label: "Satellite",
    tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
    tileSize: 256,
    maxzoom: 19,
    attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  },
  streets: {
    id: "streets",
    label: "Streets",
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    tileSize: 256,
    maxzoom: 19,
    attribution: "© OpenStreetMap contributors",
  },
};

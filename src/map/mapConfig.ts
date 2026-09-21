export type ProjectionMode = "globe" | "flat";
export type BasemapId = "satellite" | "streets";

export const INITIAL_MAP_VIEW = {
  center: [0, 20] as [number, number],
  zoom: -1.1,
  bearing: 0,
  pitch: 0,
};

export const SEARCH_FLY_ZOOM = 10;

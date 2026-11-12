import { expect, test } from "bun:test";
import { BASEMAPS } from "../src/map/basemaps.ts";
import { MAX_DISPLAY_ZOOM } from "../src/map/mapConfig.ts";

test("satellite keeps close zoom available and overzooms real imagery instead of requesting placeholder tiles", () => {
  expect(BASEMAPS.satellite.maxzoom).toBe(19);
  expect(MAX_DISPLAY_ZOOM).toBe(22);
  expect(MAX_DISPLAY_ZOOM).toBeGreaterThan(BASEMAPS.satellite.maxzoom);
});

test("streets remain zoomable beyond their native tile level", () => {
  expect(BASEMAPS.streets.maxzoom).toBe(19);
  expect(MAX_DISPLAY_ZOOM).toBeGreaterThan(BASEMAPS.streets.maxzoom);
});
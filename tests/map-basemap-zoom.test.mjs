import { expect, test } from "bun:test";
import { BASEMAPS } from "../src/map/basemaps.ts";
import { MAX_DISPLAY_ZOOM } from "../src/map/mapConfig.ts";

test("satellite requests stop before the no-data imagery level in the reported location", () => {
  expect(BASEMAPS.satellite.maxzoom).toBe(18);
});

test("users can zoom beyond the satellite tile source and inspect its scale", () => {
  expect(MAX_DISPLAY_ZOOM).toBe(22);
  expect(MAX_DISPLAY_ZOOM).toBeGreaterThan(BASEMAPS.satellite.maxzoom);
});

test("street tiles retain their configured native zoom limit", () => {
  expect(BASEMAPS.streets.maxzoom).toBe(19);
});
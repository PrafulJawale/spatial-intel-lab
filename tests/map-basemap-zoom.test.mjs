import { expect, test } from "bun:test";
import { BASEMAPS } from "../src/map/basemaps.ts";

test("satellite zoom stops at the configured native imagery limit instead of magnifying blurry tiles", () => {
  expect(BASEMAPS.satellite.maxzoom).toBe(18);
});

test("street zoom stops at its configured native imagery limit", () => {
  expect(BASEMAPS.streets.maxzoom).toBe(19);
});
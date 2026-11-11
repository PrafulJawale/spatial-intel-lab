import { expect, test } from "bun:test";
import { BASEMAPS } from "../src/map/basemaps.ts";

test("satellite zoom stops before the provider's placeholder tiles seen at level 18", () => {
  expect(BASEMAPS.satellite.maxzoom).toBe(17);
});

test("street zoom stops at its configured native imagery limit", () => {
  expect(BASEMAPS.streets.maxzoom).toBe(19);
});
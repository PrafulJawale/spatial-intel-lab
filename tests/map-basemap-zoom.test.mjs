import { expect, test } from "bun:test";
import { getBasemapZoomLimit } from "../src/map/basemaps.ts";

test("satellite imagery stays within the provider's available zoom range", () => {
  expect(getBasemapZoomLimit("satellite")).toBe(19);
});

test("street tiles stay within their configured zoom range", () => {
  expect(getBasemapZoomLimit("streets")).toBe(19);
});
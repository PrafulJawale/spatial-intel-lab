export interface GeocodingResult {
  id: string;
  label: string;
  center: [number, number];
  boundingBox?: [number, number, number, number];
}

export class GeocodingError extends Error {
  constructor(message: string, readonly kind: "network" | "rate-limit") {
    super(message);
    this.name = "GeocodingError";
  }
}

const coordinatePattern = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/;

function coordinateResult(query: string): GeocodingResult | null {
  const match = coordinatePattern.exec(query);
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { id: `coordinates-${latitude}-${longitude}`, label: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, center: [longitude, latitude] };
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox?: string[];
}

export async function searchLocations(query: string, signal?: AbortSignal): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const coordinates = coordinateResult(trimmed);
  if (coordinates) return [coordinates];
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  let response: Response;
  try {
    response = await fetch(url, { ...(signal ? { signal } : {}), headers: { Accept: "application/json" } });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new GeocodingError("Location search is temporarily unavailable.", "network");
  }
  if (response.status === 429) throw new GeocodingError("Search limit reached. Please wait a moment and try again.", "rate-limit");
  if (!response.ok) throw new GeocodingError("Location search is temporarily unavailable.", "network");
  const data = await response.json() as NominatimResult[];
  return data.flatMap((item) => {
    const latitude = Number(item.lat);
    const longitude = Number(item.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
    const box = item.boundingbox?.map(Number);
    const boundingBox = box?.length === 4 && box.every(Number.isFinite)
      ? [box[2], box[0], box[3], box[1]] as [number, number, number, number]
      : undefined;
    return [{ id: String(item.place_id), label: item.display_name, center: [longitude, latitude] as [number, number], ...(boundingBox ? { boundingBox } : {}) }];
  });
}

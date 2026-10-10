export interface LngLat {
  lng: number;
  lat: number;
}

export type Position = [number, number];

export type MeasureTool = "none" | "distance" | "area" | "inspect";

export interface MeasurementResult {
  tool: Exclude<MeasureTool, "none">;
  vertices: LngLat[];
  /** Distance along the path in metres (distance tool). */
  distanceMeters: number | null;
  /** Planar-on-sphere polygon area in square metres (area tool). */
  areaSquareMeters: number | null;
  perimeterMeters: number | null;
  lastSegmentBearing: number | null;
  finished: boolean;
}

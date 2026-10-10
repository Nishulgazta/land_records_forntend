import type { LngLat } from "../types-gis";

const EARTH_RADIUS_M = 6371008.8;
const AUTHALIC_RADIUS_M = 6378137;

export const DEG = Math.PI / 180;

export function toRadians(degrees: number): number {
  return degrees * DEG;
}

export function toDegrees(radians: number): number {
  return radians / DEG;
}

/** Great-circle distance in metres (haversine, mean Earth radius). */
export function haversineMeters(a: LngLat, b: LngLat): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Initial bearing in degrees (0–360) from a to b. */
export function bearingDegrees(a: LngLat, b: LngLat): number {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const dLng = toRadians(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const deg = toDegrees(Math.atan2(y, x));
  return (deg + 360) % 360;
}

/** Cumulative path length in metres for a sequence of vertices. */
export function pathLengthMeters(points: LngLat[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += haversineMeters(points[i - 1], points[i]);
  }
  return total;
}

/**
 * Spherical polygon area in square metres using the classic
 * spherical-trapezoid decomposition used by `geojson-area`.
 * Suitable for small parcels; results are approximate, not survey-grade.
 */
export function ringAreaSquareMeters(ring: number[][]): number {
  if (ring.length < 3) return 0;
  let area = 0;
  const len = ring.length;
  for (let i = 0; i < len; i += 1) {
    let lowerIdx: number;
    let middleIdx: number;
    let upperIdx: number;
    if (i === len - 2) {
      lowerIdx = len - 2;
      middleIdx = len - 1;
      upperIdx = 0;
    } else if (i === len - 1) {
      lowerIdx = len - 1;
      middleIdx = 0;
      upperIdx = 1;
    } else {
      lowerIdx = i;
      middleIdx = i + 1;
      upperIdx = i + 2;
    }
    const p1 = ring[lowerIdx];
    const p2 = ring[middleIdx];
    const p3 = ring[upperIdx];
    area += (toRadians(p3[0]) - toRadians(p1[0])) * Math.sin(toRadians(p2[1]));
  }
  area = (area * AUTHALIC_RADIUS_M * AUTHALIC_RADIUS_M) / 2;
  return Math.abs(area);
}

export function polygonAreaSquareMeters(
  rings: number[][][],
): number {
  if (rings.length === 0) return 0;
  const outer = ringAreaSquareMeters(rings[0]);
  let holes = 0;
  for (let i = 1; i < rings.length; i += 1) {
    holes += ringAreaSquareMeters(rings[i]);
  }
  return Math.max(0, outer - holes);
}

export function polygonPerimeterMeters(
  rings: number[][][],
): number {
  if (rings.length === 0) return 0;
  let total = 0;
  for (const ring of rings) {
    for (let i = 1; i < ring.length; i += 1) {
      total += haversineMeters(
        { lng: ring[i - 1][0], lat: ring[i - 1][1] },
        { lng: ring[i][0], lat: ring[i][1] },
      );
    }
  }
  return total;
}

/** Point-in-polygon test using the ray-casting algorithm. */
export function pointInRing(
  point: LngLat,
  ring: number[][],
): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export interface LngLatBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export function boundsOfPoints(points: LngLat[]): LngLatBounds | null {
  if (points.length === 0) return null;
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const p of points) {
    west = Math.min(west, p.lng);
    east = Math.max(east, p.lng);
    south = Math.min(south, p.lat);
    north = Math.max(north, p.lat);
  }
  return { west, south, east, north };
}

export function bearingLabel(degrees: number): string {
  const labels = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return labels[index];
}

export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters)) return "—";
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${meters.toFixed(1)} m`;
}

export function formatArea(squareMeters: number): string {
  if (!Number.isFinite(squareMeters)) return "—";
  if (squareMeters >= 1_000_000) {
    return `${(squareMeters / 1_000_000).toFixed(2)} km²`;
  }
  if (squareMeters >= 10_000) {
    return `${(squareMeters / 10_000).toFixed(2)} ha`;
  }
  return `${squareMeters.toFixed(1)} m²`;
}

export function squareMetersToHectares(squareMeters: number): number {
  return squareMeters / 10_000;
}

export function squareMetersToAcres(squareMeters: number): number {
  return squareMeters / 4046.8564224;
}

export function hectaresToSquareMeters(hectares: number): number {
  return hectares * 10_000;
}

/**
 * Approximate local resolution (metres per degree) at a latitude, used to
 * keep demonstration grids roughly square.
 */
export function metresPerDegree(lat: number): { x: number; y: number } {
  const y = 111_132.92 - 559.82 * Math.cos(2 * toRadians(lat));
  let x = 111_412.84 * Math.cos(toRadians(lat)) - 93.5 * Math.cos(3 * toRadians(lat));
  if (Math.abs(x) < 1) x = 1;
  return { x, y };
}

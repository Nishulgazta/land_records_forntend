import type { Feature, FeatureCollection, Geometry, Position } from "geojson";
import type { LngLat } from "@/lib/types-gis";
import { boundsOfPoints, type LngLatBounds } from "./geo";

export interface ParcelFeatureProperties {
  id: string;
  surveyNumber: string;
  subdivisionNumber: string | null;
  village: string;
  mandal: string;
  district: string;
  classification: string;
  areaHectares: number;
  landholder: string;
  recordId: string | null;
  provenance: string;
}

export interface ParcelFeature extends Feature {
  id: string;
  geometry: Geometry;
  properties: ParcelFeatureProperties;
}

export function forEachPosition(
  geometry: Geometry,
  visit: (position: Position) => void,
): void {
  switch (geometry.type) {
    case "Polygon":
      for (const ring of geometry.coordinates) {
        for (const position of ring) visit(position);
      }
      break;
    case "MultiPolygon":
      for (const polygon of geometry.coordinates) {
        for (const ring of polygon) {
          for (const position of ring) visit(position);
        }
      }
      break;
    default:
      break;
  }
}

export function geometryBounds(
  geometry: Geometry,
): { bounds: LngLatBounds; center: LngLat } | null {
  const points: LngLat[] = [];
  forEachPosition(geometry, (position) => {
    points.push({ lng: position[0], lat: position[1] });
  });
  const bounds = boundsOfPoints(points);
  if (!bounds) return null;
  return {
    bounds,
    center: {
      lng: (bounds.west + bounds.east) / 2,
      lat: (bounds.south + bounds.north) / 2,
    },
  };
}

export interface ParcelLike {
  id: string;
  surveyNumber: string;
  subdivisionNumber: string | null;
  village: string;
  mandal: string;
  district: string;
  areaHectares: number;
  classification: string;
  landholderLabel: string;
  recordId: string | null;
  geometry: Geometry;
  provenance: { label: string };
}

export function parcelsToFeatureCollection(
  parcels: ParcelLike[],
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: parcels.map((parcel) => ({
      type: "Feature",
      id: parcel.id,
      geometry: parcel.geometry,
      properties: {
        id: parcel.id,
        surveyNumber: parcel.surveyNumber,
        subdivisionNumber: parcel.subdivisionNumber,
        village: parcel.village,
        mandal: parcel.mandal,
        district: parcel.district,
        classification: parcel.classification,
        areaHectares: parcel.areaHectares,
        landholder: parcel.landholderLabel,
        recordId: parcel.recordId ?? "",
        provenance: parcel.provenance.label,
      },
    })) as ParcelFeature[],
  };
}

export function boundsForParcels(parcels: ParcelLike[]): LngLatBounds | null {
  const points: LngLat[] = [];
  for (const parcel of parcels) {
    forEachPosition(parcel.geometry, (position) => {
      points.push({ lng: position[0], lat: position[1] });
    });
  }
  return boundsOfPoints(points);
}

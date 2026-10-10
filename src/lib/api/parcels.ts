import type { FeatureCollection } from "geojson";
import type { Parcel } from "../types";
import { ApiError } from "../types";
import { IS_MOCK_MODE, apiFetch } from "./client";
import {
  getParcelById as getMockParcelById,
  MOCK_PARCELS,
  parcelsForVillageIds,
  searchParcels as searchMockParcels,
  toFeatureCollection,
} from "../mock/parcels";

export interface ParcelQuery {
  district?: string | null;
  mandal?: string | null;
  village?: string | null;
  surveyNumber?: string | null;
  subdivision?: string | null;
}

export interface ParcelSearchResult {
  parcels: Parcel[];
  featureCollection: FeatureCollection;
  provenanceNote: string;
}

const PROVENANCE_NOTE =
  "Demonstration geometry only — polygons are synthetic and must not be treated as official cadastral boundaries.";

export async function searchParcelLibrary(
  query: ParcelQuery,
): Promise<ParcelSearchResult> {
  if (IS_MOCK_MODE) {
    const parcels = searchMockParcels(
      query.district ?? null,
      query.mandal ?? null,
      query.village ?? null,
      query.surveyNumber ?? null,
      query.subdivision ?? null,
    );
    return {
      parcels,
      featureCollection: toFeatureCollection(parcels),
      provenanceNote: PROVENANCE_NOTE,
    };
  }

  const params = new URLSearchParams();
  if (query.district) params.set("district", query.district);
  if (query.mandal) params.set("mandal", query.mandal);
  if (query.village) params.set("village", query.village);
  if (query.surveyNumber) params.set("survey", query.surveyNumber);
  if (query.subdivision) params.set("subdivision", query.subdivision);
  return apiFetch<ParcelSearchResult>(`/parcels?${params.toString()}`);
}

export async function getVillageParcels(
  district: string,
  mandal: string,
  village: string,
): Promise<ParcelSearchResult> {
  if (IS_MOCK_MODE) {
    const parcels = parcelsForVillageIds(district, mandal, village);
    return {
      parcels,
      featureCollection: toFeatureCollection(parcels),
      provenanceNote: PROVENANCE_NOTE,
    };
  }
  const params = new URLSearchParams({ district, mandal, village });
  return apiFetch<ParcelSearchResult>(`/parcels/by-location?${params.toString()}`);
}

export async function getParcelById(id: string): Promise<Parcel> {
  if (IS_MOCK_MODE) {
    const parcel = getMockParcelById(id);
    if (!parcel) throw new ApiError(`Parcel ${id} not found`, `/parcels/${id}`, 404);
    return parcel;
  }
  return apiFetch<Parcel>(`/parcels/${id}`);
}

export async function listAllParcels(): Promise<Parcel[]> {
  if (IS_MOCK_MODE) return MOCK_PARCELS;
  return apiFetch<Parcel[]>("/parcels");
}

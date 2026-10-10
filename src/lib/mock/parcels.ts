import type { Feature, FeatureCollection } from "geojson";
import type { Parcel, ParcelClassification, Provenance } from "../types";
import { polygonAreaSquareMeters } from "../gis/geo";
import { AP_STATE, findVillage, villageCenter } from "./locations";
import { seededRandom } from "./random";

/**
 * Synthetic demonstration parcels.
 *
 * These polygons are generated on a jittered grid around approximate
 * demonstration village centres. They are NOT official cadastral boundaries
 * and must never be presented as verified or government-sourced geometry.
 */

export const DEMO_PARCEL_PROVENANCE: Provenance = {
  kind: "demonstration-geometry",
  label: "Demonstration geometry",
  note: "Synthetic reference polygons — not official cadastral boundaries.",
};

const CLASSIFICATIONS: ParcelClassification[] = [
  "Agricultural — wet land",
  "Agricultural — dry land",
  "Agricultural — plantation",
  "Residential",
  "Government wasteland",
  "Road / utility",
];

const HOLDER_SUFFIXES = [
  "Reddy",
  "Naidu",
  "Rao",
  "Sharma",
  "Goud",
  "Kumari",
  "Prasad",
  "Devi",
];
const HOLDER_GIVEN = [
  "Venkateswara",
  "Sridevi",
  "Mohan",
  "Anand",
  "Lakshmi",
  "Prakash",
  "Suresh",
  "Kavitha",
  "Ramesh",
  "Bhavana",
];
const HOLDER_INITIALS = ["R.", "K.", "S.", "P.", "M.", "T.", "A.", "G."];

interface ParcelSpec {
  surveyNumber: string;
  subdivisionNumber: string | null;
}

function specsForVillage(surveyNumbers: string[]): ParcelSpec[] {
  const specs: ParcelSpec[] = [];
  surveyNumbers.forEach((surveyNumber, index) => {
    if (index === 0) {
      specs.push({ surveyNumber, subdivisionNumber: "1" });
      specs.push({ surveyNumber, subdivisionNumber: "2" });
    } else {
      specs.push({ surveyNumber, subdivisionNumber: null });
    }
  });
  return specs;
}

function jitteredRectangle(
  originLng: number,
  originLat: number,
  widthDeg: number,
  heightDeg: number,
  random: () => number,
): Array<[number, number]> {
  const jx = () => (random() - 0.5) * widthDeg * 0.34;
  const jy = () => (random() - 0.5) * heightDeg * 0.34;

  const corners: Array<[number, number]> = [
    [originLng, originLat],
    [originLng + widthDeg, originLat],
    [originLng + widthDeg, originLat + heightDeg],
    [originLng, originLat + heightDeg],
  ].map(([lng, lat]) => [lng + jx(), lat + jy()] as [number, number]);

  // Insert jittered mid-points so shapes are not perfect rectangles.
  const ring: Array<[number, number]> = [];
  for (let i = 0; i < corners.length; i += 1) {
    const current = corners[i];
    const next = corners[(i + 1) % corners.length];
    ring.push(current);
    const midLng = (current[0] + next[0]) / 2 + jx() * 0.5;
    const midLat = (current[1] + next[1]) / 2 + jy() * 0.5;
    ring.push([midLng, midLat]);
  }
  ring.push(ring[0]);
  return ring;
}

function buildParcels(): Parcel[] {
  const parcels: Parcel[] = [];
  let counter = 0;

  for (const district of AP_STATE.districts) {
    for (const mandal of district.mandals) {
      for (const village of mandal.villages) {
        const center = villageCenter(village.id);
        if (!center) continue;
        const specs = specsForVillage(village.surveyNumbers);
        const cols = 3;
        const cellWidth = 0.0018;
        const cellHeight = 0.0014;
        const gridRows = Math.ceil(specs.length / cols);
        const gridWidth = cols * cellWidth;
        const gridHeight = gridRows * cellHeight;

        specs.forEach((spec, index) => {
          const random = seededRandom(`${village.id}:${spec.surveyNumber}:${spec.subdivisionNumber ?? "-"}`);
          const col = index % cols;
          const row = Math.floor(index / cols);
          const originLng =
            center.lng - gridWidth / 2 + col * cellWidth + cellWidth * 0.12;
          const originLat =
            center.lat + gridHeight / 2 - (row + 1) * cellHeight + cellHeight * 0.12;
          const ring = jitteredRectangle(
            originLng,
            originLat,
            cellWidth * 0.76,
            cellHeight * 0.76,
            random,
          );

          const geometry = {
            type: "Polygon" as const,
            coordinates: [ring],
          };
          const areaHectares = polygonAreaSquareMeters([ring]) / 10_000;
          counter += 1;

          const classification =
            CLASSIFICATIONS[Math.floor(random() * CLASSIFICATIONS.length)];
          const holder = `${HOLDER_INITIALS[Math.floor(random() * HOLDER_INITIALS.length)]} ${
           HOLDER_GIVEN[Math.floor(random() * HOLDER_GIVEN.length)]
          } ${HOLDER_SUFFIXES[Math.floor(random() * HOLDER_SUFFIXES.length)]}`;

          const id = `DEMO-PARC-${String(counter).padStart(4, "0")}`;

          parcels.push({
            id,
            surveyNumber: spec.surveyNumber,
            subdivisionNumber: spec.subdivisionNumber,
            village: village.name,
            mandal: mandal.name,
            district: district.name,
            state: "Andhra Pradesh",
            areaHectares: Number(areaHectares.toFixed(3)),
            classification,
            landholderLabel: holder,
            recordId: null,
            geometry,
            provenance: DEMO_PARCEL_PROVENANCE,
            attributes: {
              "Parcel ID": id,
              "Survey no.": spec.surveyNumber,
              "Subdivision": spec.subdivisionNumber ?? "—",
              Village: village.name,
              Mandal: mandal.name,
              District: district.name,
              Classification: classification,
              "Area (ha)": Number(areaHectares.toFixed(3)),
              "Record link": "pending",
              Source: "Demonstration geometry",
            },
          });
        });
      }
    }
  }

  return parcels;
}

export const MOCK_PARCELS: Parcel[] = buildParcels();

export function getParcelById(id: string): Parcel | undefined {
  return MOCK_PARCELS.find((parcel) => parcel.id === id);
}

export function parcelsForVillageIds(
  district: string,
  mandal: string,
  village: string,
): Parcel[] {
  return MOCK_PARCELS.filter(
    (parcel) =>
      parcel.district === district &&
      parcel.mandal === mandal &&
      parcel.village === village,
  );
}

export function listVillageKeys(): Array<{
  district: string;
  mandal: string;
  village: string;
}> {
  const keys: Array<{ district: string; mandal: string; village: string }> = [];
  for (const d of AP_STATE.districts) {
    for (const m of d.mandals) {
      for (const v of m.villages) {
        keys.push({ district: d.name, mandal: m.name, village: v.name });
      }
    }
  }
  return keys;
}

export function parcelToFeature(
  parcel: Parcel,
  includeAttributes = true,
): Feature {
  return {
    type: "Feature",
    id: parcel.id,
    geometry: parcel.geometry,
    properties: includeAttributes
      ? { ...parcel.attributes, provenance: parcel.provenance.label, recordId: parcel.recordId }
      : {
          id: parcel.id,
          surveyNumber: parcel.surveyNumber,
          subdivisionNumber: parcel.subdivisionNumber,
          provenance: parcel.provenance.label,
        },
  };
}

export function toFeatureCollection(
  parcels: Parcel[],
  includeAttributes = true,
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: parcels.map((parcel) => parcelToFeature(parcel, includeAttributes)),
  };
}

/** Resolve a survey/subdivision search against the demonstration parcels. */
export function searchParcels(
  district: string | null,
  mandal: string | null,
  village: string | null,
  surveyNumber: string | null,
  subdivision: string | null,
): Parcel[] {
  return MOCK_PARCELS.filter((parcel) => {
    if (district && parcel.district !== district) return false;
    if (mandal && parcel.mandal !== mandal) return false;
    if (village && parcel.village !== village) return false;
    if (surveyNumber && parcel.surveyNumber !== surveyNumber.trim()) return false;
    if (subdivision && (parcel.subdivisionNumber ?? "") !== subdivision.trim()) {
      return false;
    }
    return true;
  });
}

export function villageExists(
  district: string,
  mandal: string,
  village: string,
): boolean {
  for (const d of AP_STATE.districts) {
    if (d.name !== district) continue;
    for (const m of d.mandals) {
      if (m.name !== mandal) continue;
      if (m.villages.some((v) => v.name === village)) return true;
    }
  }
  return false;
}

export function villageIdByName(
  district: string,
  mandal: string,
  village: string,
): string | null {
  for (const d of AP_STATE.districts) {
    if (d.name !== district) continue;
    for (const m of d.mandals) {
      if (m.name !== mandal) continue;
      const v = m.villages.find((x) => x.name === village);
      if (v) return v.id;
    }
  }
  return null;
}

export function villageIdExists(villageId: string): boolean {
  return findVillage(villageId) !== null;
}

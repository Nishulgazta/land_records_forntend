import type { StyleSpecification } from "maplibre-gl";
import type { BasemapId, ParcelClassification } from "@/lib/types";

export interface BasemapOption {
  id: BasemapId;
  label: string;
  description: string;
  attribution: string;
}

export const BASEMAPS: BasemapOption[] = [
  {
    id: "positron",
    label: "Positron",
    description: "Light monochrome reference basemap for analytics.",
    attribution: "© OpenStreetMap contributors, OpenFreeMap",
  },
  {
    id: "liberty",
    label: "Liberty",
    description: "Colour street basemap for field orientation.",
    attribution: "© OpenStreetMap contributors, OpenFreeMap",
  },
  {
    id: "satellite",
    label: "Satellite",
    description: "Esri World Imagery aerial tiles.",
    attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
  },
];

export const BASEMAP_LABELS: Record<BasemapId, string> = {
  positron: "Positron",
  liberty: "Liberty",
  satellite: "Satellite",
};

const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    satellite: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [{ id: "satellite", type: "raster", source: "satellite" }],
};

export function basemapStyle(id: BasemapId): string | StyleSpecification {
  if (id === "satellite") return SATELLITE_STYLE;
  if (id === "liberty") return "https://tiles.openfreemap.org/styles/liberty";
  return "https://tiles.openfreemap.org/styles/positron";
}

/** AWS Terrain Tiles (Terrarium encoding) used for hillshade and 3D terrain. */
export const TERRAIN_TILES = [
  "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
];

export const TERRAIN_SOURCE_ID = "terrain-dem";

export const CLASSIFICATION_COLORS: Record<ParcelClassification, string> = {
  "Agricultural — wet land": "#2f8f83",
  "Agricultural — dry land": "#c9a227",
  "Agricultural — plantation": "#5f9e3f",
  Residential: "#c96a4b",
  Commercial: "#8b5cf6",
  "Government wasteland": "#9ca3af",
  "Road / utility": "#64748b",
};

export const CLASSIFICATION_ENTRIES = Object.entries(
  CLASSIFICATION_COLORS,
) as Array<[ParcelClassification, string]>;

import type { ExportFormat, ExportFormatInfo, ExportJob, ExportOptions, Parcel } from "../types";
import { IS_MOCK_MODE, API_MODE, apiFetch } from "./client";
import { createClientExport } from "../gis/exporters";

export const EXPORT_FORMATS: ExportFormatInfo[] = [
  {
    format: "geojson",
    label: "GeoJSON",
    extension: "geojson",
    description: "Standard vector interchange format with full attributes.",
    execution: "client",
    keepsAttributes: true,
    keepsProvenance: true,
  },
  {
    format: "csv",
    label: "CSV table",
    extension: "csv",
    description: "Attribute table with WKT geometry column.",
    execution: "client",
    keepsAttributes: true,
    keepsProvenance: true,
  },
  {
    format: "kml",
    label: "KML",
    extension: "kml",
    description: "Google Earth compatible vector file.",
    execution: "client",
    keepsAttributes: true,
    keepsProvenance: true,
  },
  {
    format: "kmz",
    label: "KMZ (zipped KML)",
    extension: "kmz",
    description: "Compressed KML archive for Google Earth.",
    execution: "client",
    keepsAttributes: true,
    keepsProvenance: true,
  },
  {
    format: "dxf",
    label: "DXF (R12)",
    extension: "dxf",
    description: "CAD interchange — polygon outlines and labels in geographic degrees.",
    execution: "client",
    keepsAttributes: false,
    keepsProvenance: false,
  },
  {
    format: "png",
    label: "PNG image",
    extension: "png",
    description: "Schematic render of the selected parcel geometry.",
    execution: "client",
    keepsAttributes: false,
    keepsProvenance: true,
  },
  {
    format: "jpg",
    label: "JPG image",
    extension: "jpg",
    description: "Schematic render of the selected parcel geometry.",
    execution: "client",
    keepsAttributes: false,
    keepsProvenance: true,
  },
  {
    format: "shapefile",
    label: "Shapefile",
    extension: "zip",
    description: "ESRI Shapefile bundle (.shp/.dbf/.shx/.prj) — requires server-side GIS writer.",
    execution: "server",
    keepsAttributes: true,
    keepsProvenance: true,
  },
  {
    format: "geopackage",
    label: "GeoPackage",
    extension: "gpkg",
    description: "OGC GeoPackage (SQLite) — requires server-side GIS writer.",
    execution: "server",
    keepsAttributes: true,
    keepsProvenance: true,
  },
  {
    format: "pdf",
    label: "PDF map sheet",
    extension: "pdf",
    description: "Cartographic PDF layout — requires server-side rendering.",
    execution: "server",
    keepsAttributes: true,
    keepsProvenance: true,
  },
  {
    format: "dem_geotiff",
    label: "DEM / GeoTIFF",
    extension: "tif",
    description: "Terrain elevation raster for the selected area — requires an elevation service.",
    execution: "server",
    keepsAttributes: false,
    keepsProvenance: true,
  },
  {
    format: "xyz_points",
    label: "XYZ elevation points",
    extension: "csv",
    description: "Gridded elevation samples — requires an elevation service.",
    execution: "server",
    keepsAttributes: false,
    keepsProvenance: true,
  },
];

export function getFormatInfo(format: ExportFormat): ExportFormatInfo {
  const info = EXPORT_FORMATS.find((candidate) => candidate.format === format);
  if (!info) throw new Error(`Unknown export format: ${format}`);
  return info;
}

/** Session-only history of export attempts created in this browser tab. */
const sessionJobs: ExportJob[] = [];

export function listSessionExportJobs(): ExportJob[] {
  return [...sessionJobs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function baseJob(
  format: ExportFormat,
  featureCount: number,
  options: ExportOptions,
  fileName: string,
): ExportJob {
  return {
    id: `EXP-${Date.now().toString(36).toUpperCase()}`,
    format,
    status: "queued",
    createdAt: new Date().toISOString(),
    completedAt: null,
    featureCount,
    options,
    fileName,
    sizeBytes: null,
    downloadUrl: null,
    error: null,
    provenance: {
      kind: IS_MOCK_MODE ? "mock-sample" : "backend",
      label: IS_MOCK_MODE ? "Generated in your browser (mock mode)" : "Backend export",
    },
  };
}

export interface CreateExportInput {
  format: ExportFormat;
  parcels: Parcel[];
  options: ExportOptions;
  scopeLabel: string;
}

/**
 * Create an export job.
 *
 * - Client formats are generated in the browser and returned with a real
 *   object URL that only works for the current session.
 * - Server formats call the backend endpoint; while no backend is connected
 *   they return an explicit "unsupported" job rather than a fake download.
 */
export async function createExport(input: CreateExportInput): Promise<ExportJob> {
  const info = getFormatInfo(input.format);

  if (info.execution === "server") {
    const job: ExportJob = {
      ...baseJob(
        input.format,
        input.parcels.length,
        input.options,
        `${input.scopeLabel}.${info.extension}`,
      ),
      status: IS_MOCK_MODE ? "unsupported" : "queued",
      error: IS_MOCK_MODE
        ? "Server-side export endpoint is not connected. This format needs backend GIS/CAD processing."
        : null,
    };

    if (!IS_MOCK_MODE) {
      try {
        const remote = await apiFetch<ExportJob>("/exports", {
          method: "POST",
          body: JSON.stringify({
            format: input.format,
            options: input.options,
            scope: input.scopeLabel,
            featureCount: input.parcels.length,
          }),
        });
        sessionJobs.push(remote);
        return remote;
      } catch (error) {
        const failed: ExportJob = {
          ...job,
          status: "failed",
          error: error instanceof Error ? error.message : "Export request failed",
        };
        sessionJobs.push(failed);
        return failed;
      }
    }

    sessionJobs.push(job);
    return job;
  }

  if (typeof window === "undefined") {
    const job: ExportJob = {
      ...baseJob(input.format, input.parcels.length, input.options, input.scopeLabel),
      status: "failed",
      error: "Client-side exports must run in the browser.",
    };
    sessionJobs.push(job);
    return job;
  }

  const running: ExportJob = {
    ...baseJob(input.format, input.parcels.length, input.options, input.scopeLabel),
    status: "running",
  };
  sessionJobs.push(running);

  try {
    const generated = await createClientExport(
      input.format,
      input.parcels,
      input.options,
      input.scopeLabel,
    );
    const url = URL.createObjectURL(generated.blob);
    const completed: ExportJob = {
      ...running,
      status: "completed",
      completedAt: new Date().toISOString(),
      fileName: generated.fileName,
      sizeBytes: generated.blob.size,
      downloadUrl: url,
    };
    replaceSessionJob(completed);
    return completed;
  } catch (error) {
    const failed: ExportJob = {
      ...running,
      status: "failed",
      completedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Export failed in the browser.",
    };
    replaceSessionJob(failed);
    return failed;
  }
}

function replaceSessionJob(job: ExportJob): void {
  const index = sessionJobs.findIndex((candidate) => candidate.id === job.id);
  if (index >= 0) sessionJobs[index] = job;
}

/** Trigger a browser download for a completed session job. */
export function downloadExportJob(job: ExportJob): void {
  if (!job.downloadUrl) return;
  const anchor = document.createElement("a");
  anchor.href = job.downloadUrl;
  anchor.download = job.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export const SUPPORTED_CRS = [
  { code: "EPSG:4326", label: "WGS 84 — geographic (degrees)" },
  { code: "EPSG:3857", label: "Web Mercator — projected (metres)" },
  { code: "EPSG:32643", label: "WGS 84 / UTM zone 43N — projected (metres)" },
  { code: "EPSG:32644", label: "WGS 84 / UTM zone 44N — projected (metres)" },
];

export function defaultExportOptions(crs: string): ExportOptions {
  return {
    crs,
    includeAttributes: true,
    includeProvenance: true,
    includeUnselected: false,
    scope: "selection",
  };
}

export const EXPORT_MODE_LABEL =
  API_MODE === "mock"
    ? "Backend export service not connected — server formats are unavailable."
    : "Backend export service connected.";

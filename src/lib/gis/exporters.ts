import type { ExportFormat, ExportOptions, Parcel } from "../types";

/**
 * Client-side export generators.
 *
 * These formats are produced entirely in the browser from the parcel
 * geometry currently loaded — no server involved. Formats that require
 * server-side GIS/CAD processing are declared separately and are never
 * faked here.
 */

export interface GeneratedExport {
  blob: Blob;
  fileName: string;
}

export const CLIENT_EXPORT_FORMATS: ExportFormat[] = [
  "geojson",
  "csv",
  "kml",
  "kmz",
  "dxf",
  "png",
  "jpg",
];

export function isClientExportFormat(format: ExportFormat): boolean {
  return CLIENT_EXPORT_FORMATS.includes(format);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function buildExportFileName(
  format: ExportFormat,
  scopeLabel: string,
  extension: string,
): string {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `bhumi_${slugify(scopeLabel) || "selection"}_${stamp}.${extension}`;
}

/* ----------------------------------------------------------------- *
 * GeoJSON
 * ----------------------------------------------------------------- */

function featureProperties(parcel: Parcel, options: ExportOptions): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    id: parcel.id,
    surveyNumber: parcel.surveyNumber,
    subdivisionNumber: parcel.subdivisionNumber,
    village: parcel.village,
    mandal: parcel.mandal,
    district: parcel.district,
    state: parcel.state,
    areaHectares: parcel.areaHectares,
    classification: parcel.classification,
    recordId: parcel.recordId,
  };
  if (options.includeAttributes) {
    properties.attributes = parcel.attributes;
  }
  if (options.includeProvenance) {
    properties.provenance = {
      kind: parcel.provenance.kind,
      label: parcel.provenance.label,
      note: parcel.provenance.note,
    };
  }
  return properties;
}

export function generateGeoJSON(parcels: Parcel[], options: ExportOptions): Blob {
  const collection = {
    type: "FeatureCollection" as const,
    name: "bhumi_parcels",
    crs: {
      type: "name" as const,
      properties: { name: options.crs },
    },
    features: parcels.map((parcel) => ({
      type: "Feature" as const,
      id: parcel.id,
      geometry: parcel.geometry,
      properties: featureProperties(parcel, options),
    })),
  };
  return new Blob([JSON.stringify(collection, null, 2)], {
    type: "application/geo+json",
  });
}

/* ----------------------------------------------------------------- *
 * CSV
 * ----------------------------------------------------------------- */

function ringToWkt(ring: number[][]): string {
  return ring.map(([lng, lat]) => `${lng} ${lat}`).join(", ");
}

function parcelToWkt(parcel: Parcel): string {
  if (parcel.geometry.type === "Polygon") {
    const rings = parcel.geometry.coordinates.map((ring) => `(${ringToWkt(ring)})`);
    return `POLYGON (${rings.join(", ")})`;
  }
  if (parcel.geometry.type === "MultiPolygon") {
    const polys = parcel.geometry.coordinates.map(
      (polygon) => `(${polygon.map((ring) => `(${ringToWkt(ring)})`).join(", ")})`,
    );
    return `MULTIPOLYGON (${polys.join(", ")})`;
  }
  return "";
}

function csvEscape(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function generateCSV(parcels: Parcel[], options: ExportOptions): Blob {
  const headers = [
    "parcel_id",
    "survey_number",
    "subdivision",
    "village",
    "mandal",
    "district",
    "state",
    "area_hectares",
    "classification",
    "record_id",
    "landholder_sample",
  ];
  if (options.includeProvenance) headers.push("provenance");
  if (options.includeAttributes) headers.push("attribute_notes");
  headers.push("geometry_wkt");

  const rows = parcels.map((parcel) => {
    const base: unknown[] = [
      parcel.id,
      parcel.surveyNumber,
      parcel.subdivisionNumber ?? "",
      parcel.village,
      parcel.mandal,
      parcel.district,
      parcel.state,
      parcel.areaHectares,
      parcel.classification,
      parcel.recordId ?? "",
      parcel.landholderLabel,
    ];
    if (options.includeProvenance) base.push(parcel.provenance.label);
    if (options.includeAttributes) {
      base.push(
        Object.entries(parcel.attributes)
          .map(([key, value]) => `${key}=${String(value)}`)
          .join("; "),
      );
    }
    base.push(parcelToWkt(parcel));
    return base.map(csvEscape).join(",");
  });

  const content = [headers.join(","), ...rows].join("\n");
  return new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" });
}

/* ----------------------------------------------------------------- *
 * KML / KMZ
 * ----------------------------------------------------------------- */

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateKML(parcels: Parcel[], options: ExportOptions): string {
  const placemarks = parcels
    .map((parcel) => {
      const polygons =
        parcel.geometry.type === "Polygon"
          ? [parcel.geometry.coordinates]
          : parcel.geometry.type === "MultiPolygon"
            ? parcel.geometry.coordinates
            : [];
      const polygonXml = polygons
        .map((rings) => {
          const outer = rings[0] ?? [];
          const inner = rings.slice(1);
          const outerCoords = outer
            .map(([lng, lat]) => `${lng},${lat},0`)
            .join(" ");
          const innerXml = inner
            .map(
              (ring) =>
                `<innerBoundaryIs><LinearRing><coordinates>${ring
                  .map(([lng, lat]) => `${lng},${lat},0`)
                  .join(" ")}</coordinates></LinearRing></innerBoundaryIs>`,
            )
            .join("");
          return `<Polygon><outerBoundaryIs><LinearRing><coordinates>${outerCoords}</coordinates></LinearRing></outerBoundaryIs>${innerXml}</Polygon>`;
        })
        .join("");

      const dataEntries: Array<[string, string]> = [
        ["parcelId", parcel.id],
        ["surveyNumber", parcel.surveyNumber],
        ["subdivisionNumber", parcel.subdivisionNumber ?? ""],
        ["village", parcel.village],
        ["mandal", parcel.mandal],
        ["district", parcel.district],
        ["areaHectares", String(parcel.areaHectares)],
        ["classification", parcel.classification],
        ["recordId", parcel.recordId ?? ""],
      ];
      if (options.includeProvenance) {
        dataEntries.push(["provenance", parcel.provenance.label]);
        dataEntries.push(["provenanceNote", parcel.provenance.note ?? ""]);
      }
      const extended = dataEntries
        .map(
          ([key, value]) =>
            `<Data name="${escapeXml(key)}"><value>${escapeXml(value)}</value></Data>`,
        )
        .join("");

      return `<Placemark><name>${escapeXml(
        `${parcel.village} Sy. ${parcel.surveyNumber}${parcel.subdivisionNumber ? `/${parcel.subdivisionNumber}` : ""}`,
      )}</name><description>${escapeXml(
        `${parcel.classification} — demonstration geometry, not official cadastral data.`,
      )}</description><ExtendedData>${extended}</ExtendedData>${polygonXml}</Placemark>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
<name>Bhumi demonstration parcels</name>
<description>Sample export generated in the browser. Polygons are synthetic demonstration geometry, not official cadastral boundaries.</description>
${placemarks}
</Document>
</kml>`;
}

/* ----------------------------------------------------------------- *
 * Minimal ZIP (store method) for KMZ
 * ----------------------------------------------------------------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date): { time: number; date: number } {
  const time =
    (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const dosDate =
    ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, date: dosDate };
}

/** Creates a STOREd (uncompressed) ZIP archive — enough for KMZ files. */
export function createStoredZip(files: Array<{ name: string; data: string }>): Blob {
  const encoder = new TextEncoder();
  const now = dosDateTime(new Date());
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.data);
    const crc = crc32(dataBytes);

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0, true);
    local.setUint16(8, 0, true);
    local.setUint16(10, now.time, true);
    local.setUint16(12, now.date, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, dataBytes.length, true);
    local.setUint32(22, dataBytes.length, true);
    local.setUint16(26, nameBytes.length, true);
    local.setUint16(28, 0, true);

    const localBytes = new Uint8Array(local.buffer as ArrayBuffer);
    parts.push(localBytes, nameBytes, dataBytes);

    const dir = new DataView(new ArrayBuffer(46));
    dir.setUint32(0, 0x02014b50, true);
    dir.setUint16(4, 20, true);
    dir.setUint16(6, 20, true);
    dir.setUint16(8, 0, true);
    dir.setUint16(10, 0, true);
    dir.setUint16(12, now.time, true);
    dir.setUint16(14, now.date, true);
    dir.setUint32(16, crc, true);
    dir.setUint32(20, dataBytes.length, true);
    dir.setUint32(24, dataBytes.length, true);
    dir.setUint16(28, nameBytes.length, true);
    dir.setUint16(30, 0, true);
    dir.setUint16(32, 0, true);
    dir.setUint16(34, 0, true);
    dir.setUint16(36, 0, true);
    dir.setUint32(38, 0, true);
    dir.setUint32(42, offset, true);
    central.push(new Uint8Array(dir.buffer as ArrayBuffer), nameBytes);

    offset += localBytes.length + nameBytes.length + dataBytes.length;
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(4, 0, true);
  end.setUint16(6, 0, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);
  end.setUint16(20, 0, true);

  const archiveParts = [
    ...parts,
    ...central,
    new Uint8Array(end.buffer as ArrayBuffer),
  ];
  return new Blob(archiveParts as unknown as BlobPart[], {
    type: "application/vnd.google-earth.kmz",
  });
}

export function generateKMZ(parcels: Parcel[], options: ExportOptions): Blob {
  const kml = generateKML(parcels, options);
  return createStoredZip([{ name: "doc.kml", data: kml }]);
}

/* ----------------------------------------------------------------- *
 * DXF (R12-compatible, geographic coordinates in degrees)
 * ----------------------------------------------------------------- */

function dxfLayerName(value: string): string {
  const cleaned = value
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return (cleaned || "PARCELS").slice(0, 30);
}

export function generateDXF(parcels: Parcel[]): Blob {
  const lines: string[] = [];
  const push = (...values: Array<string | number>) => {
    for (const value of values) lines.push(String(value));
  };

  push(0, "SECTION", 2, "HEADER", 9, "$ACADVER", 1, "AC1009", 0, "ENDSEC");
  push(
    0,
    "SECTION",
    2,
    "TABLES",
    0,
    "TABLE",
    2,
    "LAYER",
    70,
    20,
    0,
    "LAYER",
    2,
    "PARCELS",
    70,
    0,
    62,
    3,
    6,
    "CONTINUOUS",
  );

  const usedLayers = new Set<string>(["PARCELS"]);
  for (const parcel of parcels) {
    const layer = dxfLayerName(parcel.classification);
    if (!usedLayers.has(layer)) {
      usedLayers.add(layer);
      push(0, "LAYER", 2, layer, 70, 0, 62, 7, 6, "CONTINUOUS");
    }
  }
  push(0, "ENDTAB", 0, "ENDSEC", 0, "SECTION", 2, "ENTITIES");

  for (const parcel of parcels) {
    const layer = dxfLayerName(parcel.classification);
    const rings =
      parcel.geometry.type === "Polygon"
        ? [parcel.geometry.coordinates]
        : parcel.geometry.type === "MultiPolygon"
          ? parcel.geometry.coordinates
          : [];

    for (const polygon of rings) {
      for (const ring of polygon) {
        const points =
          ring[0][0] === ring[ring.length - 1][0] &&
          ring[0][1] === ring[ring.length - 1][1]
            ? ring.slice(0, -1)
            : ring;
        push(0, "POLYLINE", 8, layer, 66, 1, 70, 1, 10, 0, 20, 0, 30, 0);
        for (const [lng, lat] of points) {
          push(0, "VERTEX", 8, layer, 10, lng.toFixed(8), 20, lat.toFixed(8), 30, 0);
        }
        push(0, "SEQEND", 8, layer);
      }
    }

    const centroid = parcel.geometry.type === "Polygon"
      ? ((): [number, number] => {
          const ring = parcel.geometry.coordinates[0];
          let sumLng = 0;
          let sumLat = 0;
          for (const [lng, lat] of ring) {
            sumLng += lng;
            sumLat += lat;
          }
          return [sumLng / ring.length, sumLat / ring.length];
        })()
      : [0, 0];

    push(
      0,
      "TEXT",
      8,
      layer,
      10,
      centroid[0].toFixed(8),
      20,
      centroid[1].toFixed(8),
      30,
      0,
      40,
      0.00005,
      1,
      `${parcel.village} Sy.${parcel.surveyNumber}${parcel.subdivisionNumber ? `/${parcel.subdivisionNumber}` : ""}`,
    );
  }

  push(0, "ENDSEC", 0, "EOF");
  const content = lines.join("\r\n");
  return new Blob([content], { type: "application/dxf" });
}

/* ----------------------------------------------------------------- *
 * PNG / JPG render of parcel geometry
 * ----------------------------------------------------------------- */

export async function renderParcelsImage(
  parcels: Parcel[],
  format: "png" | "jpg",
): Promise<Blob> {
  const width = 1600;
  const height = 1100;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable in this browser.");

  const fill = format === "jpg" ? "#ffffff" : "#ffffff";
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, width, height);

  const points: Array<[number, number]> = [];
  for (const parcel of parcels) {
    for (const polygon of ringsOf(parcel)) {
      for (const ring of polygon) {
        for (const [lng, lat] of ring) points.push([lng, lat]);
      }
    }
  }

  if (points.length === 0) throw new Error("No geometry to render.");

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of points) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  const pad = 70;
  const spanLng = Math.max(maxLng - minLng, 1e-6);
  const spanLat = Math.max(maxLat - minLat, 1e-6);
  const scale = Math.min((width - pad * 2) / spanLng, (height - pad * 2) / spanLat);
  const offsetX = (width - spanLng * scale) / 2;
  const offsetY = (height - spanLat * scale) / 2;

  const project = (lng: number, lat: number): [number, number] => [
    offsetX + (lng - minLng) * scale,
    height - (offsetY + (lat - minLat) * scale),
  ];

  for (const parcel of parcels) {
    for (const polygon of ringsOf(parcel)) {
      polygon.forEach((ring, ringIndex) => {
        ctx.beginPath();
        ring.forEach(([lng, lat], index) => {
          const [x, y] = project(lng, lat);
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = ringIndex === 0 ? "rgba(15, 111, 74, 0.18)" : "#ffffff";
        ctx.strokeStyle = "#0f6f4a";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      });
    }

    const ring = parcel.geometry.type === "Polygon" ? parcel.geometry.coordinates[0] : null;
    if (ring) {
      let sumLng = 0;
      let sumLat = 0;
      for (const [lng, lat] of ring) {
        sumLng += lng;
        sumLat += lat;
      }
      const [cx, cy] = project(sumLng / ring.length, sumLat / ring.length);
      ctx.fillStyle = "#0b4733";
      ctx.font = "600 18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `Sy. ${parcel.surveyNumber}${parcel.subdivisionNumber ? `/${parcel.subdivisionNumber}` : ""}`,
        cx,
        cy,
      );
    }
  }

  ctx.fillStyle = "#475349";
  ctx.font = "500 20px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Bhumi — demonstration parcel geometry (not official cadastral data)", pad, 40);
  ctx.font = "400 16px system-ui, sans-serif";
  ctx.fillText(
    `${parcels.length} feature(s) · schematic render · generated ${new Date().toISOString().slice(0, 10)}`,
    pad,
    height - 30,
  );

  const mime = format === "png" ? "image/png" : "image/jpeg";
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Image encoding failed."));
      },
      mime,
      0.92,
    );
  });
}

function ringsOf(parcel: Parcel): number[][][][] {
  if (parcel.geometry.type === "Polygon") return [parcel.geometry.coordinates];
  if (parcel.geometry.type === "MultiPolygon") return parcel.geometry.coordinates;
  return [];
}

/* ----------------------------------------------------------------- *
 * Dispatcher
 * ----------------------------------------------------------------- */

export async function createClientExport(
  format: ExportFormat,
  parcels: Parcel[],
  options: ExportOptions,
  scopeLabel: string,
): Promise<GeneratedExport> {
  switch (format) {
    case "geojson": {
      return {
        blob: generateGeoJSON(parcels, options),
        fileName: buildExportFileName(format, scopeLabel, "geojson"),
      };
    }
    case "csv": {
      return {
        blob: generateCSV(parcels, options),
        fileName: buildExportFileName(format, scopeLabel, "csv"),
      };
    }
    case "kml": {
      const content = generateKML(parcels, options);
      return {
        blob: new Blob([content], { type: "application/vnd.google-earth.kml+xml" }),
        fileName: buildExportFileName(format, scopeLabel, "kml"),
      };
    }
    case "kmz": {
      return {
        blob: generateKMZ(parcels, options),
        fileName: buildExportFileName(format, scopeLabel, "kmz"),
      };
    }
    case "dxf": {
      return {
        blob: generateDXF(parcels),
        fileName: buildExportFileName(format, scopeLabel, "dxf"),
      };
    }
    case "png":
    case "jpg": {
      return {
        blob: await renderParcelsImage(parcels, format),
        fileName: buildExportFileName(format, scopeLabel, format),
      };
    }
    default:
      throw new Error(`Format ${format} cannot be generated in the browser.`);
  }
}

"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Box, Mountain, MapPinned } from "lucide-react";
import type { BasemapId, Parcel } from "@/lib/types";
import type { LngLat, MeasurementResult, MeasureTool } from "@/lib/types-gis";
import { useSettings } from "@/components/providers/settings-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox, Label, Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { SampleNote, Skeleton } from "@/components/ui/states";
import { SegmentedControl } from "@/components/ui/overlays";
import { DescriptionItem, DescriptionList } from "@/components/ui/description-list";
import { ProvenanceInline } from "@/components/ui/provenance";
import { Badge } from "@/components/ui/badge";
import { clamp, formatNumber } from "@/lib/utils";
import { formatArea, formatDistance } from "@/lib/gis/geo";
import {
  BasemapControl,
  CoordinateReadout,
  MapLegend,
  MeasureControl,
  MapStatusPill,
} from "./map-controls";

const LandMap = dynamic(() => import("./land-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-2">
      <Skeleton className="h-2/3 w-2/3" />
    </div>
  ),
});

type MapMode = "2d" | "3d";

export function TerrainWorkspace({ parcels }: { parcels: Parcel[] }) {
  const { settings } = useSettings();

  const [mode, setMode] = useState<MapMode>("3d");
  const [basemap, setBasemap] = useState<BasemapId>(
    settings.defaultBasemap === "satellite" ? "satellite" : settings.defaultBasemap,
  );
  const [exaggeration, setExaggeration] = useState(
    clamp(settings.terrainExaggeration, 1, 3),
  );
  const [extrusion, setExtrusion] = useState(true);
  const [pitch, setPitch] = useState(55);
  const [villageFilter, setVillageFilter] = useState("");
  const [selected, setSelected] = useState<Parcel | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [fitAllSignal, setFitAllSignal] = useState(0);
  const [measureTool, setMeasureTool] = useState<MeasureTool>("none");
  const [measureResetSignal, setMeasureResetSignal] = useState(0);
  const [measurement, setMeasurement] = useState<MeasurementResult | null>(null);
  const [cursor, setCursor] = useState<LngLat | null>(null);

  const villageOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const parcel of parcels) {
      map.set(`${parcel.district} · ${parcel.mandal} · ${parcel.village}`, parcel.village);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [parcels]);

  const scopedParcels = useMemo(
    () => (villageFilter ? parcels.filter((parcel) => parcel.village === villageFilter) : parcels),
    [parcels, villageFilter],
  );

  const effectiveMode = mode;
  const is3d = effectiveMode === "3d";

  return (
    <div className="space-y-5">
      <SampleNote>
        Terrain elevation comes from public AWS Terrain Tiles (Terrarium), which are coarse
        open data. Parcel blocks are illustrative extrusions derived from the synthetic
        demonstration polygons — they are not survey-grade terrain or official boundaries.
      </SampleNote>

      <PageHeader
        title="GIS / Map — 3D Terrain Workspace"
        description="Inspect demonstration parcels over open elevation terrain with measured controls and illustrative parcel extrusions."
        actions={
          <Link
            href="/map"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line-strong bg-surface px-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            <ArrowLeft className="size-4" aria-hidden />
            2D parcel explorer
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>View controls</CardTitle>
              <Badge tone="brand">{is3d ? "3D" : "2D"}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mode</Label>
                <SegmentedControl<MapMode>
                  ariaLabel="Map mode"
                  value={mode}
                  onChange={(next) => {
                    setMode(next);
                    setPitch(next === "3d" ? 55 : 0);
                  }}
                  options={[
                    { value: "2d", label: "2D" },
                    { value: "3d", label: "3D" },
                  ]}
                />
              </div>

              <div>
                <Label htmlFor="terrain-exaggeration">
                  Terrain exaggeration — {exaggeration.toFixed(1)}×
                </Label>
                <input
                  id="terrain-exaggeration"
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={exaggeration}
                  onChange={(event) => setExaggeration(Number(event.target.value))}
                  className="w-full accent-[var(--color-brand-700)]"
                  disabled={!is3d}
                />
              </div>

              <div>
                <Label htmlFor="terrain-pitch">Camera pitch — {pitch}°</Label>
                <input
                  id="terrain-pitch"
                  type="range"
                  min={0}
                  max={75}
                  step={5}
                  value={pitch}
                  onChange={(event) => setPitch(Number(event.target.value))}
                  className="w-full accent-[var(--color-brand-700)]"
                />
              </div>

              <Checkbox
                checked={extrusion}
                onChange={(event) => setExtrusion(event.target.checked)}
                label="Parcel block visualisation (illustrative heights)"
                disabled={!is3d}
              />

              <div>
                <Label htmlFor="terrain-village">Fly to village</Label>
                <Select
                  id="terrain-village"
                  value={villageFilter}
                  onChange={(event) => {
                    setVillageFilter(event.target.value);
                    setSelected(null);
                    setFitAllSignal((value) => value + 1);
                  }}
                >
                  <option value="">All demonstration villages</option>
                  {villageOptions.map(([label, value]) => (
                    <option key={label} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setFitAllSignal((value) => value + 1)}
              >
                <MapPinned className="size-4" aria-hidden />
                Fit to view
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Basemap</CardTitle>
            </CardHeader>
            <CardContent>
              <BasemapControl value={basemap} onChange={setBasemap} className="flex-wrap" />
              <p className="mt-2 text-[11px] leading-4 text-ink-3">
                Satellite imagery is provided by Esri World Imagery and is shown for context
                only.
              </p>
            </CardContent>
          </Card>

          {selected ? (
            <Card>
              <CardHeader>
                <CardTitle>Selected parcel</CardTitle>
                <Badge tone="info">{selected.id}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <DescriptionList columns={2}>
                  <DescriptionItem term="Survey no.">
                    {selected.surveyNumber}
                    {selected.subdivisionNumber ? `/${selected.subdivisionNumber}` : ""}
                  </DescriptionItem>
                  <DescriptionItem term="Classification">{selected.classification}</DescriptionItem>
                  <DescriptionItem term="Village">{selected.village}</DescriptionItem>
                  <DescriptionItem term="Area">
                    {formatNumber(selected.areaHectares, 3)} ha
                  </DescriptionItem>
                </DescriptionList>
                <ProvenanceInline provenance={selected.provenance} />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setFocusId(selected.id)}>
                    Zoom to parcel
                  </Button>
                  {selected.recordId ? (
                    <Link
                      href={`/records/${selected.recordId}`}
                      className="inline-flex h-8 items-center rounded-md border border-line-strong bg-surface px-2.5 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
                    >
                      View record
                    </Link>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <MapLegend />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-ink-2">
              <Mountain className="size-4 text-ink-3" aria-hidden />
              {is3d ? "Terrain enabled" : "Terrain off"}
              <span className="text-ink-3">·</span>
              <Box className="size-4 text-ink-3" aria-hidden />
              {extrusion && is3d ? "Blocks on" : "Blocks off"}
            </div>
            <MeasureControl
              value={measureTool}
              onChange={(tool) => {
                setMeasureTool(tool);
                setMeasureResetSignal((value) => value + 1);
              }}
              onReset={() => {
                setMeasureResetSignal((value) => value + 1);
                setMeasurement(null);
              }}
            />
          </div>

          <div className="relative h-[70vh] min-h-[28rem] overflow-hidden rounded-lg border border-line">
            <LandMap
              className="absolute inset-0 h-full w-full"
              parcels={scopedParcels}
              basemap={basemap}
              pitch={pitch}
              terrain={is3d ? { enabled: true, exaggeration } : null}
              extrusion={extrusion && is3d}
              selectedId={selected?.id ?? null}
              focusParcelId={focusId}
              fitAllSignal={fitAllSignal}
              measureTool={measureTool}
              measureResetSignal={measureResetSignal}
              onSelect={setSelected}
              onCursor={setCursor}
              onMeasurement={setMeasurement}
            />

            <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
              <MapStatusPill tone="brand">
                {scopedParcels.length} parcels
                {villageFilter ? ` · ${villageFilter}` : ""}
              </MapStatusPill>
              <MapStatusPill>Open elevation terrain (AWS Terrarium)</MapStatusPill>
            </div>

            <div className="absolute bottom-3 left-3 z-10">
              <CoordinateReadout position={cursor} />
            </div>

            <div className="absolute bottom-3 right-3 z-10">
              {measurement ? (
                <div className="rounded-lg border border-line bg-surface/95 px-3 py-2 text-xs shadow-sm">
                  <p className="mb-1 font-medium text-ink">
                    {measurement.tool === "area" ? "Area" : "Distance"}
                  </p>
                  <p className="tabular-nums text-ink-2">
                    {measurement.tool === "area"
                      ? measurement.areaSquareMeters !== null
                        ? formatArea(measurement.areaSquareMeters)
                        : "Add a third point"
                      : measurement.distanceMeters !== null
                        ? formatDistance(measurement.distanceMeters)
                        : "Add a second point"}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-3">
                    {measurement.vertices.length} vertices
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  MapPinned,
  Search,
  SquareDashedMousePointer,
} from "lucide-react";
import type { BasemapId, Parcel } from "@/lib/types";
import type { LngLat, MeasurementResult, MeasureTool } from "@/lib/types-gis";
import { searchParcelLibrary } from "@/lib/api/parcels";
import { useSettings } from "@/components/providers/settings-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label, Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, SampleNote, Skeleton } from "@/components/ui/states";
import { Toolbar, ToolbarSearch, ResultCount } from "@/components/ui/toolbar";
import { Badge } from "@/components/ui/badge";
import { DescriptionItem, DescriptionList } from "@/components/ui/description-list";
import { ProvenanceInline } from "@/components/ui/provenance";
import { cn, formatNumber } from "@/lib/utils";
import { formatArea, formatDistance, squareMetersToAcres, hectaresToSquareMeters } from "@/lib/gis/geo";
import {
  BasemapControl,
  CoordinateReadout,
  MapLegend,
  MeasureControl,
} from "./map-controls";

const LandMap = dynamic(() => import("./land-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-2">
      <Skeleton className="h-2/3 w-2/3" />
    </div>
  ),
});

function unique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function MapExplorer({
  parcels,
  initialSelectedId,
}: {
  parcels: Parcel[];
  initialSelectedId: string | null;
}) {
  const { settings } = useSettings();
  const { pushToast } = useToast();

  const [basemap, setBasemap] = useState<BasemapId>(settings.defaultBasemap);
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("");
  const [mandal, setMandal] = useState("");
  const [village, setVillage] = useState("");
  const [results, setResults] = useState<Parcel[]>(parcels);
  const [selected, setSelected] = useState<Parcel | null>(
    initialSelectedId
      ? (parcels.find((parcel) => parcel.id === initialSelectedId) ?? null)
      : null,
  );
  const [focusId, setFocusId] = useState<string | null>(initialSelectedId);
  const [fitAllSignal, setFitAllSignal] = useState(0);
  const [measureTool, setMeasureTool] = useState<MeasureTool>("none");
  const [measureResetSignal, setMeasureResetSignal] = useState(0);
  const [measurement, setMeasurement] = useState<MeasurementResult | null>(null);
  const [cursor, setCursor] = useState<LngLat | null>(null);
  const [isSearching, startSearch] = useTransition();

  const districts = useMemo(() => unique(parcels.map((parcel) => parcel.district)), [parcels]);
  const mandals = useMemo(
    () =>
      unique(
        parcels
          .filter((parcel) => !district || parcel.district === district)
          .map((parcel) => parcel.mandal),
      ),
    [parcels, district],
  );
  const villages = useMemo(
    () =>
      unique(
        parcels
          .filter(
            (parcel) =>
              (!district || parcel.district === district) &&
              (!mandal || parcel.mandal === mandal),
          )
          .map((parcel) => parcel.village),
      ),
    [parcels, district, mandal],
  );

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return results.filter((parcel) => {
      if (!text) return true;
      return `${parcel.id} ${parcel.surveyNumber} ${parcel.subdivisionNumber ?? ""} ${
        parcel.landholderLabel
      } ${parcel.village} ${parcel.mandal}`
        .toLowerCase()
        .includes(text);
    });
  }, [results, query]);

  const runSearch = () => {
    startSearch(async () => {
      try {
        const response = await searchParcelLibrary({
          district: district || null,
          mandal: mandal || null,
          village: village || null,
          surveyNumber: null,
          subdivision: null,
        });
        setResults(response.parcels);
        if (response.parcels.length === 1) {
          const only = response.parcels[0];
          setSelected(only);
          setFocusId(only.id);
          pushToast({
            tone: "info",
            title: "Parcel located",
            description: `Survey ${only.surveyNumber} in ${only.village} (demonstration geometry).`,
          });
        }
      } catch {
        pushToast({
          tone: "error",
          title: "Search failed",
          description: "Could not query the parcel library.",
        });
      }
    });
  };

  const resetSearch = () => {
    setDistrict("");
    setMandal("");
    setVillage("");
    setQuery("");
    setResults(parcels);
  };

  const selectParcel = (parcel: Parcel | null, fit = false) => {
    setSelected(parcel);
    if (parcel && fit) setFocusId(parcel.id);
  };

  const resetMeasure = () => {
    setMeasureResetSignal((value) => value + 1);
    setMeasurement(null);
  };

  return (
    <div className="space-y-5">
      <SampleNote>
        View Your Land uses synthetic demonstration parcels generated around approximate
        village centres. The polygons are not official cadastral boundaries and must not be
        used for any legal or administrative purpose.
      </SampleNote>

      <PageHeader
        title="View Your Land"
        description="Search the demonstration parcel library, inspect parcels on the basemap and measure distances or areas."
        actions={
          <>
            <Button variant="secondary" onClick={() => setFitAllSignal((value) => value + 1)}>
              <MapPinned className="size-4" aria-hidden />
              Fit all parcels
            </Button>
            <Link
              href="/map/3d"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-line-strong bg-surface px-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
            >
              3D terrain
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[21rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parcel search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="map-district">District</Label>
                <Select
                  id="map-district"
                  value={district}
                  onChange={(event) => {
                    setDistrict(event.target.value);
                    setMandal("");
                    setVillage("");
                  }}
                >
                  <option value="">All districts</option>
                  {districts.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="map-mandal">Mandal</Label>
                <Select
                  id="map-mandal"
                  value={mandal}
                  onChange={(event) => {
                    setMandal(event.target.value);
                    setVillage("");
                  }}
                >
                  <option value="">All mandals</option>
                  {mandals.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="map-village">Village</Label>
                <Select
                  id="map-village"
                  value={village}
                  onChange={(event) => setVillage(event.target.value)}
                >
                  <option value="">All villages</option>
                  {villages.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button className="flex-1" onClick={runSearch} loading={isSearching}>
                  <Search className="size-4" aria-hidden />
                  Search
                </Button>
                <Button variant="ghost" onClick={resetSearch}>
                  Reset
                </Button>
              </div>
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
                  <DescriptionItem term="Mandal">{selected.mandal}</DescriptionItem>
                  <DescriptionItem term="Area">
                    {formatNumber(selected.areaHectares, 3)} ha
                  </DescriptionItem>
                  <DescriptionItem term="Area (acres)">
                    {formatNumber(
                      squareMetersToAcres(hectaresToSquareMeters(selected.areaHectares)),
                      2,
                    )}{" "}
                    ac
                  </DescriptionItem>
                  <DescriptionItem term="Holder" className="sm:col-span-2">
                    {selected.landholderLabel}
                  </DescriptionItem>
                </DescriptionList>
                <ProvenanceInline provenance={selected.provenance} />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setFocusId(selected.id)}>
                    Zoom to parcel
                  </Button>
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => {
                      setMeasureTool("area");
                      setFocusId(selected.id);
                    }}
                  >
                    <SquareDashedMousePointer className="size-4" aria-hidden />
                    Measure area
                  </Button>
                  {selected.recordId ? (
                    <Link
                      href={`/records/${selected.recordId}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line-strong bg-surface px-2.5 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
                    >
                      View record
                      <ExternalLink className="size-3.5" aria-hidden />
                    </Link>
                  ) : (
                    <span className="inline-flex h-8 items-center rounded-md border border-line px-2.5 text-xs text-ink-3">
                      No linked land record
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Search results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Toolbar className="gap-2">
                <ToolbarSearch
                  value={query}
                  onChange={setQuery}
                  placeholder="Filter by survey no. or holder"
                  className="w-full sm:w-full"
                />
              </Toolbar>
              <ResultCount shown={filtered.length} total={results.length} noun="parcels" />
              <ul className="max-h-80 space-y-1 overflow-y-auto scrollbar-thin">
                {filtered.map((parcel) => (
                  <li key={parcel.id}>
                    <button
                      type="button"
                      onClick={() => selectParcel(parcel, true)}
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-left transition-colors",
                        selected?.id === parcel.id
                          ? "border-brand-200 bg-brand-50"
                          : "border-line hover:bg-surface-2",
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-ink">
                          Survey {parcel.surveyNumber}
                          {parcel.subdivisionNumber ? `/${parcel.subdivisionNumber}` : ""}
                        </span>
                        <span className="text-[11px] tabular-nums text-ink-3">
                          {formatNumber(parcel.areaHectares, 2)} ha
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-ink-3">
                        {parcel.village} · {parcel.mandal} · {parcel.classification}
                      </span>
                    </button>
                  </li>
                ))}
                {filtered.length === 0 ? (
                  <li>
                    <EmptyState
                      title="No parcels match"
                      description="Adjust the search filters above."
                    />
                  </li>
                ) : null}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2">
            <BasemapControl value={basemap} onChange={setBasemap} />
            <MeasureControl
              value={measureTool}
              onChange={(tool) => {
                setMeasureTool(tool);
                if (tool !== "none") resetMeasure();
              }}
              onReset={resetMeasure}
            />
          </div>

          <div className="relative h-[62vh] min-h-[26rem] overflow-hidden rounded-lg border border-line">
            <LandMap
              className="absolute inset-0 h-full w-full"
              parcels={parcels}
              basemap={basemap}
              selectedId={selected?.id ?? null}
              focusParcelId={focusId}
              fitAllSignal={fitAllSignal}
              measureTool={measureTool}
              measureResetSignal={measureResetSignal}
              onSelect={(parcel) => selectParcel(parcel)}
              onCursor={setCursor}
              onMeasurement={setMeasurement}
            />

            <div className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[13rem] rounded-lg border border-line bg-surface/95 p-2.5 shadow-sm">
              <MapLegend />
            </div>

            <div className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2">
              {measurement ? (
                <div className="rounded-lg border border-line bg-surface/95 px-3 py-2 text-xs shadow-sm">
                  <p className="mb-1 font-medium text-ink">
                    {measurement.tool === "area" ? "Area measurement" : "Distance measurement"}
                  </p>
                  {measurement.tool === "distance" ? (
                    <p className="tabular-nums text-ink-2">
                      {measurement.distanceMeters !== null
                        ? formatDistance(measurement.distanceMeters)
                        : "Add a second point"}
                    </p>
                  ) : (
                    <p className="tabular-nums text-ink-2">
                      {measurement.areaSquareMeters !== null
                        ? formatArea(measurement.areaSquareMeters)
                        : "Add a third point"}
                      {measurement.perimeterMeters !== null
                        ? ` · perimeter ${formatDistance(measurement.perimeterMeters)}`
                        : ""}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-ink-3">
                    {measurement.vertices.length} vertices · click the map to add points
                  </p>
                </div>
              ) : null}
              <CoordinateReadout position={cursor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

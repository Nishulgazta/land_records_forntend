"use client";

import { Layers, Ruler } from "lucide-react";
import type { BasemapId } from "@/lib/types";
import type { LngLat, MeasureTool } from "@/lib/types-gis";
import { BASEMAPS, CLASSIFICATION_ENTRIES } from "@/lib/gis/basemaps";
import { SegmentedControl } from "@/components/ui/overlays";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BasemapControl({
  value,
  onChange,
  className,
}: {
  value: BasemapId;
  onChange: (value: BasemapId) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Layers className="size-4 text-ink-3" aria-hidden />
      <SegmentedControl<BasemapId>
        ariaLabel="Basemap"
        value={value}
        onChange={onChange}
        options={BASEMAPS.map((basemap) => ({
          value: basemap.id,
          label: basemap.label,
        }))}
      />
    </div>
  );
}

export function MeasureControl({
  value,
  onChange,
  onReset,
  className,
}: {
  value: MeasureTool;
  onChange: (value: MeasureTool) => void;
  onReset: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Ruler className="size-4 text-ink-3" aria-hidden />
      <SegmentedControl<MeasureTool>
        ariaLabel="Measurement tool"
        value={value}
        onChange={onChange}
        options={[
          { value: "none", label: "Off" },
          { value: "distance", label: "Distance" },
          { value: "area", label: "Area" },
        ]}
      />
      <Button variant="ghost" size="sm" onClick={onReset} disabled={value === "none"}>
        Clear
      </Button>
    </div>
  );
}

export function MapLegend({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">
        Land classification
      </p>
      <ul className="grid grid-cols-1 gap-1">
        {CLASSIFICATION_ENTRIES.map(([name, color]) => (
          <li key={name} className="flex items-center gap-2 text-xs text-ink-2">
            <span
              className="size-3 shrink-0 rounded-sm border border-line"
              style={{ backgroundColor: color }}
              aria-hidden
            />
            <span className="truncate">{name}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] leading-4 text-ink-3">
        Polygons are synthetic demonstration geometry, not official cadastral boundaries.
      </p>
    </div>
  );
}

export function CoordinateReadout({
  position,
  className,
}: {
  position: LngLat | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded border border-line bg-surface/90 px-2 py-1 font-mono text-[11px] tabular-nums text-ink-2",
        className,
      )}
    >
      {position
        ? `${position.lat.toFixed(5)}° N, ${position.lng.toFixed(5)}° E`
        : "— ° N, — ° E"}
    </span>
  );
}

export function MapStatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand";
}) {
  return (
    <span
      className={cn(
        "rounded border px-2 py-1 text-[11px] font-medium",
        tone === "brand"
          ? "border-brand-200 bg-brand-50 text-brand-800"
          : "border-line bg-surface/90 text-ink-2",
      )}
    >
      {children}
    </span>
  );
}

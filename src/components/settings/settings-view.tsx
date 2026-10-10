"use client";

import { RotateCcw } from "lucide-react";
import { useSettings } from "@/components/providers/settings-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  SectionHeading,
} from "@/components/ui/card";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { DescriptionItem, DescriptionList } from "@/components/ui/description-list";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/overlays";
import { PageSkeleton, SampleNote } from "@/components/ui/states";
import { API_BASE_URL, API_MODE, IS_MOCK_MODE, MODE_LABEL } from "@/lib/api/client";
import { SUPPORTED_CRS } from "@/lib/api/exports";
import type { BasemapId, Density } from "@/lib/types";
import { clamp } from "@/lib/utils";

const BASEMAPS: Array<{ value: BasemapId; label: string }> = [
  { value: "positron", label: "Positron — light basemap" },
  { value: "liberty", label: "Liberty — dark basemap" },
  { value: "satellite", label: "Satellite imagery" },
];

const TERRAIN_MIN = 1;
const TERRAIN_MAX = 10;
const TERRAIN_STEP = 0.1;

export function SettingsView() {
  const { settings, hydrated, updateSettings, resetSettings } = useSettings();
  const { pushToast } = useToast();

  if (!hydrated) {
    return <PageSkeleton />;
  }

  function handleReset(): void {
    resetSettings();
    pushToast({
      tone: "success",
      title: "Preferences reset",
      description: "Profile, appearance and map defaults restored to their initial values.",
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        description="Preferences are stored locally in this browser and apply immediately."
      />

      <SampleNote>
        This frontend runs on the bundled sample dataset while no backend is connected, so
        profile details here are personal labels only — they are never uploaded.
      </SampleNote>

      <section className="space-y-3">
        <SectionHeading
          title="Profile"
          description="Used to label your actions in verification and audit views."
        />
        <Card>
          <CardContent className="grid gap-4 py-4 sm:grid-cols-2">
            <Field id="profile-name" label="Display name">
              <Input
                value={settings.profileName}
                onChange={(event) => updateSettings({ profileName: event.target.value })}
                placeholder="Field Analyst"
                maxLength={60}
              />
            </Field>
            <Field id="profile-role" label="Role">
              <Input
                value={settings.profileRole}
                onChange={(event) => updateSettings({ profileRole: event.target.value })}
                placeholder="Validation Officer"
                maxLength={60}
              />
            </Field>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Appearance"
          description="Control information density and sample-data notices."
        />
        <Card>
          <CardContent className="space-y-4 py-4">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-ink-2">Density</span>
              <SegmentedControl<Density>
                ariaLabel="Interface density"
                value={settings.density}
                onChange={(density) => updateSettings({ density })}
                options={[
                  { value: "comfortable", label: "Comfortable" },
                  { value: "compact", label: "Compact" },
                ]}
              />
              <p className="text-[11px] text-ink-3">
                Compact reduces row height across tables and lists.
              </p>
            </div>

            <Checkbox
              label="Show the sample-data banner"
              description="Keeps the demonstration-data notice visible at the top of the app."
              checked={settings.showSampleBanner}
              onChange={(event) => updateSettings({ showSampleBanner: event.target.checked })}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Map defaults"
          description="Applied when the map opens in this browser."
        />
        <Card>
          <CardContent className="grid gap-4 py-4 sm:grid-cols-2">
            <Field id="default-basemap" label="Default basemap">
              <Select
                value={settings.defaultBasemap}
                onChange={(event) =>
                  updateSettings({ defaultBasemap: event.target.value as BasemapId })
                }
              >
                {BASEMAPS.map((basemap) => (
                  <option key={basemap.value} value={basemap.value}>
                    {basemap.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field id="default-map-mode" label="Default map mode">
              <SegmentedControl<"2d" | "3d">
                ariaLabel="Default map mode"
                value={settings.defaultMapMode}
                onChange={(defaultMapMode) => updateSettings({ defaultMapMode })}
                options={[
                  { value: "2d", label: "2D" },
                  { value: "3d", label: "3D" },
                ]}
              />
            </Field>

            <Field id="default-crs" label="Default coordinate reference system">
              <Select
                value={settings.defaultCrs}
                onChange={(event) => updateSettings({ defaultCrs: event.target.value })}
              >
                {SUPPORTED_CRS.map((entry) => (
                  <option key={entry.code} value={entry.code}>
                    {entry.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              id="terrain-exaggeration"
              label="Terrain exaggeration"
              hint={`${settings.terrainExaggeration.toFixed(1)}× — range ${TERRAIN_MIN.toFixed(1)}–${TERRAIN_MAX.toFixed(1)}`}
            >
              <input
                type="range"
                min={TERRAIN_MIN}
                max={TERRAIN_MAX}
                step={TERRAIN_STEP}
                value={settings.terrainExaggeration}
                onChange={(event) =>
                  updateSettings({
                    terrainExaggeration: clamp(
                      Number(event.target.value),
                      TERRAIN_MIN,
                      TERRAIN_MAX,
                    ),
                  })
                }
                className="mt-2 w-full accent-[var(--color-brand-700)]"
                aria-label="Terrain exaggeration"
              />
            </Field>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Data and mode"
          description="Where the data on this installation comes from."
        />
        <Card>
          <CardContent className="space-y-4 py-4">
            <DescriptionList columns={2}>
              <DescriptionItem term="Mode">{MODE_LABEL}</DescriptionItem>
              <DescriptionItem term="API mode">
                <span className="font-mono">{API_MODE}</span>
              </DescriptionItem>
              <DescriptionItem term="Mock mode">{IS_MOCK_MODE ? "On" : "Off"}</DescriptionItem>
              <DescriptionItem term="API base URL">
                <span className="font-mono break-all">
                  {API_BASE_URL || "not configured"}
                </span>
              </DescriptionItem>
            </DescriptionList>

            <p className="rounded-md border border-line bg-surface-2 px-3 py-2 text-xs text-ink-2">
              {IS_MOCK_MODE
                ? "Mock mode is active: documents, records, parcels, analytics and audit events all come from the bundled sample dataset. To connect a real backend, set NEXT_PUBLIC_API_BASE_URL at build or runtime — server-side exports, live processing and real records become available then."
                : "A backend is connected. Sample data is replaced by responses from the configured API, and server-side export formats become available."}
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Reset preferences</CardTitle>
            <CardDescription>
              Restores the default profile, appearance and map settings in this browser.
            </CardDescription>
          </div>
        </CardHeader>
        <CardFooter className="justify-end">
          <Button variant="danger" onClick={handleReset}>
            <RotateCcw className="size-4" aria-hidden />
            Reset preferences
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

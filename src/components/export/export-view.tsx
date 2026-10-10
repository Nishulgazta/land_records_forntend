"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, FileCode2, Server } from "lucide-react";
import {
  EXPORT_FORMATS,
  EXPORT_MODE_LABEL,
  SUPPORTED_CRS,
  createExport,
  defaultExportOptions,
  downloadExportJob,
  getFormatInfo,
  listSessionExportJobs,
} from "@/lib/api/exports";
import { API_BASE_URL, API_MODE, IS_MOCK_MODE } from "@/lib/api/client";
import type { ExportFormat, ExportJob, ExportOptions, Parcel } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
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
import { PageHeader } from "@/components/ui/page-header";
import { ProvenanceBadge } from "@/components/ui/provenance";
import { useToast } from "@/components/providers/toast-provider";
import { EmptyState, SampleNote } from "@/components/ui/states";
import { Table, TBody, TD, TH, THead, TR, TableFooter } from "@/components/ui/table";
import { cn, formatBytes, formatDateTime, formatNumber, titleCase } from "@/lib/utils";

type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const STATUS_TONE: Record<ExportJob["status"], StatusTone> = {
  draft: "neutral",
  queued: "info",
  running: "info",
  completed: "success",
  failed: "danger",
  unsupported: "warning",
};

const SERVER_FORMAT_HINT =
  "This format is produced by backend GIS/CAD services. No backend is connected in mock mode, so it cannot be generated here.";

export function ExportView({ parcels }: { parcels: Parcel[] }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [format, setFormat] = useState<ExportFormat>("geojson");
  const [area, setArea] = useState<string>("all");
  const [crs, setCrs] = useState<string>(SUPPORTED_CRS[0].code);
  const [fileName, setFileName] = useState<string>("parcels");
  const [includeAttributes, setIncludeAttributes] = useState<boolean>(true);
  const [includeProvenance, setIncludeProvenance] = useState<boolean>(true);
  const [includeUnselected, setIncludeUnselected] = useState<boolean>(false);
  const [job, setJob] = useState<ExportJob | null>(null);
  const [sessionJobs, setSessionJobs] = useState<ExportJob[]>(() => listSessionExportJobs());
  const [failure, setFailure] = useState<string | null>(null);

  const districts = useMemo(() => {
    const names = new Set(parcels.map((parcel) => parcel.district));
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [parcels]);

  const options: ExportOptions = useMemo(
    () => ({
      ...defaultExportOptions(crs),
      includeAttributes,
      includeProvenance,
      includeUnselected,
      scope: area === "all" ? "map_view" : "selection",
    }),
    [crs, includeAttributes, includeProvenance, includeUnselected, area],
  );

  const selectedParcels = useMemo(() => {
    if (area === "all" || includeUnselected) return parcels;
    return parcels.filter((parcel) => parcel.district === area);
  }, [parcels, area, includeUnselected]);

  const formatInfo = getFormatInfo(format);
  const scopeLabel = fileName.trim() || "parcels";

  function handleGenerate(): void {
    setFailure(null);
    startTransition(async () => {
      try {
        const created = await createExport({
          format,
          parcels: selectedParcels,
          options,
          scopeLabel,
        });
        setJob(created);
        setSessionJobs(listSessionExportJobs());
        if (created.status === "completed") {
          pushToast({
            tone: "success",
            title: `${getFormatInfo(created.format).label} export ready`,
            description: created.fileName,
          });
        } else {
          pushToast({
            tone: "warning",
            title: "Export produced no file",
            description: created.error ?? `Job finished with status ${created.status}.`,
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Export failed.";
        setFailure(message);
        setSessionJobs(listSessionExportJobs());
        pushToast({ tone: "error", title: "Export failed", description: message });
      }
      router.refresh();
    });
  }

  function handleDownload(target: ExportJob): void {
    downloadExportJob(target);
    pushToast({
      tone: "info",
      title: "Download started",
      description: target.fileName,
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Export parcels"
        description="Turn the loaded demonstration parcels into a downloadable file. Formats marked browser-side are generated locally as real files; server-side formats need a connected backend."
      />

      <SampleNote>
        The exported geometry is demonstration geometry generated for this app — it is not
        official cadastral data and must not be used for legal or survey purposes. Client-side
        formats (GeoJSON, CSV, KML, KMZ, DXF, PNG, JPG) are written as real files in your
        browser. Server-side formats (Shapefile, GeoPackage, PDF map sheet, DEM / GeoTIFF, XYZ
        points) are unavailable until a backend export service is connected.
      </SampleNote>

      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
        <Badge tone={IS_MOCK_MODE ? "warning" : "success"}>
          {API_MODE === "mock" ? "Mock mode" : "Live API"}
        </Badge>
        <span>{EXPORT_MODE_LABEL}</span>
        <span className="font-mono">{API_BASE_URL || "no API base URL set"}</span>
      </div>

      <section className="space-y-3">
        <SectionHeading
          title="Format"
          description="Pick the output format. Disabled formats need backend processing."
        />
        <div role="radiogroup" aria-label="Export format" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {EXPORT_FORMATS.map((info) => {
            const disabled = info.execution === "server" && IS_MOCK_MODE;
            const active = info.format === format;
            return (
              <button
                key={info.format}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => setFormat(info.format)}
                className={cn(
                  "flex flex-col gap-2 rounded-md border bg-surface p-3 text-left transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  active
                    ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
                    : "border-line hover:border-line-strong hover:bg-surface-2",
                )}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{info.label}</span>
                  <span className="text-[11px] text-ink-3">.{info.extension}</span>
                </span>
                <span className="text-xs text-ink-3">{info.description}</span>
                <span className="mt-auto flex flex-wrap items-center gap-1.5">
                  <Badge tone={info.execution === "client" ? "success" : "neutral"}>
                    {info.execution === "client" ? "Browser-side" : "Server-side"}
                  </Badge>
                  <Badge tone={info.keepsAttributes ? "info" : "neutral"}>
                    {info.keepsAttributes ? "Attributes kept" : "Attributes dropped"}
                  </Badge>
                  {disabled ? <Badge tone="warning">Backend required</Badge> : null}
                </span>
                {disabled ? (
                  <span className="text-[11px] text-warning">{SERVER_FORMAT_HINT}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Options"
          description="Area, coordinate reference system and file attributes."
        />
        <Card>
          <CardContent className="grid gap-4 py-4 sm:grid-cols-2">
            <Field id="export-area" label="Area" hint={`${formatNumber(selectedParcels.length)} parcels`}>
              <Select value={area} onChange={(event) => setArea(event.target.value)}>
                <option value="all">All demo parcels ({formatNumber(parcels.length)})</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    District: {district} (
                    {formatNumber(parcels.filter((parcel) => parcel.district === district).length)})
                  </option>
                ))}
              </Select>
            </Field>

            <Field id="export-crs" label="Coordinate reference system">
              <Select value={crs} onChange={(event) => setCrs(event.target.value)}>
                {SUPPORTED_CRS.map((entry) => (
                  <option key={entry.code} value={entry.code}>
                    {entry.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              id="export-file-name"
              label="File name"
              hint={`Saved as bhumi_${scopeLabel}_<timestamp>.${formatInfo.extension}`}
            >
              <Input
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                placeholder="parcels"
                maxLength={48}
              />
            </Field>

            <div className="space-y-2">
              <Checkbox
                label="Include attributes"
                description="Attach survey, village and landholder properties where the format supports them."
                checked={includeAttributes}
                onChange={(event) => setIncludeAttributes(event.target.checked)}
              />
              <Checkbox
                label="Include provenance"
                description="Record where each parcel came from inside the export."
                checked={includeProvenance}
                onChange={(event) => setIncludeProvenance(event.target.checked)}
              />
              <Checkbox
                label="Include parcels outside the selected area"
                description="Export every demo parcel even when a single district is selected."
                checked={includeUnselected}
                onChange={(event) => setIncludeUnselected(event.target.checked)}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <p className="text-xs text-ink-3">
              Selected format: <span className="font-medium text-ink-2">{formatInfo.label}</span>{" "}
              — {formatInfo.description}
            </p>
            <Button onClick={handleGenerate} loading={isPending}>
              <FileCode2 className="size-4" aria-hidden />
              {isPending ? "Generating…" : "Generate export"}
            </Button>
          </CardFooter>
        </Card>
      </section>

      {failure ? (
        <p
          role="alert"
          className="rounded-md border border-danger-line bg-danger-soft px-3 py-2 text-xs text-danger"
        >
          {failure}
        </p>
      ) : null}

      {job ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Latest export job</CardTitle>
              <CardDescription>
                {job.id} — created {formatDateTime(job.createdAt)}
              </CardDescription>
            </div>
            <Badge tone={STATUS_TONE[job.status]}>{titleCase(job.status)}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-3">File</dt>
                <dd className="mt-0.5 break-all text-sm text-ink">{job.fileName}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-3">Format</dt>
                <dd className="mt-0.5 text-sm text-ink">{getFormatInfo(job.format).label}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-3">Features</dt>
                <dd className="mt-0.5 text-sm tabular-nums text-ink">
                  {formatNumber(job.featureCount)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-3">Size</dt>
                <dd className="mt-0.5 text-sm tabular-nums text-ink">
                  {job.sizeBytes === null ? "—" : formatBytes(job.sizeBytes)}
                </dd>
              </div>
            </dl>

            {job.error ? (
              <p className="rounded-md border border-danger-line bg-danger-soft px-3 py-2 text-xs text-danger">
                {job.error}
              </p>
            ) : null}

            <ProvenanceBadge provenance={job.provenance} />
          </CardContent>
          <CardFooter className="justify-between">
            <p className="text-xs text-ink-3">
              {job.downloadUrl
                ? "The file was generated in this browser session."
                : "No file was produced for this job."}
            </p>
            <Button
              variant="secondary"
              disabled={!job.downloadUrl || job.status !== "completed"}
              onClick={() => handleDownload(job)}
            >
              <Download className="size-4" aria-hidden />
              Download file
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      <section className="space-y-3">
        <SectionHeading
          title="This-session exports"
          description="Every export job created in this browser tab, newest first."
        />
        {sessionJobs.length === 0 ? (
          <EmptyState
            icon={<Server className="size-6" aria-hidden />}
            title="No exports yet"
            description="Choose a format and generate an export — the job will appear here with its download link."
          />
        ) : (
          <Card>
            <Table>
              <THead>
                <TR>
                  <TH>Created</TH>
                  <TH>Format</TH>
                  <TH>File</TH>
                  <TH>Status</TH>
                  <TH>Features</TH>
                  <TH>Size</TH>
                  <TH>
                    <span className="sr-only">Download</span>
                  </TH>
                </TR>
              </THead>
              <TBody>
                {sessionJobs.map((entry) => (
                  <TR key={entry.id}>
                    <TD className="whitespace-nowrap text-xs">
                      {formatDateTime(entry.createdAt)}
                    </TD>
                    <TD className="whitespace-nowrap">{getFormatInfo(entry.format).label}</TD>
                    <TD className="max-w-56 break-all text-xs">{entry.fileName}</TD>
                    <TD>
                      <Badge tone={STATUS_TONE[entry.status]}>{titleCase(entry.status)}</Badge>
                      {entry.error ? (
                        <span className="mt-1 block max-w-56 text-[11px] text-danger">
                          {entry.error}
                        </span>
                      ) : null}
                    </TD>
                    <TD className="tabular-nums">{formatNumber(entry.featureCount)}</TD>
                    <TD className="whitespace-nowrap tabular-nums">
                      {entry.sizeBytes === null ? "—" : formatBytes(entry.sizeBytes)}
                    </TD>
                    <TD className="text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={!entry.downloadUrl}
                        onClick={() => handleDownload(entry)}
                      >
                        <Download className="size-3.5" aria-hidden />
                        Download
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <TableFooter>
              <span>
                {formatNumber(sessionJobs.length)} export
                {sessionJobs.length === 1 ? "" : "s"} in this session
              </span>
              <span>Jobs are session-only and are lost when the tab closes.</span>
            </TableFooter>
          </Card>
        )}
      </section>
    </div>
  );
}

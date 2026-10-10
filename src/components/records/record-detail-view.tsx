"use client";

import Link from "next/link";
import { FileSearch, MapPin } from "lucide-react";
import type { LandDocument, LandRecord, Parcel } from "@/lib/types";
import { IS_MOCK_MODE } from "@/lib/api/client";
import { Badge, RecordStatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ConfidenceMeter,
  ConfidenceValue,
  FieldValue,
} from "@/components/ui/confidence";
import { DescriptionItem, DescriptionList } from "@/components/ui/description-list";
import { PageHeader } from "@/components/ui/page-header";
import { ProvenanceBadge, ProvenanceInline } from "@/components/ui/provenance";
import { SampleNote } from "@/components/ui/states";
import { TD, TH, THead, TR, TBody, Table } from "@/components/ui/table";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  FIELD_STATUS_LABELS,
  FIELD_STATUS_TONES,
  formatArea,
} from "./helpers";

export function RecordDetailView({
  record,
  parcel,
  document,
}: {
  record: LandRecord;
  parcel: Parcel | null;
  document: LandDocument | null;
}) {
  return (
    <div className="space-y-5">
      {IS_MOCK_MODE ? (
        <SampleNote>
          Mock mode — this record, its extracted fields and its linked parcel are generated
          sample data. It must not be treated as an official land record.
        </SampleNote>
      ) : null}

      <PageHeader
        title={record.id}
        description={`${record.landholder} · ${record.village}, ${record.mandal}, ${record.district}`}
        parent={{ label: "Records", href: "/records" }}
        actions={
          <>
            <ButtonLink href={`/validation/${record.id}`} variant="secondary">
              Validate
            </ButtonLink>
            <ButtonLink href={`/verification/${record.id}`} variant="secondary">
              Verify
            </ButtonLink>
            <ButtonLink href={`/documents/${record.documentId}`} variant="secondary">
              Open document
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Record summary</CardTitle>
              <CardDescription>
                Core identifiers and extracted attributes for this entry.
              </CardDescription>
            </div>
            <RecordStatusBadge status={record.status} />
          </CardHeader>
          <CardContent>
            <DescriptionList columns={3}>
              <DescriptionItem term="Survey number">{record.surveyNumber}</DescriptionItem>
              <DescriptionItem term="Subdivision">
                {record.subdivisionNumber ?? "—"}
              </DescriptionItem>
              <DescriptionItem term="Village">{record.village}</DescriptionItem>
              <DescriptionItem term="Mandal">{record.mandal}</DescriptionItem>
              <DescriptionItem term="District">{record.district}</DescriptionItem>
              <DescriptionItem term="State">{record.state}</DescriptionItem>
              <DescriptionItem term="Landholder">{record.landholder}</DescriptionItem>
              <DescriptionItem term="Recorded area">
                {formatArea(record.recordedAreaValue, record.recordedAreaUnit)}
              </DescriptionItem>
              <DescriptionItem term="Classification">{record.landClassification}</DescriptionItem>
              <DescriptionItem term="Record date">{formatDate(record.recordDate)}</DescriptionItem>
              <DescriptionItem term="Status">
                <RecordStatusBadge status={record.status} />
              </DescriptionItem>
              <DescriptionItem term="Confidence">
                <ConfidenceMeter confidence={record.confidence} />
              </DescriptionItem>
              <DescriptionItem term="Provenance">
                <ProvenanceBadge provenance={record.provenance} />
              </DescriptionItem>
              <DescriptionItem term="Source document">
                <Link
                  href={`/documents/${record.documentId}`}
                  className="font-medium text-brand-700 hover:underline underline-offset-4"
                >
                  {record.documentId}
                </Link>
              </DescriptionItem>
              <DescriptionItem term="Last updated">{formatDate(record.updatedAt)}</DescriptionItem>
            </DescriptionList>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Source document</CardTitle>
                <CardDescription>
                  Document this extraction was produced from.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {document ? (
                <DescriptionList>
                  <DescriptionItem term="Title">{document.title}</DescriptionItem>
                  <DescriptionItem term="File">{document.fileName}</DescriptionItem>
                  <DescriptionItem term="Pages">
                    {document.pageCount} · {document.language}
                  </DescriptionItem>
                </DescriptionList>
              ) : (
                <p className="text-sm text-ink-3">
                  Document metadata for {record.documentId} could not be loaded.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Mutation information</CardTitle>
                <CardDescription>Recorded ownership transfer details.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {record.mutation.mutationNumber ? (
                <DescriptionList columns={2}>
                  <DescriptionItem term="Mutation number">
                    {record.mutation.mutationNumber}
                  </DescriptionItem>
                  <DescriptionItem term="Mutation date">
                    {formatDate(record.mutation.mutationDate)}
                  </DescriptionItem>
                  <div className="sm:col-span-2">
                    <DescriptionItem term="Details">
                      {record.mutation.details ?? "—"}
                    </DescriptionItem>
                  </div>
                </DescriptionList>
              ) : (
                <p className="text-sm text-ink-3">
                  No mutation entry is recorded for this parcel in the sample data.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Linked parcel</CardTitle>
                <CardDescription>Cadastral geometry linked to this record.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {parcel ? (
                <>
                  <DescriptionList columns={2}>
                    <DescriptionItem term="Survey number">
                      {parcel.surveyNumber}
                      {parcel.subdivisionNumber ? `/${parcel.subdivisionNumber}` : ""}
                    </DescriptionItem>
                    <DescriptionItem term="Area">{parcel.areaHectares.toFixed(3)} ha</DescriptionItem>
                    <DescriptionItem term="Classification">{parcel.classification}</DescriptionItem>
                    <DescriptionItem term="Landholder">{parcel.landholderLabel}</DescriptionItem>
                  </DescriptionList>
                  <ProvenanceInline provenance={parcel.provenance} />
                  <ButtonLink href={`/map?parcel=${parcel.id}`} variant="secondary" size="sm">
                    <MapPin className="size-4" aria-hidden />
                    View on map
                  </ButtonLink>
                </>
              ) : (
                <div className="flex items-start gap-2 text-sm text-ink-3">
                  <FileSearch className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <p>
                    This record is not yet linked to a parcel, so no geometry can be shown on
                    the map.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Extracted fields</CardTitle>
            <CardDescription>
              Values produced by the simulated extraction pipeline, with per-field confidence.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <THead>
              <TR>
                <TH>Field</TH>
                <TH>Value</TH>
                <TH>Confidence</TH>
                <TH>Source</TH>
                <TH>Page</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {record.fields.map((field) => (
                <TR key={field.key}>
                  <TD className="whitespace-nowrap font-medium text-ink">{field.label}</TD>
                  <TD>
                    <FieldValue value={field.value} unit={field.unit} />
                  </TD>
                  <TD>
                    <ConfidenceValue confidence={field.confidence} />
                  </TD>
                  <TD className="max-w-xs text-xs text-ink-3">{field.source}</TD>
                  <TD className="tabular-nums">
                    {field.page === null ? "—" : field.page}
                  </TD>
                  <TD>
                    <Badge tone={FIELD_STATUS_TONES[field.status]}>
                      {FIELD_STATUS_LABELS[field.status]}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Record history</CardTitle>
            <CardDescription>Events recorded against this entry.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Timeline>
            {record.history.map((entry, index) => (
              <TimelineItem
                key={entry.id}
                status={
                  entry.event.includes("verified")
                    ? "done"
                    : entry.event.includes("rejected")
                      ? "failed"
                      : "info"
                }
                title={entry.event}
                timestamp={formatDateTime(entry.timestamp)}
                detail={`${entry.detail} — ${entry.actor}`}
                isLast={index === record.history.length - 1}
              />
            ))}
          </Timeline>
        </CardContent>
      </Card>
    </div>
  );
}

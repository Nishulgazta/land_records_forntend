"use client";

import { } from "react";
import type { LandDocument, LandRecord, ProcessingJob } from "@/lib/types";
import { IS_MOCK_MODE } from "@/lib/api/client";
import { DOCUMENT_TYPE_LABELS } from "@/lib/mock/documents";
import { PageHeader } from "@/components/ui/page-header";
import { SampleNote } from "@/components/ui/states";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DescriptionList, DescriptionItem } from "@/components/ui/description-list";
import { ConfidenceMeter } from "@/components/ui/confidence";
import { ProvenanceBadge } from "@/components/ui/provenance";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Button, ButtonLink } from "@/components/ui/button";
import { formatBytes, formatDateTime } from "@/lib/utils";

export function DocumentDetailView({
  document,
  job,
  linkedRecords,
}: {
  document: LandDocument;
  job: ProcessingJob | null;
  linkedRecords: LandRecord[];
}) {

  return (
    <div className="space-y-5">
      {IS_MOCK_MODE ? (
        <SampleNote>
          Mock mode — this is sample data generated for demonstration. It is not an official record.
        </SampleNote>
      ) : null}
      <PageHeader
        title={document.title}
        description="Document details, processing status and linked records."
        parent={{ label: "Documents", href: "/documents" }}
        actions={
          <>
            {job && (
              <ButtonLink href={`/processing/${job.id}`} variant="secondary">
                View processing job
              </ButtonLink>
            )}
            <Button
              variant="primary"
              disabled
              title="Reprocessing is not available in this demonstration build"
            >
              Reprocess document
            </Button>
          </>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <DescriptionList>
            <DescriptionItem term="File name">{document.fileName}</DescriptionItem>
            <DescriptionItem term="Type">{DOCUMENT_TYPE_LABELS[document.type]}</DescriptionItem>
            <DescriptionItem term="Language">{document.language}</DescriptionItem>
            <DescriptionItem term="Pages">{document.pageCount}</DescriptionItem>
            <DescriptionItem term="Size">{formatBytes(document.sizeBytes)}</DescriptionItem>
            <DescriptionItem term="Uploaded at">{formatDateTime(document.uploadedAt)}</DescriptionItem>
            <DescriptionItem term="Uploaded by">{document.uploadedBy}</DescriptionItem>
            <DescriptionItem term="Archive ref">{document.archiveRef}</DescriptionItem>
            <DescriptionItem term="Confidence">
              <ConfidenceMeter confidence={document.confidence} />
            </DescriptionItem>
            <DescriptionItem term="Provenance">
              <ProvenanceBadge provenance={document.provenance} />
            </DescriptionItem>
          </DescriptionList>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Linked records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="card overflow-hidden">
            <Table>
              <THead>
                <TR>
                  <TH>Record ID</TH>
                  <TH>Survey no.</TH>
                  <TH>Village</TH>
                  <TH>Landholder</TH>
                  <TH>Action</TH>
                </TR>
              </THead>
              <TBody>
                {linkedRecords.map((record) => (
                  <TR key={record.id}>
                    <TD className="font-medium">{record.id}</TD>
                    <TD>
                      {record.surveyNumber}
                      {record.subdivisionNumber ? `/${record.subdivisionNumber}` : ""}
                    </TD>
                    <TD>{record.village}</TD>
                    <TD>{record.landholder}</TD>
                    <TD>
                      <ButtonLink href={`/records/${record.id}`} variant="ghost" size="sm">
                        View
                      </ButtonLink>
                    </TD>
                  </TR>
                ))}
                {linkedRecords.length === 0 && (
                  <TR>
                    <TD colSpan={5} className="text-center text-ink-3">
                      No linked records found
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-ink-3">
        Reprocessing is not available in this demonstration build.
      </p>
    </div>
  );
}

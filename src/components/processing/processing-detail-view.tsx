"use client";

import type { LandDocument, ProcessingJob } from "@/lib/types";
import { IS_MOCK_MODE } from "@/lib/api/client";
import { PageHeader } from "@/components/ui/page-header";
import { SampleNote, ProgressBar, ErrorState } from "@/components/ui/states";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { ButtonLink, Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

export function ProcessingDetailView({
  job,
  document,
}: {
  job: ProcessingJob;
  document: LandDocument;
}) {
  const mapStatus = (status: "pending" | "running" | "done" | "failed"): "pending" | "running" | "done" | "failed" | "info" => status;
  return (
    <div className="space-y-5">
      {IS_MOCK_MODE ? (
        <SampleNote>
          Mock mode — this processing job is simulated for demonstration.
        </SampleNote>
      ) : null}
      <PageHeader
        title={job.id}
        description={`Processing details for ${document.title}`}
        parent={{ label: "Processing", href: "/processing" }}
        actions={
          <>
            <ButtonLink href={`/documents/${document.id}`} variant="secondary">
              Source document
            </ButtonLink>
            <Button
              variant="primary"
              disabled
              title="Retry is unavailable in this demonstration build"
            >
              Retry
            </Button>
          </>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Overall progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <ProgressBar value={job.progress} />
            <p className="text-sm text-ink-3 tabular-nums">{job.progress}%</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Step pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline>
            {job.steps.map((step, index) => (
              <TimelineItem
                key={step.key}
                status={mapStatus(step.status)}
                title={step.label}
                timestamp={
                  step.completedAt
                    ? `Completed at ${formatDateTime(step.completedAt)}`
                    : step.startedAt
                      ? `Started at ${formatDateTime(step.startedAt)}`
                      : "Pending"
                }
                detail={step.detail}
                isLast={index === job.steps.length - 1}
              />
            ))}
          </Timeline>
        </CardContent>
      </Card>
      {job.error && (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorState title="Processing failed" description={job.error} />
            <p className="text-xs text-ink-3 mt-3">
              Retry is unavailable in this demonstration build.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

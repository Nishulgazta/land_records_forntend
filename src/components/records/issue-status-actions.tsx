"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { IssueStatus, ValidationIssue } from "@/lib/types";
import { setIssueStatus } from "@/lib/api/validation";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";

export function IssueStatusActions({ issue }: { issue: ValidationIssue }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [pending, startTransition] = useTransition();

  const apply = (status: IssueStatus) => {
    startTransition(async () => {
      try {
        await setIssueStatus(issue.id, status);
        pushToast({
          title: "Issue status updated (simulated session state)",
          description: `${issue.id} is now ${status}. The change is not persisted beyond this session.`,
          tone: "info",
        });
        router.refresh();
      } catch (error) {
        pushToast({
          title: "Could not update issue (simulated)",
          description: error instanceof Error ? error.message : "Unexpected error.",
          tone: "error",
        });
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        size="sm"
        variant="secondary"
        disabled={pending || issue.status === "acknowledged"}
        onClick={() => apply("acknowledged")}
      >
        Acknowledge
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={pending || issue.status === "resolved"}
        onClick={() => apply("resolved")}
      >
        Resolve
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending || issue.status === "open"}
        onClick={() => apply("open")}
      >
        Reopen
      </Button>
    </div>
  );
}

"use client";

import React from "react";
import type { MutationStatus } from "@/lib/mutation-notebook/schema";
import { STATUS_LABELS } from "@/lib/mutation-notebook/schema";

interface StatusBadgeProps {
  status: MutationStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span className="status-badge__dot" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

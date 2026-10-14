"use client";

import React from "react";
import StatusBadge from "./StatusBadge";
import type { MutationStatus } from "@/lib/mutation/schema";

interface MutationSummary {
  id: string;
  status: MutationStatus;
  entryNo: string;
  village: string;
  newHolder: string;
  updatedAt: string;
}

interface MutationListProps {
  items: MutationSummary[];
  onSelect: (id: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MutationList({
  items,
  onSelect,
}: MutationListProps) {
  if (items.length === 0) {
    return (
      <div className="mutation-list">
        <div className="mutation-list__empty">
          <div className="mutation-list__empty-icon">📝</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            No mutation entries yet
          </div>
          <div style={{ fontSize: "var(--text-sm)" }}>
            Click <strong>+ New Entry</strong> to start writing a mutation
            record.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mutation-list">
      <div className="mutation-list__header">
        <span>Entry #</span>
        <span>Village</span>
        <span>New Holder</span>
        <span>Status</span>
        <span>Updated</span>
        <span></span>
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          className="mutation-list__row"
          onClick={() => onSelect(item.id)}
        >
          <span className="mutation-list__cell mutation-list__cell--no">
            {item.entryNo || "—"}
          </span>
          <span className="mutation-list__cell">
            {item.village || "—"}
          </span>
          <span className="mutation-list__cell">
            {item.newHolder || "—"}
          </span>
          <span className="mutation-list__cell">
            <StatusBadge status={item.status} />
          </span>
          <span className="mutation-list__cell">
            {timeAgo(item.updatedAt)}
          </span>
          <span className="mutation-list__cell">
            <button
              className="btn btn--secondary btn--icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item.id);
              }}
            >
              Open →
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MutationStatus } from "@/lib/mutation/schema";

interface MutationSummary {
  id: string;
  status: MutationStatus;
  entryNo: string;
  village: string;
  newHolder: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<MutationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mutations")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: items.length,
    draft: items.filter((i) => i.status === "draft" || i.status === "recognized" || i.status === "corrected").length,
    review: items.filter((i) => i.status === "awaiting_review").length,
  };

  return (
    <div className="container dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">
            📋 Smart Mutation Notebook
          </h1>
          <p className="dashboard__subtitle">
            Intelligent Land Record Digitization &amp; Validation System
          </p>
        </div>
        <button
          className="btn btn--primary btn--lg"
          onClick={async () => {
            const res = await fetch("/api/mutations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fields: {}, pages: [] }),
            });
            const data = await res.json();
            if (data.mutation?.id) {
              router.push(`/notebook/${data.mutation.id}`);
            }
          }}
        >
          + New Entry
        </button>
      </div>

      {/* Stats */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__value">{counts.total}</div>
          <div className="stat-card__label">Total Entries</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{counts.draft}</div>
          <div className="stat-card__label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{counts.review}</div>
          <div className="stat-card__label">Awaiting Review</div>
        </div>
      </div>

      {/* Recent entries */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div className="spinner" style={{ margin: "0 auto" }} />
          <div className="loading-text" style={{ marginTop: 12 }}>
            Loading entries…
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="mutation-list">
          <div className="mutation-list__empty">
            <div className="mutation-list__empty-icon">📝</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              No mutation entries yet
            </div>
            <div style={{ fontSize: "var(--text-sm)" }}>
              Click <strong>+ New Entry</strong> above to start writing your
              first mutation record in the digital notebook.
            </div>
          </div>
        </div>
      ) : (
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
              onClick={() => router.push(`/notebook/${item.id}`)}
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
                <span className={`status-badge status-badge--${item.status}`}>
                  <span className="status-badge__dot" />
                  {item.status === "awaiting_review"
                    ? "Review"
                    : item.status.charAt(0).toUpperCase() +
                      item.status.slice(1)}
                </span>
              </span>
              <span className="mutation-list__cell">
                {new Date(item.updatedAt).toLocaleDateString()}
              </span>
              <span className="mutation-list__cell">
                <button
                  className="btn btn--secondary btn--icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/notebook/${item.id}`);
                  }}
                >
                  Open →
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

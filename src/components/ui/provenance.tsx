import { Database, FlaskConical, PencilRuler, Server } from "lucide-react";
import type { Provenance } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

const TONES: Record<Provenance["kind"], "neutral" | "warning" | "info" | "success"> = {
  "mock-sample": "warning",
  "demonstration-geometry": "info",
  "user-drawn": "success",
  backend: "success",
};

const ICONS: Record<Provenance["kind"], typeof Database> = {
  "mock-sample": FlaskConical,
  "demonstration-geometry": PencilRuler,
  "user-drawn": PencilRuler,
  backend: Server,
};

export function ProvenanceBadge({ provenance }: { provenance: Provenance }) {
  const Icon = ICONS[provenance.kind];
  return (
    <Badge tone={TONES[provenance.kind]} title={provenance.note}>
      <Icon className="size-3" aria-hidden />
      {provenance.label}
    </Badge>
  );
}

export function ProvenanceInline({
  provenance,
  className,
}: {
  provenance: Provenance;
  className?: string;
}) {
  const Icon = ICONS[provenance.kind];
  return (
    <p className={cn("flex items-start gap-1.5 text-[11px] text-ink-3", className)}>
      <Icon className="mt-0.5 size-3 shrink-0 text-ink-3" aria-hidden />
      <span>
        <span className="font-medium text-ink-2">Source:</span> {provenance.label}
        {provenance.note ? ` — ${provenance.note}` : ""}
      </span>
    </p>
  );
}

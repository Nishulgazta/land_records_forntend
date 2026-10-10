import { Suspense } from "react";
import type { Metadata } from "next";
import type { Parcel } from "@/lib/types";
import { listAllParcels } from "@/lib/api/parcels";
import { MapExplorer } from "@/components/map/map-explorer";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/states";

export const metadata: Metadata = { title: "View Your Land" };

function MapPageFallback() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="View Your Land"
        description="Search the demonstration parcel library, inspect parcels on the basemap and measure distances or areas."
      />
      <div className="grid gap-4 lg:grid-cols-[21rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-[62vh] min-h-[26rem] w-full" />
        </div>
      </div>
    </div>
  );
}

async function MapExplorerView({
  parcels,
  searchParams,
}: {
  parcels: Parcel[];
  searchParams: PageProps<"/map">["searchParams"];
}) {
  const params = await searchParams;
  const raw = params.parcel;
  const initialSelectedId =
    typeof raw === "string" ? raw : Array.isArray(raw) ? (raw[0] ?? null) : null;

  return <MapExplorer parcels={parcels} initialSelectedId={initialSelectedId} />;
}

export default async function MapPage({ searchParams }: PageProps<"/map">) {
  const parcels = await listAllParcels();

  return (
    <Suspense fallback={<MapPageFallback />}>
      <MapExplorerView parcels={parcels} searchParams={searchParams} />
    </Suspense>
  );
}

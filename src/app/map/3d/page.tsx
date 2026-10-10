import type { Metadata } from "next";
import { listAllParcels } from "@/lib/api/parcels";
import { TerrainWorkspace } from "@/components/map/terrain-workspace";

export const metadata: Metadata = { title: "GIS / Map — 3D Terrain" };

export default async function MapTerrainPage() {
  const parcels = await listAllParcels();
  return <TerrainWorkspace parcels={parcels} />;
}

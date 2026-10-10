import type { DistrictNode, MandalNode, StateNode, VillageNode } from "../types";
import { IS_MOCK_MODE, apiFetch } from "./client";
import {
  AP_STATE,
  findVillage as findMockVillage,
  listDistricts as getMockDistricts,
  listMandals as getMockMandals,
  listSurveyNumbers as getMockSurveyNumbers,
  listVillages as getMockVillages,
} from "../mock/locations";

export async function getState(): Promise<StateNode> {
  if (IS_MOCK_MODE) return AP_STATE;
  return apiFetch<StateNode>("/locations");
}

export async function getDistricts(): Promise<DistrictNode[]> {
  if (IS_MOCK_MODE) return getMockDistricts();
  return apiFetch<DistrictNode[]>("/locations/districts");
}

export async function getMandals(districtId: string): Promise<MandalNode[]> {
  if (IS_MOCK_MODE) return getMockMandals(districtId);
  return apiFetch<MandalNode[]>(`/locations/districts/${districtId}/mandals`);
}

export async function getVillages(mandalId: string): Promise<VillageNode[]> {
  if (IS_MOCK_MODE) return getMockVillages(mandalId);
  return apiFetch<VillageNode[]>(`/locations/mandals/${mandalId}/villages`);
}

export async function getSurveyNumbers(villageId: string): Promise<string[]> {
  if (IS_MOCK_MODE) return getMockSurveyNumbers(villageId);
  return apiFetch<string[]>(`/locations/villages/${villageId}/surveys`);
}

export async function findVillage(villageId: string) {
  if (IS_MOCK_MODE) return findMockVillage(villageId);
  return apiFetch<ReturnType<typeof findMockVillage>>(`/locations/villages/${villageId}`);
}

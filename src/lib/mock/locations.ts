import type { DistrictNode, MandalNode, StateNode, VillageNode } from "../types";

/**
 * Demonstration administrative hierarchy for Andhra Pradesh.
 *
 * District names are real; mandal / village names and survey numbers are
 * sample values used only to exercise the UI while no backend is connected.
 * They must not be treated as official records.
 */

interface RawDistrict {
  name: string;
  center: [number, number];
  mandals: Array<{
    name: string;
    villages: Array<{ name: string; surveys: string[] }>;
  }>;
}

const RAW: RawDistrict[] = [
  {
    name: "Guntur",
    center: [80.44, 16.3],
    mandals: [
      {
        name: "Amaravati",
        villages: [
          { name: "Velagapudi", surveys: ["101", "102", "118", "127"] },
          { name: "Dondapadu", surveys: ["44", "45", "46", "61"] },
          { name: "Thimmalapalem", surveys: ["7", "8", "23", "24"] },
        ],
      },
      {
        name: "Pedanandipadu",
        villages: [
          { name: "Kunchanapadu", surveys: ["12", "13", "14", "30"] },
          { name: "Mangalagiri", surveys: ["55", "56", "72", "90"] },
          { name: "Vemulapadu", surveys: ["3", "19", "20", "21"] },
        ],
      },
      {
        name: "Thullur",
        villages: [
          { name: "Pinnapuram", surveys: ["88", "89", "90", "112"] },
          { name: "Anantavaram", surveys: ["5", "6", "7", "41"] },
          { name: "Kandriga", surveys: ["2", "16", "17", "34"] },
        ],
      },
    ],
  },
  {
    name: "Krishna",
    center: [81.14, 16.19],
    mandals: [
      {
        name: "Gudivada",
        villages: [
          { name: "Bollapuram", surveys: ["201", "202", "219", "233"] },
          { name: "Challapalli", surveys: ["14", "15", "36", "37"] },
          { name: "Musalireddipalem", surveys: ["9", "10", "25", "26"] },
        ],
      },
      {
        name: "Pedana",
        villages: [
          { name: "Vuyyuru", surveys: ["401", "402", "417", "440"] },
          { name: "Gudimetla", surveys: ["6", "7", "22", "23"] },
          { name: "Koduru", surveys: ["11", "12", "29", "30"] },
        ],
      },
      {
        name: "Avanigadda",
        villages: [
          { name: "Kodali", surveys: ["31", "32", "58", "59"] },
          { name: "Mandapeta", surveys: ["1", "2", "18", "19"] },
          { name: "Surasani", surveys: ["77", "78", "79", "95"] },
        ],
      },
    ],
  },
  {
    name: "Prakasam",
    center: [80.05, 15.5],
    mandals: [
      {
        name: "Ongole",
        villages: [
          { name: "Chennapalem", surveys: ["110", "111", "128", "144"] },
          { name: "Tangutur", surveys: ["27", "28", "29", "52"] },
          { name: "Valluru", surveys: ["8", "9", "33", "34"] },
        ],
      },
      {
        name: "Markapuram",
        villages: [
          { name: "Donakonda", surveys: ["65", "66", "67", "84"] },
          { name: "Giddalur", surveys: ["1", "2", "13", "14"] },
          { name: "Cumbum", surveys: ["42", "43", "60", "61"] },
        ],
      },
      {
        name: "Kandukur",
        villages: [
          { name: "Ulavapadu", surveys: ["73", "74", "75", "96"] },
          { name: "Singarayakonda", surveys: ["5", "6", "17", "18"] },
          { name: "Tallur", surveys: ["24", "25", "47", "48"] },
        ],
      },
    ],
  },
  {
    name: "Sri Potti Sriramulu Nellore",
    center: [79.99, 14.44],
    mandals: [
      {
        name: "Nellore",
        villages: [
          { name: "Kovur", surveys: ["301", "302", "325", "348"] },
          { name: "Podalakur", surveys: ["16", "17", "40", "41"] },
          { name: "Jeedipalle", surveys: ["4", "5", "21", "22"] },
        ],
      },
      {
        name: "Kavali",
        villages: [
          { name: "Daggarapuvaripalle", surveys: ["54", "55", "70", "71"] },
          { name: "Sonasamudram", surveys: ["3", "4", "15", "16"] },
          { name: "Vinnamala", surveys: ["82", "83", "84", "99"] },
        ],
      },
      {
        name: "Udayagiri",
        villages: [
          { name: "Kothapalem", surveys: ["12", "13", "38", "39"] },
          { name: "Bandapalem", surveys: ["7", "8", "9", "26"] },
          { name: "Ramanayanipeta", surveys: ["45", "46", "47", "63"] },
        ],
      },
    ],
  },
  {
    name: "East Godavari",
    center: [82.3, 17.0],
    mandals: [
      {
        name: "Kakinada",
        villages: [
          { name: "Gandhivaram", surveys: ["501", "502", "530", "555"] },
          { name: "Pithapuram", surveys: ["22", "23", "49", "50"] },
          { name: "Samalkot", surveys: ["6", "7", "28", "29"] },
        ],
      },
      {
        name: "Peddapuram",
        villages: [
          { name: "Anaparthy", surveys: ["18", "19", "20", "37"] },
          { name: "Gollala", surveys: ["2", "3", "11", "12"] },
          { name: "Kesavaram", surveys: ["68", "69", "86", "87"] },
        ],
      },
      {
        name: "Mandapeta",
        villages: [
          { name: "Gudimula", surveys: ["51", "52", "53", "74"] },
          { name: "Allavaram", surveys: ["9", "10", "31", "32"] },
          { name: "Korukonda", surveys: ["43", "44", "45", "64"] },
        ],
      },
    ],
  },
  {
    name: "Kurnool",
    center: [78.04, 15.83],
    mandals: [
      {
        name: "Kurnool",
        villages: [
          { name: "Banaganapalle", surveys: ["211", "212", "240", "266"] },
          { name: "Nandyal", surveys: ["25", "26", "51", "52"] },
          { name: "Gadivemula", surveys: ["10", "11", "35", "36"] },
        ],
      },
      {
        name: "Dhone",
        villages: [
          { name: "Gooty", surveys: ["62", "63", "64", "81"] },
          { name: "Koilkuntla", surveys: ["1", "2", "13", "14"] },
          { name: "Pamulapadu", surveys: ["76", "77", "78", "93"] },
        ],
      },
      {
        name: "Adoni",
        villages: [
          { name: "Mantralayam", surveys: ["15", "16", "42", "43"] },
          { name: "Kosigi", surveys: ["5", "6", "27", "28"] },
          { name: "Nagaladoddi", surveys: ["88", "89", "90", "105"] },
        ],
      },
    ],
  },
];

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildState(): StateNode {
  const districts: DistrictNode[] = RAW.map((rawDistrict, dIndex) => {
    const mandals: MandalNode[] = rawDistrict.mandals.map((rawMandal, mIndex) => {
      const villages: VillageNode[] = rawMandal.villages.map((rawVillage, vIndex) => ({
        id: `${dIndex}-${mIndex}-${vIndex}-${slug(rawVillage.name)}`,
        name: rawVillage.name,
        surveyNumbers: rawVillage.surveys,
      }));
      return {
        id: `${dIndex}-${mIndex}-${slug(rawMandal.name)}`,
        name: rawMandal.name,
        villages,
      };
    });
    return {
      id: `${dIndex}-${slug(rawDistrict.name)}`,
      name: rawDistrict.name,
      mandals,
    };
  });

  return { id: "in-ap", name: "Andhra Pradesh", districts };
}

export const AP_STATE: StateNode = buildState();

export interface VillageRef {
  district: DistrictNode;
  mandal: MandalNode;
  village: VillageNode;
}

export interface DistrictRef {
  district: DistrictNode;
}

export function listDistricts(): DistrictNode[] {
  return AP_STATE.districts;
}

export function listMandals(districtId: string): MandalNode[] {
  return AP_STATE.districts.find((d) => d.id === districtId)?.mandals ?? [];
}

export function listVillages(mandalId: string): VillageNode[] {
  for (const district of AP_STATE.districts) {
    const mandal = district.mandals.find((m) => m.id === mandalId);
    if (mandal) return mandal.villages;
  }
  return [];
}

export function listSurveyNumbers(villageId: string): string[] {
  const ref = findVillage(villageId);
  return ref?.village.surveyNumbers ?? [];
}

export function findVillage(villageId: string): VillageRef | null {
  for (const district of AP_STATE.districts) {
    for (const mandal of district.mandals) {
      const village = mandal.villages.find((v) => v.id === villageId);
      if (village) return { district, mandal, village };
    }
  }
  return null;
}

export function findVillageByName(
  district: string,
  mandal: string,
  village: string,
): VillageRef | null {
  for (const d of AP_STATE.districts) {
    if (d.name !== district) continue;
    for (const m of d.mandals) {
      if (m.name !== mandal) continue;
      const v = m.villages.find((x) => x.name === village);
      if (v) return { district: d, mandal: m, village: v };
    }
  }
  return null;
}

/** Approximate demonstration centre of a village (deterministic). */
export function villageCenter(villageId: string): { lng: number; lat: number } | null {
  const ref = findVillage(villageId);
  if (!ref) return null;
  const districtIndex = AP_STATE.districts.findIndex((d) => d.id === ref.district.id);
  const mandalIndex = ref.district.mandals.findIndex((m) => m.id === ref.mandal.id);
  const villageIndex = ref.mandal.villages.findIndex((v) => v.id === ref.village.id);
  const base = RAW[districtIndex]?.center ?? [80.5, 16.0];
  return {
    lng: base[0] + mandalIndex * 0.14 + villageIndex * 0.045,
    lat: base[1] + mandalIndex * 0.09 + villageIndex * 0.035,
  };
}

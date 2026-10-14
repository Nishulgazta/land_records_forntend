import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type { Mutation, MutationStatus } from "./schema";

/* ------------------------------------------------------------------ */
/*  JSON file-based mutation store                                     */
/*                                                                     */
/*  Stores all records in data/mutations.json. Fine for a single-user  */
/*  demo — swap for a real database (Postgres, MongoDB, etc.) in       */
/*  production.                                                        */
/* ------------------------------------------------------------------ */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "mutations.json");

async function ensureDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readAll(): Promise<Mutation[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Mutation[];
  } catch {
    return [];
  }
}

async function writeAll(mutations: Mutation[]): Promise<void> {
  await ensureDir();
  await writeFile(DATA_FILE, JSON.stringify(mutations, null, 2), "utf-8");
}

// ─── Public store API ────────────────────────────────────────────────

export interface CreateInput {
  fields: Mutation["fields"];
  status: MutationStatus;
  pages: Mutation["pages"];
  recognition: Mutation["recognition"];
  findings: Mutation["findings"];
}

export interface UpdateInput {
  fields?: Mutation["fields"];
  status?: MutationStatus;
  pages?: Mutation["pages"];
  recognition?: Mutation["recognition"];
  findings?: Mutation["findings"];
}

export const store = {
  /** List every mutation (un-sorted). */
  async list(): Promise<Mutation[]> {
    return readAll();
  },

  /** Get a single mutation by id, or null. */
  async get(id: string): Promise<Mutation | null> {
    const all = await readAll();
    return all.find((m) => m.id === id) ?? null;
  },

  /** Create a new mutation and persist it. */
  async create(data: CreateInput): Promise<Mutation> {
    const all = await readAll();
    const now = new Date().toISOString();
    const mutation: Mutation = {
      id: crypto.randomUUID(),
      status: data.status,
      fields: data.fields,
      pages: data.pages,
      recognition: data.recognition,
      findings: data.findings,
      createdAt: now,
      updatedAt: now,
    };
    all.push(mutation);
    await writeAll(all);
    return mutation;
  },

  /** Partially update an existing mutation. */
  async update(id: string, data: UpdateInput): Promise<Mutation | null> {
    const all = await readAll();
    const idx = all.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    const cur = all[idx];
    all[idx] = {
      ...cur,
      ...data,
      id: cur.id,
      createdAt: cur.createdAt,
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
    return all[idx];
  },
};

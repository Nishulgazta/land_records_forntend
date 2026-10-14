import { NextResponse } from "next/server";
import { requireUser } from "@/lib/mutation-notebook/auth";
import { store } from "@/lib/mutation-notebook/store";
import { sanitizeFields, statusFor } from "@/lib/mutation-notebook/schema";
import { validate } from "@/lib/mutation-notebook/validate";
import { cleanPages, cleanRecognition } from "@/lib/mutation-notebook/clean";

export async function GET(req: Request) {
  const d = requireUser(req); if (d) return d;
  const all = await store.list();
  return NextResponse.json({ items: all.map((m) => ({ id: m.id, status: m.status, entryNo: m.fields.entryNo.value, village: m.fields.village.value, newHolder: m.fields.newHolder.value, updatedAt: m.updatedAt })).reverse() });
}
export async function POST(req: Request) {
  const d = requireUser(req); if (d) return d;
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  const fields = sanitizeFields(b.fields);
  const mutation = await store.create({ fields, status: statusFor(fields), pages: cleanPages(b.pages), recognition: cleanRecognition(b.recognition), findings: validate(fields, await store.list()) });
  return NextResponse.json({ mutation }, { status: 201 });
}

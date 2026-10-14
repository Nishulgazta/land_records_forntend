import { NextResponse } from "next/server";
import { requireUser } from "@/lib/mutation-notebook/auth";
import { store } from "@/lib/mutation-notebook/store";
import { sanitizeFields, statusFor } from "@/lib/mutation-notebook/schema";
import { validate } from "@/lib/mutation-notebook/validate";
import { cleanPages, cleanRecognition } from "@/lib/mutation-notebook/clean";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const d = requireUser(req); if (d) return d;
  const m = await store.get((await params).id);
  return m ? NextResponse.json({ mutation: m }) : NextResponse.json({ error: "Not found." }, { status: 404 });
}
export async function PUT(req: Request, { params }: Ctx) {
  const d = requireUser(req); if (d) return d;
  const { id } = await params;
  const cur = await store.get(id);
  if (!cur) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (cur.status === "awaiting_review") return NextResponse.json({ error: "Submitted entries can no longer be edited." }, { status: 409 });
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  const fields = sanitizeFields(b.fields);
  // Recognition and correction are meaningful workflow states. Preserve the
  // editor's editable state rather than resetting every save to "draft".
  const requestedStatus = b.status;
  const status =
    requestedStatus === "recognized" || requestedStatus === "corrected"
      ? requestedStatus
      : "draft";
  const m = await store.update(id, { fields, status, pages: cleanPages(b.pages), recognition: cleanRecognition(b.recognition) ?? cur.recognition, findings: validate(fields, await store.list(), id) });
  return NextResponse.json({ mutation: m });
}

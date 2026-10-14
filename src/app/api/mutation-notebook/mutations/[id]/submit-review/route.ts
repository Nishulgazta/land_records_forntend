import { NextResponse } from "next/server";
import { requireUser } from "@/lib/mutation-notebook/auth";
import { store } from "@/lib/mutation-notebook/store";
import { validate } from "@/lib/mutation-notebook/validate";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/mutations/:id/submit-review
 *
 * Marks a draft mutation as "awaiting_review", locking it from
 * further edits.  Runs validation first and blocks submission
 * if there are blocking errors.
 */
export async function POST(req: Request, { params }: Ctx) {
  const d = requireUser(req);
  if (d) return d;

  const { id } = await params;
  const cur = await store.get(id);

  if (!cur) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (cur.status === "awaiting_review") {
    return NextResponse.json(
      { error: "This entry has already been submitted for review." },
      { status: 409 }
    );
  }

  // Run validation — block if there are errors
  const allMutations = await store.list();
  const findings = validate(cur.fields, allMutations, id);

  if (findings.errors.length > 0) {
    return NextResponse.json(
      {
        error:
          "Cannot submit: there are validation errors that must be resolved first.",
        findings,
      },
      { status: 422 }
    );
  }

  const updated = await store.update(id, {
    status: "awaiting_review",
    findings,
  });

  return NextResponse.json({ mutation: updated });
}

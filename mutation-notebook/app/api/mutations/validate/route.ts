import { NextResponse } from "next/server";
import { requireUser } from "@/lib/mutation/auth";
import { sanitizeFields } from "@/lib/mutation/schema";
import { validate } from "@/lib/mutation/validate";
import { store } from "@/lib/mutation/store";

/**
 * POST /api/mutations/validate
 *
 * Validates a set of mutation fields and returns errors + warnings.
 * Does not persist anything — purely advisory.
 */
export async function POST(req: Request) {
  const d = requireUser(req);
  if (d) return d;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const fields = sanitizeFields(body.fields);
  const excludeId =
    typeof body.excludeId === "string" ? body.excludeId : undefined;

  const allMutations = await store.list();
  const findings = validate(fields, allMutations, excludeId);

  return NextResponse.json({ findings });
}

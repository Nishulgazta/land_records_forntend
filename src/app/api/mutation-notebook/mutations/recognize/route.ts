import { NextResponse } from "next/server";
import { requireUser } from "@/lib/mutation-notebook/auth";
import { recognizeHandwriting } from "@/lib/mutation-notebook/recognize";

/**
 * POST /api/mutations/recognize
 *
 * Accepts a base64-encoded notebook page image and returns
 * structured recognition results.
 */
export async function POST(req: Request) {
  const d = requireUser(req);
  if (d) return d;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || typeof body.image !== "string") {
    return NextResponse.json(
      { error: "Request must include an `image` field (base64 PNG)." },
      { status: 400 }
    );
  }

  try {
    const result = await recognizeHandwriting(body.image);
    return NextResponse.json({ recognition: result });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Recognition failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

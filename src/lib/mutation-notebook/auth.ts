import { NextResponse } from "next/server";

/**
 * Simple authentication guard.
 *
 * In production, replace this with your real authentication middleware
 * (JWT validation, session cookie check, etc.).
 *
 * The function signature follows the convention used by the existing
 * route stubs: return a NextResponse to block the request, or null to
 * allow it through.
 *
 * For the MVP all requests are permitted so the notebook can be
 * demonstrated without an auth backend.
 */
export function requireUser(_req: Request): NextResponse | null {
  // ──────────────────────────────────────────────────────────
  //  To enable authentication, uncomment the block below and
  //  replace with your real auth logic:
  //
  //  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  //  if (!token || !isValidToken(token)) {
  //    return NextResponse.json(
  //      { error: "Unauthorized. Please log in." },
  //      { status: 401 }
  //    );
  //  }
  // ──────────────────────────────────────────────────────────

  return null; // Allow all requests in demo mode
}

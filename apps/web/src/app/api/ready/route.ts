import { NextResponse } from "next/server";

/**
 * Process liveness for the deploy proxy.
 * Stays on /api/ready. /api/v1 is rewritten to the API and must not be used here.
 * Coolify curls this path on port 3000.
 */
export const GET = (): NextResponse => NextResponse.json({ status: "ok" });

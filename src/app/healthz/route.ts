import { NextResponse } from "next/server";

import { buildHealthPayload } from "@/lib/system";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(buildHealthPayload());
}


import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { findLinkByCode, recordClick } from "@/lib/links";
import { shortCodeSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await context.params;
  const parsed = shortCodeSchema.safeParse(rawCode);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid code" }, { status: 404 });
  }

  const code = parsed.data;
  const link = await findLinkByCode(code);

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  await recordClick(code);

  return NextResponse.redirect(link.url, 302);
}


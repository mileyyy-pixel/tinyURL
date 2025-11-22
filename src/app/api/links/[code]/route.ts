import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  deleteLinkByCode,
  findLinkByCode,
  serializeLink,
} from "@/lib/links";
import { shortCodeSchema } from "@/lib/validation";

export const runtime = "nodejs";

const notFound = NextResponse.json({ error: "Link not found" }, { status: 404 });

const validateCode = (code: string) => {
  const parsed = shortCodeSchema.safeParse(code);
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await context.params;
  const code = validateCode(rawCode);
  if (!code) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const link = await findLinkByCode(code);

  if (!link) {
    return notFound;
  }

  return NextResponse.json({ link: serializeLink(link) });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await context.params;
  const code = validateCode(rawCode);
  if (!code) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const link = await findLinkByCode(code);

  if (!link) {
    return notFound;
  }

  await deleteLinkByCode(code);

  return NextResponse.json({ ok: true });
}


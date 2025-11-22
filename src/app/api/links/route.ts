import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";

import {
  createLink as persistLink,
  listLinks,
  findLinkByCode,
} from "@/lib/links";
import { createLinkSchema } from "@/lib/validation";

export const runtime = "nodejs";

const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DEFAULT_CODE_LENGTH = 7;
const MAX_CODE_ATTEMPTS = 10;
const randomCode = customAlphabet(ALPHABET, DEFAULT_CODE_LENGTH);

const respondWithValidationError = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

const generateUniqueCode = async () => {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const candidate = randomCode();
    const exists = await findLinkByCode(candidate);

    if (!exists) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique short code. Try again.");
};

export async function GET() {
  const links = await listLinks();
  return NextResponse.json({ links });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = createLinkSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues.at(0)?.message ?? "Invalid payload";
    return respondWithValidationError(message);
  }

  const input = parsed.data;
  let chosenCode = input.code;

  if (chosenCode) {
    const existing = await findLinkByCode(chosenCode);
    if (existing) {
      return respondWithValidationError(
        "That code already exists. Please choose another one.",
        409,
      );
    }
  } else {
    chosenCode = await generateUniqueCode();
  }

  try {
    const link = await persistLink({
      code: chosenCode,
      url: input.url,
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return respondWithValidationError(
        "That code already exists. Please choose another one.",
        409,
      );
    }

    throw error;
  }
}


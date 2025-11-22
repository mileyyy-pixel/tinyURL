import { z } from "zod";

export const SHORT_CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;
const ensureHttpProtocol = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

export const shortCodeSchema = z
  .string()
  .trim()
  .min(6, "Codes must be 6-8 characters long")
  .max(8, "Codes must be 6-8 characters long")
  .regex(SHORT_CODE_REGEX, "Codes may only use letters and numbers");

const optionalCodeSchema = z
  .union([shortCodeSchema, z.literal(""), z.undefined()])
  .transform((value) => {
    if (!value) {
      return undefined;
    }

    return value;
  });

export const createLinkSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .transform(ensureHttpProtocol)
    .refine((value) => {
      try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    }, "Enter a valid URL that starts with http:// or https://"),
  code: optionalCodeSchema.optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type OptionalCodeInput = z.infer<typeof optionalCodeSchema>;


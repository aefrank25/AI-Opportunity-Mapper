import { z } from "zod";

const urlLike = /^([a-z0-9-]+\.)+[a-z]{2}[a-z]*(\/.*)?$/i;

export const urlSchema = z
  .string()
  .trim()
  .min(1, { message: "Please enter a website URL." })
  .max(500, { message: "URL is too long." })
  .transform((v) => v.replace(/^https?:\/\//i, "").replace(/\/+$/g, ""))
  .refine((v) => urlLike.test(v), {
    message: "Enter a valid website like example.com or acme.co/uk.",
  });

export function normalizeUrl(input: string): string {
  return input.trim().replace(/^https?:\/\//i, "").replace(/\/+$/g, "");
}

export function displayHost(input: string): string {
  const n = normalizeUrl(input);
  return n.split("/")[0];
}

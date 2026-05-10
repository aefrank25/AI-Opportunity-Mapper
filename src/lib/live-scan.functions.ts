import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runLiveScan, LiveScanError } from "./live-scan.server";

const PRIORITY_VALUES = [
  "save_time",
  "more_leads",
  "follow_up",
  "reduce_admin",
  "customer_experience",
  "reporting",
  "not_sure",
] as const;

const inputSchema = z.object({
  url: z.string().min(1).max(500),
  priority: z.enum(PRIORITY_VALUES),
});

export const liveScan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const result = await runLiveScan(data.url, data.priority);
      return { ok: true as const, result };
    } catch (e) {
      const code = e instanceof LiveScanError ? e.code : "ai_failed";
      const message =
        e instanceof Error ? e.message : "Unknown error during live scan.";
      console.error("[liveScan]", code, message);
      return { ok: false as const, code, message };
    }
  });

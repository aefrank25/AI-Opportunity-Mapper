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
      if (e instanceof LiveScanError) {
        console.error("[liveScan]", e.code, e.message, e.diagnostics);
        return {
          ok: false as const,
          code: e.code,
          message: e.message,
          diagnostics: e.diagnostics,
        };
      }
      const message = e instanceof Error ? e.message : "Unknown error during live scan.";
      console.error("[liveScan] unknown", message);
      return {
        ok: false as const,
        code: "unknown" as const,
        message,
        diagnostics: {
          mapSucceeded: false,
          discoveredCount: 0,
          selectedPages: [],
          scrapedCount: 0,
          totalChars: 0,
          llmCallStarted: false,
          validationFailed: false,
          rawError: message,
        },
      };
    }
  });

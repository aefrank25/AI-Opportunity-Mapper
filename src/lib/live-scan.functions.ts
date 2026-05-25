import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runLiveScan, LiveScanError } from "./live-scan.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function logScanEvent(name: string, props: Record<string, unknown>) {
  try {
    await supabaseAdmin.from("analytics_events").insert({ name, props: props as never });
  } catch (err) {
    console.error("[liveScan] analytics insert failed", err);
  }
}

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
    let host: string | null = null;
    try {
      host = new URL(data.url.startsWith("http") ? data.url : `https://${data.url}`).hostname;
    } catch {}
    await logScanEvent("live_scan_started_server", { host, priority: data.priority });
    try {
      const result = await runLiveScan(data.url, data.priority);
      await logScanEvent("live_scan_completed_server", { host, priority: data.priority });
      return { ok: true as const, result };
    } catch (e) {
      if (e instanceof LiveScanError) {
        console.error("[liveScan]", e.code, e.message, e.diagnostics);
        await logScanEvent("live_scan_failed_server", { host, priority: data.priority, code: e.code });
        return {
          ok: false as const,
          code: e.code,
          message: e.message,
          diagnostics: e.diagnostics,
        };
      }
      const message = e instanceof Error ? e.message : "Unknown error during live scan.";
      console.error("[liveScan] unknown", message);
      await logScanEvent("live_scan_failed_server", { host, priority: data.priority, code: "unknown" });
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

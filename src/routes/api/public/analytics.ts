import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PayloadSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  props: z.record(z.string(), z.unknown()).optional(),
  path: z.string().max(2048).optional(),
  ts: z.string().max(64).optional(),
});

export const Route = createFileRoute("/api/public/analytics")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const raw = await request.text();
          if (!raw || raw.length > 8192) {
            return new Response("Bad request", { status: 400 });
          }
          const parsed = PayloadSchema.safeParse(JSON.parse(raw));
          if (!parsed.success) {
            return new Response("Invalid payload", { status: 400 });
          }
          const { name, props, path } = parsed.data;
          await supabaseAdmin.from("analytics_events").insert({
            name,
            props: (props ?? {}) as never,
            path: path ?? null,
          });
          return new Response("ok", { status: 204 });
        } catch {
          return new Response("Error", { status: 500 });
        }
      },
    },
  },
});

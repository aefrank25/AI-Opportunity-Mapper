import { supabaseAdmin } from "@/integrations/supabase/client.server";

const OWNER_EMAIL = "sonorandatastrategy@gmail.com";
const FROM_ADDRESS = "AI Opportunity Mapper <onboarding@resend.dev>";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendOwnerEmail(subject: string, html: string): Promise<void> {
  const lovableApiKey = process.env.LOVABLE_API_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!lovableApiKey || !resendApiKey) {
    console.warn("[waitlist-digest] owner email skipped: missing LOVABLE_API_KEY or RESEND_API_KEY");
    return;
  }
  const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableApiKey}`,
      "X-Connection-Api-Key": resendApiKey,
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [OWNER_EMAIL],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[waitlist-digest] owner email send failed [${res.status}]: ${body}`);
  }
}

/**
 * Server-only digest function. NOT exported as a createServerFn — callable only
 * from trusted server contexts (the auth-gated /api/public/hooks/waitlist-digest
 * route). This eliminates the RPC surface so it can't be triggered by anyone
 * who guesses the server-fn ID.
 */
export async function sendWaitlistDigest() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: signups, error } = await supabaseAdmin
    .from("implementation_brief_waitlist")
    .select("email, source_url, top_opportunity, created_at")
    .gte("created_at", since)
    .eq("is_demo", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[waitlist-digest] query failed:", error);
    throw new Error("Digest query failed");
  }

  const count = signups?.length ?? 0;
  if (count === 0) {
    return { ok: true as const, sent: false as const, count: 0 };
  }

  const rows = signups!
    .map((s) => {
      const parts = [`<strong>${escapeHtml(s.email)}</strong>`];
      if (s.top_opportunity) parts.push(escapeHtml(s.top_opportunity));
      if (s.source_url) {
        // Only render as a clickable link if the URL uses http(s). Other schemes
        // (javascript:, data:, etc.) are shown as plain escaped text to prevent
        // unsafe links in the owner's inbox.
        const isSafeHttpUrl = /^https?:\/\//i.test(s.source_url);
        parts.push(
          isSafeHttpUrl
            ? `<a href="${escapeHtml(s.source_url)}">${escapeHtml(s.source_url)}</a>`
            : escapeHtml(s.source_url),
        );
      }
      parts.push(`<span style="color:#666">${new Date(s.created_at).toUTCString()}</span>`);
      return `<li style="margin-bottom:8px">${parts.join(" — ")}</li>`;
    })
    .join("");

  await sendOwnerEmail(
    `Daily waitlist digest: ${count} new signup${count === 1 ? "" : "s"}`,
    `<h2>${count} new waitlist signup${count === 1 ? "" : "s"} in the last 24h</h2><ul>${rows}</ul>`,
  );

  return { ok: true as const, sent: true as const, count };
}

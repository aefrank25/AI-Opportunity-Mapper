// Server-only helpers for scan-bonus email capture.

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

export async function notifyOwnerOfScanBonus(input: {
  email: string;
  sourceUrl: string | null;
}): Promise<void> {
  const lovableApiKey = process.env.LOVABLE_API_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!lovableApiKey || !resendApiKey) {
    console.warn("[scan-bonus] owner email skipped: missing LOVABLE_API_KEY or RESEND_API_KEY");
    return;
  }
  const rows = [`<p><strong>Email:</strong> ${escapeHtml(input.email)}</p>`];
  if (input.sourceUrl) {
    rows.push(`<p><strong>Source URL:</strong> ${escapeHtml(input.sourceUrl)}</p>`);
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
      subject: `New scan-bonus email: ${input.email}`,
      html: `<h2>New scan-bonus email captured</h2>${rows.join("")}<p style="color:#666;font-size:12px">AI Opportunity Mapper</p>`,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[scan-bonus] owner email send failed [${res.status}]: ${body}`);
  }
}

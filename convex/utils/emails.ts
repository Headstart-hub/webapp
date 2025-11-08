
/**
 * Utility function for sending invite emails via SendGrid
 */
export async function sendInviteEmail(params: {
  to: string;
  projectName: string;
  inviterName?: string;
  inviteLink: string;
  expiresAt?: number;
}): Promise<{ ok: boolean; skipped?: boolean }> {
  const { to, projectName, inviterName, inviteLink, expiresAt } = params;
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@headstart.app";
  const fromName = process.env.SENDGRID_FROM_NAME || "Headstart";

  if (!apiKey) {
    console.warn("SENDGRID_API_KEY not set; skipping email send.");
    return { ok: true, skipped: true };
  }

  const subject = `You're invited to join ${projectName}`;
  const expiresText = expiresAt
    ? `This invitation expires on ${new Date(expiresAt).toLocaleString()}.`
    : "";
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin: 0 0 12px;">Project invitation</h2>
      <p style="margin: 0 0 12px;">${inviterName ? `<strong>${inviterName}</strong> has ` : ""}invited you to join <strong>${projectName}</strong>.</p>
      <p style="margin: 0 0 16px;">Click the button below to view and accept your invitation.</p>
      <p style="margin: 0 0 20px;">
        <a href="${inviteLink}" style="background: #4f46e5; color: #fff; text-decoration: none; padding: 10px 14px; border-radius: 8px; display: inline-block;">View invitation</a>
      </p>
      ${expiresText ? `<p style="font-size: 12px; color: #6b7280;">${expiresText}</p>` : ""}
    </div>
  `;

  const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: {
        email: fromEmail,
        name: fromName,
      },
      content: [
        {
          type: "text/html",
          value: html,
        },
      ],
    }),
  });


  if (!resp.ok) {
    const data = await resp.text().catch(() => "");
    console.error("Failed to send invite email via SendGrid", {
      status: resp.status,
      statusText: resp.statusText,
      body: data,
    });
    return { ok: false };
  }

  return { ok: true };
}
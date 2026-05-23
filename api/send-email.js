// Vercel serverless function — POST /api/send-email
// Sends signup notifications via Resend (https://resend.com).
//
// Required env vars (set these in Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY  — your key from resend.com/api-keys
//   NOTIFY_EMAIL    — the email address signup notifications go TO
//                     (must match your Resend account email until you verify a domain)
//
// Optional:
//   SEND_WELCOME    — set to "true" to also email the tester. Requires a verified
//                     domain at resend.com/domains, otherwise Resend will reject.

export default async function handler(req, res) {
  // CORS for local testing (Vercel preview <-> prod is same-origin so usually unneeded)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { kind = "signup", name, email, stateCode, discipline, sprint, motivation, feedback } = req.body || {};

  if (!name && !email && !feedback) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;
  if (!apiKey || !notifyEmail) {
    return res.status(500).json({ error: "Email service not configured — check Vercel env vars" });
  }

  const subjects = {
    signup: `🟢 New ImpactSprint signup: ${name || "unknown"}`,
    application: `📝 New application: ${name || "unknown"} → ${sprint || "—"}`,
    feedback: `💬 New ImpactSprint feedback`,
  };
  const subject = subjects[kind] || subjects.signup;

  const row = (label, value) => value
    ? `<tr><td style="padding:6px 12px 6px 0;color:#4A6B56;font-size:13px;">${esc(label)}</td><td style="padding:6px 0;color:#0A1F10;font-size:14px;font-weight:600;">${esc(value)}</td></tr>`
    : "";

  const adminHtml = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:#1A8C4E;color:#fff;padding:16px 20px;border-radius:12px 12px 0 0;">
        <div style="font-size:12px;opacity:0.85;letter-spacing:0.05em;text-transform:uppercase;">ImpactSprint · ${esc(kind)}</div>
        <div style="font-size:20px;font-weight:800;margin-top:4px;">${esc(subject.replace(/^[^\s]+\s/, ""))}</div>
      </div>
      <div style="background:#F5FBF7;border:1px solid #D4EDE0;border-top:none;padding:18px 20px;border-radius:0 0 12px 12px;">
        <table style="border-collapse:collapse;width:100%;">
          ${row("Name", name)}
          ${row("Email", email)}
          ${row("NYSC code", stateCode)}
          ${row("Discipline", discipline)}
          ${row("Sprint", sprint)}
          ${row("Motivation", motivation)}
          ${row("Feedback", feedback)}
          <tr><td style="padding:6px 12px 6px 0;color:#4A6B56;font-size:13px;">Time</td><td style="padding:6px 0;color:#0A1F10;font-size:14px;">${new Date().toISOString()}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin-top:14px;color:#8AAD96;font-size:11px;">Sent from impactsprint demo</div>
    </div>`;

  try {
    // 1. Notify admin
    const adminResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "ImpactSprint <onboarding@resend.dev>",
        to: notifyEmail,
        subject,
        html: adminHtml,
      }),
    });

    if (!adminResp.ok) {
      const errText = await adminResp.text();
      console.error("Resend admin send failed:", adminResp.status, errText);
      return res.status(502).json({ error: "Email send failed", detail: errText });
    }

    // 2. Optional welcome email to the tester (requires verified domain)
    let welcomeId = null;
    if (process.env.SEND_WELCOME === "true" && kind === "signup" && email) {
      const welcomeResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "ImpactSprint <onboarding@resend.dev>",
          to: email,
          subject: "Welcome to ImpactSprint 🎉",
          html: `
            <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
              <h2 style="color:#1A8C4E;margin:0 0 12px;">Welcome${name ? ", " + esc(name.split(" ")[0]) : ""}!</h2>
              <p style="color:#0A1F10;font-size:14px;line-height:1.6;">
                You've successfully created your ImpactSprint profile. We've verified your NYSC posting${stateCode ? ` (${esc(stateCode)})` : ""} and you can now apply to verified NGO sprints.
              </p>
              <p style="color:#4A6B56;font-size:13px;line-height:1.6;">
                Browse open sprints, apply with a short motivation note, and earn NGO-endorsed badges as you complete deliverables. Every sprint is short, focused, and counts toward a public portfolio you can share with employers after NYSC.
              </p>
              <p style="color:#8AAD96;font-size:11px;margin-top:24px;">— The ImpactSprint team</p>
            </div>`,
        }),
      });
      if (welcomeResp.ok) {
        const w = await welcomeResp.json();
        welcomeId = w.id;
      } else {
        // don't fail the whole request just because welcome failed
        console.warn("Welcome email failed:", await welcomeResp.text());
      }
    }

    const adminData = await adminResp.json();
    return res.status(200).json({ ok: true, adminId: adminData.id, welcomeId });
  } catch (e) {
    console.error("send-email handler error:", e);
    return res.status(500).json({ error: "Internal error", detail: String(e?.message || e) });
  }
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

import nodemailer from "nodemailer";
import { Resend } from "resend";

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Envoie un email via Resend si RESEND_API_KEY est défini, sinon via SMTP (Mailhog en dev).
 * Échoue silencieusement avec un log si aucun transport n'est configuré.
 */
export async function sendEmail({ to, subject, html, replyTo }: SendArgs): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? process.env.SMTP_FROM ?? "noreply@localhost";

  if (resendKey) {
    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo,
    });
    if (error) throw new Error(`Resend: ${error.message}`);
    return;
  }

  const host = process.env.SMTP_HOST;
  if (!host) {
    console.warn("[email] No transport configured (RESEND_API_KEY / SMTP_HOST), skipping send");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" }
      : undefined,
  });

  await transporter.sendMail({ from, to, subject, html, replyTo });
}

const TIMELINE_LABELS_FR: Record<string, string> = {
  urgent: "Urgent (sous 2 semaines)",
  month: "Sous 1 mois",
  quarter: "Sous 3 mois",
  flexible: "Flexible",
};

const BUDGET_LABELS_FR: Record<string, string> = {
  under5k: "< 5 k€",
  "5to15k": "5 – 15 k€",
  "15to50k": "15 – 50 k€",
  over50k: "> 50 k€",
  todiscuss: "À discuter",
};

export function contactNotificationHtml(args: {
  name: string;
  email: string;
  subject: string;
  message: string;
  timeline?: string;
  stack?: string;
  budget?: string;
}): string {
  const safe = (s: string) =>
    s.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
    );

  const contextRows: string[] = [];
  if (args.timeline) {
    const label = TIMELINE_LABELS_FR[args.timeline] ?? args.timeline;
    contextRows.push(
      `<tr><td style="padding:8px 0; color:#94a3b8;">Timeline</td><td>${safe(label)}</td></tr>`,
    );
  }
  if (args.stack) {
    contextRows.push(
      `<tr><td style="padding:8px 0; color:#94a3b8;">Stack souhaitée</td><td>${safe(args.stack)}</td></tr>`,
    );
  }
  if (args.budget) {
    const label = BUDGET_LABELS_FR[args.budget] ?? args.budget;
    contextRows.push(
      `<tr><td style="padding:8px 0; color:#94a3b8;">Budget</td><td>${safe(label)}</td></tr>`,
    );
  }

  const contextBlock =
    contextRows.length > 0
      ? `
    <h3 style="color:#22d3ee; margin: 20px 0 8px; font-size: 14px;">◊ Contexte projet</h3>
    <table style="width:100%; border-collapse: collapse;">
      ${contextRows.join("\n      ")}
    </table>`
      : "";

  return `
  <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background:#0a0420; color:#e2e8f0; padding: 24px; border-radius: 12px;">
    <h2 style="color:#22d3ee; margin: 0 0 16px;">📡 Nouveau message via leoderoin.fr</h2>
    <table style="width:100%; border-collapse: collapse;">
      <tr><td style="padding:8px 0; color:#94a3b8;">Nom</td><td><strong>${safe(args.name)}</strong></td></tr>
      <tr><td style="padding:8px 0; color:#94a3b8;">Email</td><td><a style="color:#22d3ee" href="mailto:${safe(args.email)}">${safe(args.email)}</a></td></tr>
      <tr><td style="padding:8px 0; color:#94a3b8;">Sujet</td><td>${safe(args.subject)}</td></tr>
    </table>${contextBlock}
    <hr style="border: none; border-top: 1px solid #334155; margin: 16px 0;" />
    <div style="white-space: pre-wrap; line-height: 1.6;">${safe(args.message)}</div>
  </div>`;
}

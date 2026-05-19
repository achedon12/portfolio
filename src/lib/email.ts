import nodemailer from "nodemailer";
import { profile } from "@/lib/profile";

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Envoie un email via SMTP (variables `SMTP_*`).
 * Log + return silencieux si aucun `SMTP_HOST` n'est défini (dev sans Mailhog).
 */
export async function sendEmail({ to, subject, html, replyTo }: SendArgs): Promise<void> {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM ?? "noreply@localhost";

  if (!host) {
    console.warn("[email] SMTP_HOST not configured, skipping send");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: process.env.SMTP_SECURE === "true",
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

const TIMELINE_LABELS_EN: Record<string, string> = {
  urgent: "Urgent (within 2 weeks)",
  month: "Within 1 month",
  quarter: "Within 3 months",
  flexible: "Flexible",
};

const BUDGET_LABELS_FR: Record<string, string> = {
  under5k: "< 5 k€",
  "5to15k": "5 – 15 k€",
  "15to50k": "15 – 50 k€",
  over50k: "> 50 k€",
  todiscuss: "À discuter",
};

const BUDGET_LABELS_EN: Record<string, string> = {
  under5k: "< €5k",
  "5to15k": "€5–15k",
  "15to50k": "€15–50k",
  over50k: "> €50k",
  todiscuss: "To discuss",
};

const SUBJECT_LABELS_FR: Record<string, string> = {
  projet: "Projet",
  freelance: "Freelance",
  collab: "Collaboration",
  autre: "Autre",
};

const SUBJECT_LABELS_EN: Record<string, string> = {
  projet: "Project",
  freelance: "Freelance",
  collab: "Collaboration",
  autre: "Other",
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

/**
 * Email de notification envoyé à l'admin (toi) à chaque demande de contact.
 * Toujours en FR — c'est ton cockpit.
 */
export function contactNotificationHtml(args: {
  name: string;
  email: string;
  subject: string;
  message: string;
  timeline?: string;
  stack?: string;
  budget?: string;
}): string {
  const contextRows: string[] = [];
  if (args.timeline) {
    const label = TIMELINE_LABELS_FR[args.timeline] ?? args.timeline;
    contextRows.push(
      `<tr><td style="padding:8px 0; color:#94a3b8;">Timeline</td><td>${escapeHtml(label)}</td></tr>`,
    );
  }
  if (args.stack) {
    contextRows.push(
      `<tr><td style="padding:8px 0; color:#94a3b8;">Stack souhaitée</td><td>${escapeHtml(args.stack)}</td></tr>`,
    );
  }
  if (args.budget) {
    const label = BUDGET_LABELS_FR[args.budget] ?? args.budget;
    contextRows.push(
      `<tr><td style="padding:8px 0; color:#94a3b8;">Budget</td><td>${escapeHtml(label)}</td></tr>`,
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

  const subjectLabel = SUBJECT_LABELS_FR[args.subject] ?? args.subject;

  return `
  <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background:#0a0420; color:#e2e8f0; padding: 24px; border-radius: 12px;">
    <h2 style="color:#22d3ee; margin: 0 0 16px;">Nouveau message via leoderoin.fr</h2>
    <table style="width:100%; border-collapse: collapse;">
      <tr><td style="padding:8px 0; color:#94a3b8;">Nom</td><td><strong>${escapeHtml(args.name)}</strong></td></tr>
      <tr><td style="padding:8px 0; color:#94a3b8;">Email</td><td><a style="color:#22d3ee" href="mailto:${escapeHtml(args.email)}">${escapeHtml(args.email)}</a></td></tr>
      <tr><td style="padding:8px 0; color:#94a3b8;">Sujet</td><td>${escapeHtml(subjectLabel)}</td></tr>
    </table>${contextBlock}
    <hr style="border: none; border-top: 1px solid #334155; margin: 16px 0;" />
    <div style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(args.message)}</div>
  </div>`;
}

interface ConfirmationCopy {
  subject: string;
  heading: string;
  intro: string;
  recapTitle: string;
  labelSubject: string;
  labelMessage: string;
  outro: string;
  signature: string;
}

const CONFIRMATION_COPY_FR: ConfirmationCopy = {
  subject: "Bien reçu — Léo Deroin",
  heading: "Message bien reçu",
  intro:
    "Merci pour ton message — il est arrivé sur la station. Je te réponds personnellement sous 48h ouvrées, le plus souvent plus vite.",
  recapTitle: "Récapitulatif",
  labelSubject: "Sujet",
  labelMessage: "Message",
  outro:
    "Si c'est urgent, tu peux aussi me joindre sur LinkedIn — sinon, garde un œil sur ta boîte (et le dossier spam, au cas où).",
  signature: "Léo Deroin · Développeur Fullstack",
};

const CONFIRMATION_COPY_EN: ConfirmationCopy = {
  subject: "Message received — Léo Deroin",
  heading: "Message received",
  intro:
    "Thanks for reaching out — your message landed on the station. I'll get back to you personally within 2 business days, usually sooner.",
  recapTitle: "Summary",
  labelSubject: "Subject",
  labelMessage: "Message",
  outro:
    "If it's urgent, you can also reach me on LinkedIn — otherwise, keep an eye on your inbox (and the spam folder, just in case).",
  signature: "Léo Deroin · Fullstack Developer",
};

/**
 * Email d'accusé de réception envoyé au visiteur. Bilingue (FR/EN) en fonction
 * de la locale active sur le site au moment de l'envoi.
 */
export function contactConfirmationHtml(args: {
  name: string;
  subject: string;
  message: string;
  locale: "fr" | "en";
}): { subject: string; html: string } {
  const copy = args.locale === "en" ? CONFIRMATION_COPY_EN : CONFIRMATION_COPY_FR;
  const subjectLabel =
    args.locale === "en"
      ? SUBJECT_LABELS_EN[args.subject] ?? args.subject
      : SUBJECT_LABELS_FR[args.subject] ?? args.subject;

  const html = `
  <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background:#0a0420; color:#e2e8f0; padding: 24px; border-radius: 12px;">
    <h2 style="color:#22d3ee; margin: 0 0 8px;">◊ ${escapeHtml(copy.heading)}</h2>
    <p style="margin: 0 0 20px; line-height: 1.6; color:#cbd5e1;">${escapeHtml(args.name)},</p>
    <p style="margin: 0 0 20px; line-height: 1.6;">${escapeHtml(copy.intro)}</p>

    <h3 style="color:#22d3ee; margin: 20px 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">${escapeHtml(copy.recapTitle)}</h3>
    <table style="width:100%; border-collapse: collapse; margin-bottom: 8px;">
      <tr>
        <td style="padding:8px 0; color:#94a3b8; width: 110px; vertical-align: top;">${escapeHtml(copy.labelSubject)}</td>
        <td style="padding:8px 0;">${escapeHtml(subjectLabel)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0; color:#94a3b8; vertical-align: top;">${escapeHtml(copy.labelMessage)}</td>
        <td style="padding:8px 0; white-space: pre-wrap; line-height: 1.6;">${escapeHtml(args.message)}</td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;" />
    <p style="margin: 0 0 16px; line-height: 1.6; color:#cbd5e1;">${escapeHtml(copy.outro)}</p>
    <p style="margin: 0; font-family: ui-monospace, monospace; font-size: 12px; color:#22d3ee;">— ${escapeHtml(copy.signature)}</p>
    <p style="margin: 4px 0 0; font-family: ui-monospace, monospace; font-size: 11px; color:#64748b;">
      <a style="color:#64748b; text-decoration: underline;" href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a>
      · <a style="color:#64748b; text-decoration: underline;" href="${escapeHtml(profile.links.linkedin)}">LinkedIn</a>
    </p>
  </div>`;

  return { subject: copy.subject, html };
}

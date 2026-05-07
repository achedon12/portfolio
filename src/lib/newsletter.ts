import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { enqueueMail } from "@/lib/mail-queue";

export type Locale = "fr" | "en";

function token64(): string {
  return randomBytes(32).toString("hex");
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";

const SUBJECTS_FR = {
  confirm: "Confirme ton inscription à la newsletter",
  welcome: "Bienvenue à bord",
};
const SUBJECTS_EN = {
  confirm: "Confirm your newsletter subscription",
  welcome: "Welcome aboard",
};

function localePrefix(locale: Locale): string {
  return locale === "fr" ? "" : "/en";
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function confirmEmailHtml(locale: Locale, confirmToken: string): string {
  const link = `${APP_URL}/api/newsletter/confirm?token=${confirmToken}`;
  if (locale === "en") {
    return `
<div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; background:#0a0420; color:#e2e8f0; padding: 32px; border-radius: 12px;">
  <p style="font-family: monospace; font-size: 11px; letter-spacing: 4px; color: #22d3ee; text-transform: uppercase; margin: 0 0 16px;">◊ Boarding pass</p>
  <h2 style="color:#f1f5f9; margin: 0 0 16px; font-size: 22px;">Confirm your subscription</h2>
  <p style="line-height: 1.6; margin: 0 0 24px; color:#cbd5e1;">Click the button below to confirm — you'll then receive new posts straight to your inbox.</p>
  <p><a href="${escape(link)}" style="display:inline-block; padding:12px 24px; background:#22d3ee; color:#030014; text-decoration:none; border-radius:6px; font-weight:600; font-family: monospace; text-transform: uppercase; letter-spacing: 2px; font-size: 12px;">Confirm subscription</a></p>
  <p style="margin-top: 24px; font-size: 12px; color: #64748b;">If you didn't request this, just ignore the message — you won't be subscribed.</p>
  <p style="margin-top: 24px; font-size: 11px; color: #475569; word-break: break-all;">Or copy this link:<br>${escape(link)}</p>
</div>`;
  }
  return `
<div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; background:#0a0420; color:#e2e8f0; padding: 32px; border-radius: 12px;">
  <p style="font-family: monospace; font-size: 11px; letter-spacing: 4px; color: #22d3ee; text-transform: uppercase; margin: 0 0 16px;">◊ Embarquement</p>
  <h2 style="color:#f1f5f9; margin: 0 0 16px; font-size: 22px;">Confirme ton inscription</h2>
  <p style="line-height: 1.6; margin: 0 0 24px; color:#cbd5e1;">Clique sur le bouton ci-dessous pour confirmer — tu recevras ensuite mes nouveaux articles directement dans ta boîte.</p>
  <p><a href="${escape(link)}" style="display:inline-block; padding:12px 24px; background:#22d3ee; color:#030014; text-decoration:none; border-radius:6px; font-weight:600; font-family: monospace; text-transform: uppercase; letter-spacing: 2px; font-size: 12px;">Confirmer l'inscription</a></p>
  <p style="margin-top: 24px; font-size: 12px; color: #64748b;">Si tu n'es pas à l'origine de cette demande, ignore simplement ce message — tu ne seras pas inscrit.</p>
  <p style="margin-top: 24px; font-size: 11px; color: #475569; word-break: break-all;">Ou copie ce lien :<br>${escape(link)}</p>
</div>`;
}

function welcomeEmailHtml(locale: Locale, unsubscribeToken: string): string {
  const unsubLink = `${APP_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
  const blogLink = `${APP_URL}${localePrefix(locale)}/blog`;
  if (locale === "en") {
    return `
<div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; background:#0a0420; color:#e2e8f0; padding: 32px; border-radius: 12px;">
  <p style="font-family: monospace; font-size: 11px; letter-spacing: 4px; color: #22d3ee; text-transform: uppercase; margin: 0 0 16px;">◊ Aboard</p>
  <h2 style="color:#f1f5f9; margin: 0 0 16px; font-size: 22px;">Welcome — you're in.</h2>
  <p style="line-height: 1.6; margin: 0 0 16px; color:#cbd5e1;">You'll get my new posts whenever they ship. No spam, no calendar — only when there's something to share.</p>
  <p style="margin: 16px 0;"><a href="${escape(blogLink)}" style="color:#22d3ee;">Browse the blog →</a></p>
  <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;">
  <p style="font-size: 11px; color: #64748b;">Want to leave? <a style="color:#94a3b8;" href="${escape(unsubLink)}">One-click unsubscribe</a>.</p>
</div>`;
  }
  return `
<div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; background:#0a0420; color:#e2e8f0; padding: 32px; border-radius: 12px;">
  <p style="font-family: monospace; font-size: 11px; letter-spacing: 4px; color: #22d3ee; text-transform: uppercase; margin: 0 0 16px;">◊ À bord</p>
  <h2 style="color:#f1f5f9; margin: 0 0 16px; font-size: 22px;">Bienvenue — t'es dans la boucle.</h2>
  <p style="line-height: 1.6; margin: 0 0 16px; color:#cbd5e1;">Tu recevras mes nouveaux articles quand j'en publie. Pas de spam, pas de calendrier — seulement quand j'ai quelque chose à dire.</p>
  <p style="margin: 16px 0;"><a href="${escape(blogLink)}" style="color:#22d3ee;">Voir les articles →</a></p>
  <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;">
  <p style="font-size: 11px; color: #64748b;">Envie de partir ? <a style="color:#94a3b8;" href="${escape(unsubLink)}">Désinscription en un clic</a>.</p>
</div>`;
}

export interface SubscribeOutcome {
  ok: true;
  reactivated: boolean;
  alreadyConfirmed: boolean;
}

/**
 * Inscrit (ou ré-inscrit) un email à la newsletter.
 *
 * - Si `CONFIRMED` existant → silent ok (pas d'email renvoyé). On ne révèle
 *   pas qu'un email est déjà inscrit pour empêcher l'enumeration.
 * - Si `PENDING` existant → on rotate le confirmToken et on renvoie l'email.
 * - Si `UNSUBSCRIBED` existant → on réactive en PENDING avec nouveaux tokens.
 * - Sinon → création d'un nouveau row PENDING.
 */
export async function subscribeToNewsletter(args: {
  email: string;
  locale: Locale;
  ipHash?: string;
}): Promise<SubscribeOutcome> {
  const email = args.email.trim().toLowerCase();
  const locale = args.locale;
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });

  if (existing && existing.status === "CONFIRMED") {
    return { ok: true, reactivated: false, alreadyConfirmed: true };
  }

  const confirmToken = token64();
  let unsubscribeToken: string;
  let reactivated = false;

  if (existing) {
    unsubscribeToken = existing.unsubscribeToken;
    reactivated = existing.status === "UNSUBSCRIBED";
    await prisma.newsletterSubscriber.update({
      where: { id: existing.id },
      data: {
        status: "PENDING",
        confirmToken,
        locale,
        ipHash: args.ipHash ?? existing.ipHash,
        unsubscribedAt: null,
      },
    });
  } else {
    unsubscribeToken = token64();
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        status: "PENDING",
        confirmToken,
        unsubscribeToken,
        locale,
        ipHash: args.ipHash ?? null,
      },
    });
  }

  await enqueueMail({
    to: email,
    subject: locale === "fr" ? SUBJECTS_FR.confirm : SUBJECTS_EN.confirm,
    html: confirmEmailHtml(locale, confirmToken),
    category: "newsletter_confirm",
  });

  return { ok: true, reactivated, alreadyConfirmed: false };
}

export interface ConfirmOutcome {
  ok: boolean;
  locale?: Locale;
}

export async function confirmSubscription(token: string): Promise<ConfirmOutcome> {
  if (!token || token.length !== 64) return { ok: false };
  const sub = await prisma.newsletterSubscriber.findUnique({ where: { confirmToken: token } });
  if (!sub) return { ok: false };
  if (sub.status === "CONFIRMED") return { ok: true, locale: sub.locale as Locale };

  await prisma.newsletterSubscriber.update({
    where: { id: sub.id },
    data: { status: "CONFIRMED", confirmedAt: new Date(), confirmToken: null },
  });

  await enqueueMail({
    to: sub.email,
    subject: sub.locale === "fr" ? SUBJECTS_FR.welcome : SUBJECTS_EN.welcome,
    html: welcomeEmailHtml(sub.locale as Locale, sub.unsubscribeToken),
    category: "newsletter_welcome",
  });

  return { ok: true, locale: sub.locale as Locale };
}

export async function unsubscribeByToken(token: string): Promise<ConfirmOutcome> {
  if (!token || token.length !== 64) return { ok: false };
  const sub = await prisma.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: token },
  });
  if (!sub) return { ok: false };
  if (sub.status === "UNSUBSCRIBED") return { ok: true, locale: sub.locale as Locale };

  await prisma.newsletterSubscriber.update({
    where: { id: sub.id },
    data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
  });

  return { ok: true, locale: sub.locale as Locale };
}

/** Lien unsubscribe pour insertion dans les broadcasts. */
export function unsubscribeLink(token: string): string {
  return `${APP_URL}/api/newsletter/unsubscribe?token=${token}`;
}

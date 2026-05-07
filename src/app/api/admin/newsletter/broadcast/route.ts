import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterBroadcastSchema } from "@/lib/validations";
import { enqueueMail } from "@/lib/mail-queue";
import { unsubscribeLink } from "@/lib/newsletter";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

/**
 * Wrap le HTML composé par l'admin dans un container thématique
 * + footer avec lien unsubscribe individualisé. Le `{{UNSUBSCRIBE_LINK}}`
 * de l'admin sera remplacé par le vrai lien token-based de chaque
 * destinataire au moment de l'enqueue.
 */
function buildBroadcastHtml(rawBody: string, unsubLink: string, blogLink: string): string {
  const bodyWithLink = rawBody.replaceAll("{{UNSUBSCRIBE_LINK}}", escapeHtml(unsubLink));
  return `
<div style="font-family: system-ui, sans-serif; max-width: 620px; margin: 0 auto; background:#0a0420; color:#e2e8f0; padding: 32px; border-radius: 12px;">
  ${bodyWithLink}
  <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0 16px;" />
  <p style="font-size: 11px; color: #64748b; text-align: center;">
    Envoyé depuis <a style="color:#94a3b8;" href="${escapeHtml(blogLink)}">leoderoin.fr</a> ·
    <a style="color:#94a3b8;" href="${escapeHtml(unsubLink)}">Se désinscrire</a>
  </p>
</div>`;
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const parsed = newsletterBroadcastSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation échouée", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: "CONFIRMED" },
    select: { email: true, unsubscribeToken: true, locale: true },
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ ok: true, queued: 0, message: "Aucun abonné confirmé" });
  }

  let queued = 0;
  for (const sub of subscribers) {
    const unsubLink = unsubscribeLink(sub.unsubscribeToken);
    const blogLink = `${APP_URL}${sub.locale === "fr" ? "" : "/en"}/blog`;
    const html = buildBroadcastHtml(parsed.data.html, unsubLink, blogLink);
    await enqueueMail({
      to: sub.email,
      subject: parsed.data.subject,
      html,
      category: "newsletter_broadcast",
    });
    queued += 1;
  }

  return NextResponse.json({ ok: true, queued });
}

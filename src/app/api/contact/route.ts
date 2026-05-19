import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, contactNotificationHtml, contactConfirmationHtml } from "@/lib/email";
import { profile } from "@/lib/profile";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Body JSON invalide" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation échouée", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const ip = getClientIp(req);
  const rl = await checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      {
        code: "rateLimited",
        message: `Trop de messages. Réessaie après ${rl.resetAt.toISOString()}.`,
      },
      { status: 429 },
    );
  }

  const userAgent = req.headers.get("user-agent") ?? null;
  const created = await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      ipAddress: ip,
      userAgent,
    },
  });

  const locale: "fr" | "en" = parsed.data.locale ?? "fr";

  // Notification admin (FR) + accusé de réception visiteur (locale du site),
  // envoyés en parallèle. Aucun n'est bloquant pour la réponse HTTP : si un
  // envoi échoue, le message reste en DB et est visible dans /admin/messages.
  const confirmation = contactConfirmationHtml({
    name: parsed.data.name,
    subject: parsed.data.subject,
    message: parsed.data.message,
    locale,
  });

  const results = await Promise.allSettled([
    sendEmail({
      to: profile.email,
      subject: `[leoderoin.fr] ${parsed.data.subject} — ${parsed.data.name}`,
      html: contactNotificationHtml({
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
        timeline: parsed.data.timeline || undefined,
        stack: parsed.data.stack || undefined,
        budget: parsed.data.budget || undefined,
      }),
      replyTo: parsed.data.email,
    }),
    sendEmail({
      to: parsed.data.email,
      subject: confirmation.subject,
      html: confirmation.html,
      replyTo: profile.email,
    }),
  ]);

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const which = i === 0 ? "admin notification" : "visitor confirmation";
      console.error(`[contact] ${which} email failed:`, r.reason);
    }
  });

  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}

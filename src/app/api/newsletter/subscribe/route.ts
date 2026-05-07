import { NextResponse } from "next/server";
import { newsletterSubscribeSchema } from "@/lib/validations";
import { subscribeToNewsletter } from "@/lib/newsletter";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hashIp } from "@/lib/ip-hash";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Body JSON invalide" }, { status: 400 });
  }

  const parsed = newsletterSubscribeSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "Email invalide" }, { status: 422 });
  }

  // Honeypot — si rempli, on accepte silencieusement sans rien faire.
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const ip = getClientIp(req);
  const rl = await checkRateLimit(`newsletter-sub:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { code: "rateLimited", message: "Trop de tentatives. Réessaie plus tard." },
      { status: 429 },
    );
  }

  await subscribeToNewsletter({
    email: parsed.data.email,
    locale: parsed.data.locale ?? "fr",
    ipHash: hashIp(ip),
  });

  // Réponse identique pour un nouvel email vs un déjà-confirmé : on n'expose
  // pas si l'email est déjà inscrit (anti-enumeration).
  return NextResponse.json({ ok: true }, { status: 200 });
}

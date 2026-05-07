import { NextResponse } from "next/server";
import { confirmSubscription } from "@/lib/newsletter";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const result = await confirmSubscription(token);

  const base = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const locale = result.locale ?? "fr";
  const localePrefix = locale === "fr" ? "" : "/en";

  if (!result.ok) {
    // Token inconnu/expiré → redirige vers la page d'unsubscribed avec error flag,
    // ou vers home. On choisit home avec param pour pas créer une 4e page d'erreur.
    return NextResponse.redirect(`${base}${localePrefix}/?newsletter=invalid`);
  }
  return NextResponse.redirect(`${base}${localePrefix}/newsletter/confirmed`);
}

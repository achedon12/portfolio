import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/newsletter";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const result = await unsubscribeByToken(token);

  const base = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const locale = result.locale ?? "fr";
  const localePrefix = locale === "fr" ? "" : "/en";

  if (!result.ok) {
    return NextResponse.redirect(`${base}${localePrefix}/?newsletter=invalid`);
  }
  return NextResponse.redirect(`${base}${localePrefix}/newsletter/unsubscribed`);
}

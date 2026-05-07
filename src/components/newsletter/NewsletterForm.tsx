"use client";

import { useState } from "react";
import { CheckCircle2, Send, AlertTriangle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "success" }
  | { state: "error"; msg: string };

interface NewsletterFormProps {
  /** Layout compact (Footer) ou large (page dédiée). */
  variant?: "compact" | "full";
}

export function NewsletterForm({ variant = "compact" }: NewsletterFormProps) {
  const t = useTranslations("Newsletter");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status.state === "sending") return;
    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, website }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as {
          code?: string;
          message?: string;
        };
        const msg =
          json.code === "rateLimited"
            ? t("errors.rateLimited")
            : (json.message ?? t("errors.emailInvalid"));
        throw new Error(msg);
      }
      setStatus({ state: "success" });
      setEmail("");
    } catch (err) {
      setStatus({ state: "error", msg: err instanceof Error ? err.message : t("errorPrefix") });
    }
  }

  if (status.state === "success") {
    return (
      <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t("submitted")}</span>
      </div>
    );
  }

  const compact = variant === "compact";

  return (
    <form onSubmit={onSubmit} className="space-y-2" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          aria-label={t("emailPlaceholder")}
          autoComplete="email"
          className={`flex h-10 flex-1 rounded-md border border-white/10 bg-cosmos-dark/40 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-500 backdrop-blur-sm focus-visible:border-nebula-cyan/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/30`}
        />
        <button
          type="submit"
          disabled={status.state === "sending" || !email}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-nebula-cyan/40 bg-nebula-cyan/10 px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-nebula-cyan transition-all hover:bg-nebula-cyan/15 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status.state === "sending" ? t("submitting") : t("submit")}
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* honeypot */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label>
          Site web
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      {status.state === "error" && (
        <div className={`flex items-start gap-2 ${compact ? "text-[11px]" : "text-sm"} text-rose-300`}>
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>
            {t("errorPrefix")} {status.msg}
          </span>
        </div>
      )}
    </form>
  );
}

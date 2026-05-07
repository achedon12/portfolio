"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useInstallPrompt } from "@/components/install/InstallPromptProvider";

const DISMISS_KEY = "ld:install-dismissed-at";
const DISMISS_TTL_DAYS = 14;
const SHOW_AFTER_MS = 60_000;
const MIN_VISIT_COUNT = 2;

function isRecentlyDismissed(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number.parseInt(raw, 10);
    if (!Number.isFinite(ts)) return false;
    const ageMs = Date.now() - ts;
    return ageMs < DISMISS_TTL_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function FloatingInstallCard() {
  const t = useTranslations("Install");
  const { installable, installed, visitCount, promptInstall } = useInstallPrompt();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (installed || !installable) {
      setVisible(false);
      return;
    }
    if (visitCount < MIN_VISIT_COUNT) return;
    if (typeof window !== "undefined" && isRecentlyDismissed()) return;

    const timer = window.setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [installable, installed, visitCount]);

  if (!visible) return null;

  const dismiss = () => {
    setClosing(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    window.setTimeout(() => setVisible(false), 220);
  };

  const accept = async () => {
    const outcome = await promptInstall();
    if (outcome === "accepted" || outcome === "dismissed") {
      dismiss();
    }
  };

  return (
    <div
      role="dialog"
      aria-labelledby="install-card-title"
      aria-describedby="install-card-desc"
      className={`fixed bottom-6 right-6 z-50 w-[min(360px,calc(100vw-3rem))] transition-all duration-200 ${
        closing ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="relative overflow-hidden rounded-xl border border-nebula-cyan/30 bg-cosmos-deep/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-md">
        <div
          aria-hidden
          className="absolute -inset-px rounded-xl bg-gradient-to-br from-nebula-cyan/20 via-transparent to-transparent opacity-60"
        />
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("dismiss")}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-nebula-cyan/80">
          {t("kicker")}
        </p>
        <h3
          id="install-card-title"
          className="mt-2 font-display text-base font-semibold text-slate-100"
        >
          {t("cardTitle")}
        </h3>
        <p id="install-card-desc" className="mt-2 text-sm leading-relaxed text-slate-400">
          {t("cardDescription")}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={accept}
            className="inline-flex items-center gap-2 rounded-md border border-nebula-cyan/40 bg-nebula-cyan/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-nebula-cyan transition-all hover:bg-nebula-cyan/15 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
          >
            <Download className="h-3.5 w-3.5" />
            {t("install")}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
          >
            {t("later")}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useInstallPrompt } from "@/components/install/InstallPromptProvider";

export function FooterInstallButton() {
  const t = useTranslations("Install");
  const { installable, installed, promptInstall } = useInstallPrompt();

  if (installed || !installable) return null;

  return (
    <button
      type="button"
      onClick={() => {
        void promptInstall();
      }}
      className="group inline-flex items-center gap-2 self-start rounded-full border border-nebula-cyan/30 bg-nebula-cyan/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-nebula-cyan/90 transition-all hover:border-nebula-cyan/60 hover:bg-nebula-cyan/10 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
      aria-label={t("footerLabel")}
    >
      <Download className="h-3 w-3 transition-transform group-hover:-translate-y-0.5" />
      {t("footerLabel")}
    </button>
  );
}

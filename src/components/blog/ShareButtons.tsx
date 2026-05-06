"use client";

import { useState } from "react";
import { Check, Copy, Linkedin, Twitter } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface Props {
  url: string;
  title: string;
}

const BTN_CLS =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-nebula-cyan/40 hover:text-nebula-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60";

interface BtnProps {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

function ShareLink({ href, label, icon, className }: BtnProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(BTN_CLS, className)}
    >
      {icon}
    </a>
  );
}

function ShareButton({ onClick, label, icon, className }: BtnProps) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cn(BTN_CLS, className)}>
      {icon}
    </button>
  );
}

export function ShareButtons({ url, title }: Props) {
  const t = useTranslations("BlogPost");
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard API may be unavailable (http context) — silent */
    }
  };

  const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
        {t("share")}
      </span>
      <ShareLink href={tw} label={t("shareLabels.twitter")} icon={<Twitter className="h-4 w-4" />} />
      <ShareLink href={li} label={t("shareLabels.linkedin")} icon={<Linkedin className="h-4 w-4" />} />
      <ShareButton
        label={copied ? t("shareLabels.copied") : t("shareLabels.copy")}
        onClick={onCopy}
        icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      />
    </div>
  );
}

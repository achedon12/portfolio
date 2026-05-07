"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations("Nav");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { href: "/#about", label: t("about") },
    { href: "/#skills", label: t("skills") },
    { href: "/projects", label: t("projects") },
    { href: "/blog", label: t("blog") },
    { href: "/#experience", label: t("experience") },
    { href: "/#contact", label: t("contact") },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-cosmos-deep/70 backdrop-blur-md border-b border-white/5"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-base font-semibold tracking-tight"
        >
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-nebula-cyan/40 bg-nebula-cyan/10 text-[10px] font-mono text-nebula-cyan transition-all group-hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]">
            LD
          </span>
          <span className="hidden sm:inline">leoderoin</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-mono text-slate-300 transition-colors hover:text-nebula-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

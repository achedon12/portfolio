"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavItem {
  href: string;
  label: string;
}

function pathFromHref(href: string): string {
  const [path] = href.split("#");
  return path || "/";
}

function isActive(href: string, pathname: string): boolean {
  if (href.startsWith("#")) return false;
  if (href.startsWith("/#")) return false;

  const target = pathFromHref(href);
  if (target === "/") return pathname === "/";
  if (pathname === target) return true;
  return pathname.startsWith(target + "/");
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations("Nav");
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const primary: NavItem[] = [
    { href: "/projects", label: t("projects") },
    { href: "/blog", label: t("blog") },
    { href: "/#contact", label: t("contact") },
  ];

  const explore: NavItem[] = [
    { href: "/lab", label: t("lab") },
    { href: "/now", label: t("now") },
    { href: "/uses", label: t("uses") },
    { href: "/newsletter", label: t("newsletter") },
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
          {primary.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-md px-3 py-2 text-sm font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60",
                    active
                      ? "text-nebula-cyan bg-nebula-cyan/10 after:absolute after:bottom-1 after:left-3 after:right-3 after:h-px after:bg-nebula-cyan/60"
                      : "text-slate-300 hover:text-nebula-cyan",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <ExploreMenu
              items={explore}
              pathname={pathname}
              label={t("explore")}
              ariaLabel={t("exploreAria")}
            />
          </li>
        </ul>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

function ExploreMenu({
  items,
  pathname,
  label,
  ariaLabel,
}: {
  items: NavItem[];
  pathname: string;
  label: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();
  const hasActiveChild = items.some((it) => isActive(it.href, pathname));

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60",
          open || hasActiveChild
            ? "text-nebula-cyan"
            : "text-slate-300 hover:text-nebula-cyan",
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open ? "rotate-180" : "rotate-0",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          id={menuId}
          role="menu"
          className="absolute right-0 top-full mt-2 min-w-[12rem] rounded-md border border-white/10 bg-cosmos-deep/95 p-1 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-md"
        >
          {items.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <li key={item.href} role="none">
                <Link
                  role="menuitem"
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded-sm px-3 py-2 text-sm font-mono transition-colors focus-visible:outline-none focus-visible:bg-nebula-cyan/10",
                    active
                      ? "text-nebula-cyan bg-nebula-cyan/10"
                      : "text-slate-300 hover:bg-white/5 hover:text-nebula-cyan",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

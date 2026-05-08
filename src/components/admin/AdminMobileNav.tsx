"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Newspaper,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/admin/SignOutButton";

interface AdminMobileNavProps {
  email?: string | null;
}

const ITEMS = [
  { href: "/admin", label: "Vue d'ensemble", Icon: LayoutDashboard },
  { href: "/admin/messages", label: "Messages", Icon: Mail },
  { href: "/admin/projects", label: "Projets", Icon: FolderKanban },
  { href: "/admin/blog", label: "Blog", Icon: Newspaper },
  { href: "/admin/blog/comments", label: "Commentaires", Icon: MessageSquare },
  { href: "/admin/newsletter", label: "Newsletter", Icon: Send },
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
] as const;

function isActive(href: string, pathname: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminMobileNav({ email }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-cosmos-dark/90 px-4 backdrop-blur-md md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-nebula-cyan/40 bg-nebula-cyan/10 font-mono text-[10px] text-nebula-cyan">
            LD
          </span>
          <span className="font-display text-sm font-semibold">Cockpit</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu admin" : "Ouvrir le menu admin"}
          aria-expanded={open}
          aria-controls="admin-mobile-drawer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-200 transition-colors hover:text-nebula-cyan hover:border-nebula-cyan/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
        >
          {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
        </button>
      </header>

      <div
        id="admin-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 top-14 z-30 transition-opacity duration-200 md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-cosmos-deep/80 backdrop-blur-md"
        />
        <aside
          className={cn(
            "relative flex h-full w-72 max-w-[85vw] flex-col gap-1 border-r border-white/10 bg-cosmos-dark/95 p-4 transition-transform duration-200",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
            {ITEMS.map(({ href, label, Icon }) => {
              const active = isActive(href, pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-nebula-cyan/10 text-nebula-cyan"
                      : "text-slate-300 hover:bg-white/5 hover:text-nebula-cyan",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 pt-3">
            <p className="px-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Connecté
            </p>
            {email && <p className="px-3 text-xs text-slate-400">{email}</p>}
            <SignOutButton className="mt-2 inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-rose-300">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </SignOutButton>
          </div>
        </aside>
      </div>
    </>
  );
}

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { LogOut, Mail, FolderKanban, LayoutDashboard, Newspaper, BarChart3, MessageSquare } from "lucide-react";
import "../globals.css";
import { getAdminSession } from "@/lib/auth";
import { SignOutButton } from "@/components/admin/SignOutButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#030014",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "Cockpit — Léo Deroin",
  description: "Console d'administration privée.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  return (
    <html
      lang="fr"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-cosmos-deep text-slate-200 antialiased font-sans">
        <div className="min-h-screen bg-cosmos-deep">
          {session && (
            <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-white/10 bg-cosmos-dark/60 p-4 md:flex">
              <Link href="/admin" className="mb-8 flex items-center gap-2 px-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-nebula-cyan/40 bg-nebula-cyan/10 font-mono text-[10px] text-nebula-cyan">
                  LD
                </span>
                <span className="font-display text-sm font-semibold">Cockpit</span>
              </Link>
              <nav className="flex flex-1 flex-col gap-1">
                <NavItem href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
                  Vue d&apos;ensemble
                </NavItem>
                <NavItem href="/admin/messages" icon={<Mail className="h-4 w-4" />}>
                  Messages
                </NavItem>
                <NavItem href="/admin/projects" icon={<FolderKanban className="h-4 w-4" />}>
                  Projets
                </NavItem>
                <NavItem href="/admin/blog" icon={<Newspaper className="h-4 w-4" />}>
                  Blog
                </NavItem>
                <NavItem
                  href="/admin/blog/comments"
                  icon={<MessageSquare className="h-4 w-4" />}
                >
                  Commentaires
                </NavItem>
                <NavItem href="/admin/analytics" icon={<BarChart3 className="h-4 w-4" />}>
                  Analytics
                </NavItem>
              </nav>
              <div className="border-t border-white/10 pt-3">
                <p className="px-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Connecté
                </p>
                <p className="px-3 text-xs text-slate-400">{session.user?.email}</p>
                <SignOutButton className="mt-2 inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-rose-300">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </SignOutButton>
              </div>
            </aside>
          )}
          <main className={session ? "md:ml-60" : ""}>{children}</main>
        </div>
      </body>
    </html>
  );
}

function NavItem({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-nebula-cyan"
    >
      {icon}
      {children}
    </Link>
  );
}

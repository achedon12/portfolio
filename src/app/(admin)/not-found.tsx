import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "404 — Cockpit",
  robots: { index: false, follow: false },
};

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[80svh] items-center justify-center px-8">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-nebula-cyan">
          ◊ 404
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold">Route admin introuvable</h1>
        <p className="mt-3 text-slate-400">
          Cette URL ne correspond à aucune section du cockpit.
        </p>
        <Link href="/admin" className="mt-6 inline-block">
          <Button>
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </Link>
      </div>
    </div>
  );
}

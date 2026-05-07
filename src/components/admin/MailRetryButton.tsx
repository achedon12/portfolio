"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

type Status = "idle" | "sending" | "ok" | "error";

export function MailRetryButton({ id }: { id: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>("idle");

  async function onClick() {
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/admin/newsletter/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("ok");
      startTransition(() => router.refresh());
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
        <CheckCircle2 className="h-3 w-3" />
        Renvoyé
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-rose-300">
        <AlertTriangle className="h-3 w-3" />
        Échec retry
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status === "sending"}
      className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-200 transition-colors hover:bg-amber-500/15 disabled:opacity-50"
    >
      <RefreshCw className={`h-3 w-3 ${status === "sending" ? "animate-spin" : ""}`} />
      Retry
    </button>
  );
}

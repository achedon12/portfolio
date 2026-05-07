"use client";

import { useState } from "react";
import { Send, AlertTriangle, CheckCircle2, Eye } from "lucide-react";

interface NewsletterBroadcastFormProps {
  /** Nombre d'abonnés CONFIRMED — affiché sur le bouton. */
  recipients: number;
}

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "success"; queued: number }
  | { state: "error"; msg: string };

export function NewsletterBroadcastForm({ recipients }: NewsletterBroadcastFormProps) {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState(
    "<p>Hello,</p>\n<p>Quick note from the station — </p>\n<p>—\nLéo</p>",
  );
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status.state === "sending") return;
    if (recipients === 0) {
      setStatus({ state: "error", msg: "Aucun abonné confirmé pour le moment." });
      return;
    }
    if (!confirm(`Envoyer la newsletter à ${recipients} abonnés ?`)) return;

    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/admin/newsletter/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      const json = (await res.json()) as { queued: number };
      setStatus({ state: "success", queued: json.queued });
      setSubject("");
    } catch (err) {
      setStatus({ state: "error", msg: err instanceof Error ? err.message : "Erreur" });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="newsletter-subject"
          className="block font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400"
        >
          Sujet
        </label>
        <input
          id="newsletter-subject"
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          className="mt-1.5 flex h-10 w-full rounded-md border border-white/10 bg-cosmos-dark/40 px-3 py-2 font-mono text-sm text-slate-100 backdrop-blur-sm focus-visible:border-nebula-cyan/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/30"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="newsletter-html"
            className="block font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400"
          >
            Corps HTML — utilise{" "}
            <code className="text-nebula-cyan">{`{{UNSUBSCRIBE_LINK}}`}</code> pour insérer le
            lien désinscription si besoin
          </label>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-nebula-cyan/80 hover:text-nebula-cyan"
          >
            <Eye className="h-3 w-3" />
            {showPreview ? "Masquer preview" : "Preview"}
          </button>
        </div>
        <textarea
          id="newsletter-html"
          required
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={14}
          maxLength={100000}
          spellCheck={false}
          className="mt-1.5 flex w-full rounded-md border border-white/10 bg-cosmos-dark/40 px-3 py-2 font-mono text-xs text-slate-100 backdrop-blur-sm focus-visible:border-nebula-cyan/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/30"
        />
      </div>

      {showPreview && (
        <div className="rounded-md border border-white/10 bg-white/95 p-4 text-slate-900">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Preview (rendu sur fond clair pour lisibilité)
          </p>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}

      {status.state === "error" && (
        <div className="flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{status.msg}</span>
        </div>
      )}
      {status.state === "success" && (
        <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {status.queued} mails enfilés dans la queue (envoi par batch de 50 toutes les 5 min
            via cron, en prod uniquement).
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={status.state === "sending" || !subject || !html}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-nebula-cyan/40 bg-nebula-cyan/10 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-nebula-cyan transition-all hover:bg-nebula-cyan/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" />
        {status.state === "sending"
          ? "Envoi…"
          : `Envoyer à ${recipients} abonnés confirmés`}
      </button>
    </form>
  );
}

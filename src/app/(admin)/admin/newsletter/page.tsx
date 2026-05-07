import { Send, Users, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsletterBroadcastForm } from "@/components/admin/NewsletterBroadcastForm";
import { MailRetryButton } from "@/components/admin/MailRetryButton";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const [confirmed, pending, unsubscribed, recent, queueStats, failedMails] = await Promise.all([
    prisma.newsletterSubscriber.count({ where: { status: "CONFIRMED" } }),
    prisma.newsletterSubscriber.count({ where: { status: "PENDING" } }),
    prisma.newsletterSubscriber.count({ where: { status: "UNSUBSCRIBED" } }),
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        email: true,
        status: true,
        locale: true,
        createdAt: true,
        confirmedAt: true,
      },
    }),
    prisma.pendingMail.groupBy({
      by: ["status"],
      _count: true,
      where: { category: { startsWith: "newsletter_" } },
    }),
    prisma.pendingMail.findMany({
      where: { status: "FAILED", category: { startsWith: "newsletter_" } },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        toAddress: true,
        subject: true,
        category: true,
        attempts: true,
        lastError: true,
        updatedAt: true,
      },
    }),
  ]);

  const queueByStatus: Record<string, number> = {};
  for (const row of queueStats) {
    queueByStatus[row.status] = row._count;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pt-12 pb-20">
      <header className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-nebula-cyan">
          ◊ Newsletter
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Diffusion</h1>
        <p className="mt-2 text-sm text-slate-400">
          Liste des abonnés et formulaire de broadcast. Les emails partent par batch de 50
          toutes les 5 min via le cron interne (prod uniquement).
        </p>
      </header>

      <div className="mb-10 grid gap-4 md:grid-cols-3">
        <StatCard label="Confirmés" value={confirmed} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="En attente confirm" value={pending} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Désinscrits" value={unsubscribed} icon={<XCircle className="h-4 w-4" />} />
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            File mail-queue (categories newsletter_*)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <QueueCell status="PENDING" count={queueByStatus.PENDING ?? 0} />
            <QueueCell status="SENDING" count={queueByStatus.SENDING ?? 0} />
            <QueueCell status="SENT" count={queueByStatus.SENT ?? 0} />
            <QueueCell status="FAILED" count={queueByStatus.FAILED ?? 0} />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Composer un broadcast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NewsletterBroadcastForm recipients={confirmed} />
        </CardContent>
      </Card>

      {failedMails.length > 0 && (
        <Card className="mb-10 border-rose-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-200">
              <AlertTriangle className="h-4 w-4" />
              Mails FAILED ({failedMails.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-xs text-slate-400">
              Mails qui ont épuisé leurs tentatives. Le bouton retry remet à PENDING avec
              attempts=0 — la queue les retentera au prochain cron.
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="pb-2">Destinataire</th>
                  <th className="pb-2">Catégorie</th>
                  <th className="pb-2">Erreur</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {failedMails.map((m) => (
                  <tr key={m.id} className="border-b border-white/5 last:border-0 align-top">
                    <td className="py-2 font-mono text-xs text-slate-200">
                      <div>{m.toAddress}</div>
                      <div className="text-[10px] text-slate-500">{m.subject}</div>
                    </td>
                    <td className="py-2 font-mono text-[10px] uppercase text-slate-500">
                      {m.category.replace(/^newsletter_/, "")}
                    </td>
                    <td className="py-2 font-mono text-[10px] text-rose-300/90 max-w-md break-words">
                      {m.lastError ?? "—"}
                    </td>
                    <td className="py-2 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(m.updatedAt).toLocaleString("fr-FR", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2">
                      <MailRetryButton id={m.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>20 derniers abonnés</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="font-mono text-xs text-slate-500">Aucun abonné pour le moment.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Statut</th>
                  <th className="pb-2">Locale</th>
                  <th className="pb-2">Inscrit</th>
                </tr>
              </thead>
              <tbody>
                {(recent as Array<{
                  id: number;
                  email: string;
                  status: string;
                  locale: string;
                  createdAt: Date;
                  confirmedAt: Date | null;
                }>).map((sub) => (
                  <tr key={sub.id} className="border-b border-white/5 last:border-0">
                    <td className="py-2 font-mono text-xs text-slate-200">{sub.email}</td>
                    <td className="py-2">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="py-2 font-mono text-xs uppercase text-slate-500">
                      {sub.locale}
                    </td>
                    <td className="py-2 font-mono text-[10px] text-slate-500">
                      {new Date(sub.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
          {icon}
          {label}
        </p>
        <p className="mt-2 font-display text-3xl font-bold text-slate-100">{value}</p>
      </CardContent>
    </Card>
  );
}

function QueueCell({ status, count }: { status: string; count: number }) {
  const colors: Record<string, string> = {
    PENDING: "text-amber-300",
    SENDING: "text-nebula-cyan",
    SENT: "text-emerald-300",
    FAILED: "text-rose-300",
  };
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">{status}</p>
      <p className={`mt-1 font-display text-xl font-bold ${colors[status] ?? "text-slate-100"}`}>
        {count}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    CONFIRMED: { label: "Confirmé", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" },
    PENDING: { label: "En attente", cls: "border-amber-500/40 bg-amber-500/10 text-amber-200" },
    UNSUBSCRIBED: { label: "Désinscrit", cls: "border-rose-500/40 bg-rose-500/10 text-rose-200" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "border-white/20 bg-white/5 text-slate-300" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

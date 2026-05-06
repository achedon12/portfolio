import { revalidatePath } from "next/cache";
import { CheckCircle2, MailOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function markAsRead(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

async function deleteMessage(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="px-8 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
            ◊ Inbox
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Messages reçus</h1>
        </div>
        <p className="font-mono text-xs text-slate-500">{messages.length} au total</p>
      </header>

      <div className="space-y-3">
        {messages.length === 0 && (
          <p className="rounded-md border border-white/10 bg-cosmos-dark/40 p-6 text-center font-mono text-sm text-slate-500">
            Aucun message.
          </p>
        )}
        {messages.map((m) => (
          <article
            key={m.id}
            className="rounded-lg border border-white/10 bg-cosmos-dark/40 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-base font-semibold text-slate-100">{m.name}</p>
                  <a
                    href={`mailto:${m.email}`}
                    className="font-mono text-xs text-nebula-cyan hover:underline"
                  >
                    {m.email}
                  </a>
                  <Badge variant={m.isRead ? "default" : "cyan"}>
                    {m.isRead ? "lu" : "nouveau"}
                  </Badge>
                  <Badge variant="violet">{m.subject}</Badge>
                </div>
                <p className="mt-1 font-mono text-[10px] text-slate-500">
                  {m.createdAt.toLocaleString("fr-FR")} — IP {m.ipAddress ?? "?"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {!m.isRead && (
                  <form action={markAsRead}>
                    <input type="hidden" name="id" value={m.id} />
                    <Button type="submit" variant="outline" size="sm">
                      <MailOpen className="h-3 w-3" />
                      Marquer lu
                    </Button>
                  </form>
                )}
                <form action={deleteMessage}>
                  <input type="hidden" name="id" value={m.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    Supprimer
                  </Button>
                </form>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-slate-300">{m.message}</p>
          </article>
        ))}
      </div>

      {messages.length > 0 && (
        <p className="mt-8 flex items-center gap-2 font-mono text-xs text-slate-500">
          <CheckCircle2 className="h-3 w-3" /> Fin de la file
        </p>
      )}
    </div>
  );
}

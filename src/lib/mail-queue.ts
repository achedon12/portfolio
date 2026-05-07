import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

/**
 * File de mails sortants. Patrón inspiré de callCenterRate :
 * 50 mails toutes les 5 min via cron, claim atomique, retry jusqu'à 5 tentatives,
 * puis FAILED définitif (admin peut retry manuel).
 */

const BATCH_SIZE = 50;
const MAX_ATTEMPTS = 5;

export interface EnqueueMailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Tag affiché dans l'admin pour filtrer (ex. "newsletter_confirm"). */
  category: string;
  /** Date avant laquelle le mail ne sera pas envoyé. Par défaut = maintenant. */
  scheduledAt?: Date;
}

export async function enqueueMail(input: EnqueueMailInput): Promise<{ id: string }> {
  const created = await prisma.pendingMail.create({
    data: {
      toAddress: input.to,
      subject: input.subject,
      html: input.html,
      textBody: input.text ?? null,
      category: input.category,
      scheduledAt: input.scheduledAt ?? new Date(),
    },
    select: { id: true },
  });
  return created;
}

export interface ProcessSummary {
  processed: number;
  sent: number;
  failed: number;
  retryable: number;
}

export async function processPendingMails(now: Date = new Date()): Promise<ProcessSummary> {
  const summary: ProcessSummary = { processed: 0, sent: 0, failed: 0, retryable: 0 };

  const candidates = await prisma.pendingMail.findMany({
    where: {
      status: "PENDING",
      scheduledAt: { lte: now },
      attempts: { lt: MAX_ATTEMPTS },
    },
    orderBy: { scheduledAt: "asc" },
    take: BATCH_SIZE,
    select: { id: true },
  });

  for (const { id } of candidates) {
    // Claim atomique : seul le 1er passage à SENDING gagne. Évite les
    // doublons si deux workers tournent en parallèle.
    const claim = await prisma.pendingMail.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "SENDING", attempts: { increment: 1 } },
    });
    if (claim.count === 0) continue;

    summary.processed += 1;

    const mail = await prisma.pendingMail.findUnique({
      where: { id },
      select: { toAddress: true, subject: true, html: true, attempts: true },
    });
    if (!mail) continue;

    try {
      await sendEmail({
        to: mail.toAddress,
        subject: mail.subject,
        html: mail.html,
      });
      await prisma.pendingMail.update({
        where: { id },
        data: { status: "SENT", sentAt: new Date(), lastError: null },
      });
      summary.sent += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const exhausted = mail.attempts >= MAX_ATTEMPTS;
      await prisma.pendingMail.update({
        where: { id },
        data: {
          status: exhausted ? "FAILED" : "PENDING",
          lastError: message.slice(0, 1000),
        },
      });
      if (exhausted) summary.failed += 1;
      else summary.retryable += 1;
      console.error("[mail-queue] send failed", { id, attempts: mail.attempts, err: message });
    }
  }

  return summary;
}

/** Remet un mail FAILED ou bloqué en PENDING avec attempts reset. */
export async function retryMail(id: string): Promise<void> {
  await prisma.pendingMail.update({
    where: { id },
    data: { status: "PENDING", attempts: 0, lastError: null, scheduledAt: new Date() },
  });
}

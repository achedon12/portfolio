"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { blogCommentSchema, type BlogCommentInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "pending" }
  | { state: "error"; msg: string };

interface Props {
  slug: string;
  onSubmitted?: () => void;
}

const ERROR_CODES = [
  "pseudoTooShort",
  "pseudoTooLong",
  "messageTooShort",
  "messageTooLong",
  "emailInvalid",
] as const;
type ErrorCode = (typeof ERROR_CODES)[number];

export function CommentForm({ slug, onSubmitted }: Props) {
  const t = useTranslations("Comments");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<BlogCommentInput>({
    resolver: zodResolver(blogCommentSchema),
    mode: "onTouched",
    defaultValues: { website: "" },
  });

  const errorLabel = (code?: string) => {
    if (!code) return undefined;
    if ((ERROR_CODES as readonly string[]).includes(code)) {
      return t(`errors.${code as ErrorCode}`);
    }
    return code;
  };

  const onSubmit = async (data: BlogCommentInput) => {
    setStatus({ state: "sending" });
    try {
      const res = await fetch(`/api/blog/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as {
          code?: string;
          message?: string;
        };
        if (json.code === "rateLimited") {
          throw new Error(t("errors.rateLimited"));
        }
        if (json.code === "commentsDisabled") {
          throw new Error(t("disabled"));
        }
        throw new Error(json.message ?? `HTTP ${res.status}`);
      }
      setStatus({ state: "pending" });
      reset();
      onSubmitted?.();
    } catch (e) {
      setStatus({
        state: "error",
        msg: e instanceof Error ? e.message : t("errors.unknown"),
      });
    }
  };

  return (
    <AnimatePresence mode="wait">
      {status.state === "pending" ? (
        <motion.div
          key="pending"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <p className="font-display text-sm font-semibold text-emerald-200">
              {t("pendingTitle")}
            </p>
            <p className="mt-1 text-sm text-emerald-100/80">{t("pendingDescription")}</p>
            <button
              type="button"
              onClick={() => setStatus({ state: "idle" })}
              className="mt-3 font-mono text-[10px] uppercase tracking-wider text-emerald-300 underline"
            >
              {t("anotherComment")}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 rounded-lg border border-white/10 bg-cosmos-dark/40 p-5 backdrop-blur-md"
          noValidate
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-nebula-cyan">
            {t("formTitle")}
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="comment-pseudo">{t("labels.pseudo")}</Label>
              <Input
                id="comment-pseudo"
                autoComplete="nickname"
                {...register("pseudo")}
                aria-invalid={!!errors.pseudo}
              />
              {errors.pseudo && (
                <p className="font-mono text-[10px] text-rose-400">
                  {errorLabel(errors.pseudo.message)}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="comment-email">{t("labels.emailOptional")}</Label>
              <Input
                id="comment-email"
                type="email"
                autoComplete="email"
                {...register("email")}
                aria-invalid={!!errors.email}
                placeholder={t("emailPlaceholder")}
              />
              {errors.email && (
                <p className="font-mono text-[10px] text-rose-400">
                  {errorLabel(errors.email.message)}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="comment-message">{t("labels.message")}</Label>
            <Textarea
              id="comment-message"
              rows={4}
              {...register("message")}
              aria-invalid={!!errors.message}
            />
            {errors.message && (
              <p className="font-mono text-[10px] text-rose-400">
                {errorLabel(errors.message.message)}
              </p>
            )}
          </div>

          <div className="absolute left-[-9999px]" aria-hidden>
            <label>
              Site web (laisser vide)
              <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
            </label>
          </div>

          {status.state === "error" && (
            <div className="flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{status.msg}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] text-slate-500">{t("moderationNotice")}</p>
            <Button type="submit" disabled={status.state === "sending" || !isValid} size="sm">
              {status.state === "sending" ? t("submitting") : t("submit")}
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

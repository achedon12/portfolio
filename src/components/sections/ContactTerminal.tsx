"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Send, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { contactSchema, contactSubjects, type ContactInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Status = { state: "idle" } | { state: "sending" } | { state: "success" } | { state: "error"; msg: string };

export function ContactTerminal() {
  const t = useTranslations("Contact");
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: { website: "" },
  });

  /** Map a Zod code (or fallback string) to its translated message. */
  const errorLabel = (code?: string) => {
    if (!code) return undefined;
    const knownCodes = [
      "nameTooShort",
      "nameTooLong",
      "emailInvalid",
      "subjectInvalid",
      "messageTooShort",
      "messageTooLong",
    ] as const;
    if ((knownCodes as readonly string[]).includes(code)) {
      return t(`errors.${code}` as `errors.${(typeof knownCodes)[number]}`);
    }
    return code;
  };

  const onSubmit = async (data: ContactInput) => {
    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
        const localized =
          json.code && json.code in { rateLimited: 1 } ? t("errors.rateLimited") : json.message;
        throw new Error(localized ?? `HTTP ${res.status}`);
      }
      setStatus({ state: "success" });
      reset();
    } catch (e) {
      setStatus({ state: "error", msg: e instanceof Error ? e.message : t("errorPrefix") });
    }
  };

  return (
    <section id="contact" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
            {t("kicker")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-slate-400">{t("intro")}</p>
        </motion.div>

        <div className="rounded-xl border border-white/10 bg-cosmos-dark/60 p-1 backdrop-blur-md">
          <div className="flex items-center justify-between rounded-t-lg border-b border-white/5 px-4 py-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              comms@leoderoin:~$ transmit
            </span>
          </div>

          <AnimatePresence mode="wait">
            {status.state === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center"
              >
                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                <p className="font-display text-xl font-semibold text-slate-100">
                  {t("successTitle")}
                </p>
                <p className="text-sm text-slate-400">{t("successDescription")}</p>
                <Button variant="outline" onClick={() => setStatus({ state: "idle" })}>
                  {t("another")}
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-5 p-6"
                noValidate
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">{t("labels.name")}</Label>
                    <Input id="name" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
                    {errors.name && (
                      <p className="font-mono text-[10px] text-rose-400">
                        {errorLabel(errors.name.message)}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t("labels.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register("email")}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p className="font-mono text-[10px] text-rose-400">
                        {errorLabel(errors.email.message)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subject">{t("labels.subject")}</Label>
                  <select
                    id="subject"
                    {...register("subject")}
                    className="flex h-10 w-full rounded-md border border-white/10 bg-cosmos-dark/40 px-3 py-2 font-mono text-sm text-slate-100 backdrop-blur-sm focus-visible:border-nebula-cyan/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/30"
                  >
                    <option value="">{t("selectSubject")}</option>
                    {contactSubjects.map((s) => (
                      <option key={s} value={s} className="bg-cosmos-dark">
                        {t(`subjects.${s}`)}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p className="font-mono text-[10px] text-rose-400">
                      {errorLabel(errors.subject.message)}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="message">{t("labels.message")}</Label>
                  <Textarea id="message" rows={6} {...register("message")} aria-invalid={!!errors.message} />
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
                    <span>
                      {t("errorPrefix")} {status.msg}
                    </span>
                  </div>
                )}

                <Button type="submit" disabled={status.state === "sending" || !isValid}>
                  {status.state === "sending" ? t("submitting") : t("submit")}
                  <Send className="h-4 w-4" />
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

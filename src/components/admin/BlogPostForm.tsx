"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { blogPostSchema, type BlogPostInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  initial?: Partial<BlogPostInput> & { id?: number };
  mode: "create" | "edit";
}

type FormShape = Omit<BlogPostInput, "tags"> & {
  tags: string;
};

export function BlogPostForm({ initial, mode }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [seoOpen, setSeoOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormShape>({
    defaultValues: {
      slug: initial?.slug ?? "",
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      content: initial?.content ?? "",
      coverImage: initial?.coverImage ?? "",
      tags: Array.isArray(initial?.tags) ? initial.tags.join(", ") : "",
      metaTitle: initial?.metaTitle ?? "",
      metaDescription: initial?.metaDescription ?? "",
      metaKeywords: initial?.metaKeywords ?? "",
      ogImage: initial?.ogImage ?? "",
      canonicalUrl: initial?.canonicalUrl ?? "",
      noIndex: initial?.noIndex ?? false,
      published: initial?.published ?? false,
      publishedAt:
        typeof initial?.publishedAt === "string"
          ? initial.publishedAt.slice(0, 16) // input datetime-local format YYYY-MM-DDTHH:mm
          : "",
    },
  });

  const onSubmit = async (raw: FormShape) => {
    setError(null);
    const payload = {
      ...raw,
      tags: raw.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      publishedAt: raw.publishedAt
        ? new Date(raw.publishedAt).toISOString()
        : null,
    };
    const parsed = blogPostSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Validation échouée");
      return;
    }
    const url = mode === "create" ? "/api/admin/blog" : `/api/admin/blog/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { message?: string };
      setError(j.message ?? `HTTP ${res.status}`);
      return;
    }
    router.push("/admin/blog");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-4xl gap-5" noValidate>
      <Field label="Slug">
        <Input {...register("slug")} placeholder="mon-article" />
        {errors.slug && <Hint>{errors.slug.message}</Hint>}
      </Field>

      <Field label="Titre">
        <Input {...register("title")} />
        {errors.title && <Hint>{errors.title.message}</Hint>}
      </Field>

      <Field label="Description courte (utilisée comme meta description par défaut)">
        <Textarea rows={2} {...register("description")} />
        {errors.description && <Hint>{errors.description.message}</Hint>}
      </Field>

      <Field label="Contenu (MDX)">
        <Textarea rows={20} className="font-mono text-xs" {...register("content")} />
        {errors.content && <Hint>{errors.content.message}</Hint>}
        <p className="font-mono text-[10px] text-slate-500">
          MDX : Markdown + composants React. Headings ## et ### apparaissent dans le sommaire.
        </p>
      </Field>

      <Field label="Cover image (URL ou /chemin)">
        <Input {...register("coverImage")} placeholder="/blog/mon-article.jpg" />
      </Field>

      <Field label="Tags (séparés par des virgules)">
        <Input {...register("tags")} placeholder="next.js, three.js, perf" />
      </Field>

      <button
        type="button"
        onClick={() => setSeoOpen((s) => !s)}
        className="mt-2 inline-flex items-center gap-2 self-start rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs uppercase tracking-wider text-slate-300 transition-colors hover:border-nebula-cyan/40 hover:text-nebula-cyan"
      >
        <ChevronDown className={cn("h-3 w-3 transition-transform", seoOpen && "rotate-180")} />
        SEO &amp; indexation
      </button>

      {seoOpen && (
        <div className="grid gap-5 rounded-lg border border-white/10 bg-cosmos-dark/40 p-5">
          <Field label="Meta title (override le <title>)">
            <Input {...register("metaTitle")} placeholder="(par défaut : titre de l'article)" />
            <p className="font-mono text-[10px] text-slate-500">Recommandé : 50-60 caractères.</p>
          </Field>

          <Field label="Meta description (override la description par défaut)">
            <Textarea rows={2} {...register("metaDescription")} />
            <p className="font-mono text-[10px] text-slate-500">Recommandé : 140-160 caractères.</p>
          </Field>

          <Field label="Meta keywords">
            <Input {...register("metaKeywords")} placeholder="next.js, three.js, shaders" />
            <p className="font-mono text-[10px] text-slate-500">
              Faible impact SEO Google mais utile pour d'autres moteurs.
            </p>
          </Field>

          <Field label="OG image (1200×630, override la cover pour les partages)">
            <Input {...register("ogImage")} placeholder="/og/mon-article.jpg" />
          </Field>

          <Field label="Canonical URL (uniquement si l'article est aussi publié ailleurs)">
            <Input type="url" {...register("canonicalUrl")} placeholder="https://..." />
            {errors.canonicalUrl && <Hint>{errors.canonicalUrl.message}</Hint>}
          </Field>

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("noIndex")} className="h-4 w-4 accent-nebula-cyan" />
            <span>
              <span className="font-medium">noindex</span>
              <span className="ml-2 font-mono text-[10px] text-slate-500">
                désindexer cet article (Google + autres)
              </span>
            </span>
          </label>
        </div>
      )}

      <div className="grid gap-5 rounded-lg border border-white/10 bg-cosmos-dark/40 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-nebula-cyan">
          ◊ Publication
        </p>

        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("published")} className="h-4 w-4 accent-nebula-cyan" />
          <span>
            <span className="font-medium">Publié</span>
            <span className="ml-2 font-mono text-[10px] text-slate-500">
              visible sur /blog uniquement si coché ET date de publication ≤ maintenant
            </span>
          </span>
        </label>

        <Field label="Date de publication (peut être future = programmé)">
          <Input type="datetime-local" {...register("publishedAt")} />
          {errors.publishedAt && <Hint>{errors.publishedAt.message}</Hint>}
        </Field>
      </div>

      {error && (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sauvegarde…" : mode === "create" ? "Créer" : "Sauvegarder"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[10px] text-rose-400">{children}</p>;
}

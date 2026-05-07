"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { projectSchema, type ProjectInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  initial?: Partial<ProjectInput> & { id?: number };
  mode: "create" | "edit";
}

type FormShape = Omit<ProjectInput, "techStack" | "gallery"> & {
  techStack: string;
  gallery: string;
};

export function ProjectForm({ initial, mode }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormShape>({
    defaultValues: {
      slug: initial?.slug ?? "",
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      longContent: initial?.longContent ?? "",
      coverImage: initial?.coverImage ?? "",
      gallery: Array.isArray(initial?.gallery) ? initial.gallery.join("\n") : "",
      techStack: Array.isArray(initial?.techStack) ? initial.techStack.join(", ") : "",
      category: initial?.category ?? "",
      liveUrl: initial?.liveUrl ?? "",
      githubUrl: initial?.githubUrl ?? "",
      featured: initial?.featured ?? false,
      published: initial?.published ?? true,
    },
  });

  const onSubmit = async (raw: FormShape) => {
    setError(null);
    const payload = {
      ...raw,
      techStack: raw.techStack.split(",").map((s) => s.trim()).filter(Boolean),
      gallery: raw.gallery
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const parsed = projectSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Validation échouée");
      return;
    }
    const url = mode === "create" ? "/api/admin/projects" : `/api/admin/projects/${initial?.id}`;
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
    router.push("/admin/projects");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 max-w-3xl" noValidate>
      <Field label="Slug">
        <Input {...register("slug")} placeholder="mon-projet-cool" />
        {errors.slug && <Hint>{errors.slug.message}</Hint>}
      </Field>
      <Field label="Titre">
        <Input {...register("title")} />
        {errors.title && <Hint>{errors.title.message}</Hint>}
      </Field>
      <Field label="Description courte">
        <Textarea rows={2} {...register("description")} />
        {errors.description && <Hint>{errors.description.message}</Hint>}
      </Field>
      <Field label="Contenu long (Markdown / texte)">
        <Textarea rows={8} {...register("longContent")} />
      </Field>
      <Field label="Cover image (URL ou /chemin)">
        <Input {...register("coverImage")} />
        {errors.coverImage && <Hint>{errors.coverImage.message}</Hint>}
      </Field>
      <Field label="Galerie (1 URL par ligne)">
        <Textarea rows={4} {...register("gallery")} />
      </Field>
      <Field label="Stack (séparée par des virgules)">
        <Input {...register("techStack")} placeholder="Next.js, Symfony, MySQL" />
        {errors.techStack && <Hint>{errors.techStack.message}</Hint>}
      </Field>
      <Field label="Catégorie">
        <Input {...register("category")} placeholder="freelance / pro / perso" />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Live URL">
          <Input type="url" {...register("liveUrl")} />
        </Field>
        <Field label="GitHub URL">
          <Input type="url" {...register("githubUrl")} />
        </Field>
      </div>
      <div className="grid gap-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("featured")} className="h-4 w-4 accent-nebula-cyan" />
          Mettre en avant (featured)
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            {...register("published")}
            className="h-4 w-4 accent-nebula-cyan"
          />
          Visible sur le site public
          <span className="font-mono text-[10px] text-slate-500">
            (décoche pour brouillon — exclu de /projects, sitemap et llms.txt)
          </span>
        </label>
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

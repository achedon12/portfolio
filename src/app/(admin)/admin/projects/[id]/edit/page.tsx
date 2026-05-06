import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/ProjectForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isFinite(projectId)) notFound();

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  return (
    <div className="px-8 py-10">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
          ◊ Édition
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">{project.title}</h1>
      </header>
      <ProjectForm
        mode="edit"
        initial={{
          id: project.id,
          slug: project.slug,
          title: project.title,
          description: project.description,
          longContent: project.longContent ?? "",
          coverImage: project.coverImage,
          gallery: Array.isArray(project.gallery) ? (project.gallery as string[]) : [],
          techStack: Array.isArray(project.techStack) ? (project.techStack as string[]) : [],
          category: project.category,
          liveUrl: project.liveUrl ?? "",
          githubUrl: project.githubUrl ?? "",
          featured: project.featured,
        }}
      />
    </div>
  );
}

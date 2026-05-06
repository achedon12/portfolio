import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="px-8 py-10">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
          ◊ Nouveau dossier
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Créer une expédition</h1>
      </header>
      <ProjectForm mode="create" />
    </div>
  );
}

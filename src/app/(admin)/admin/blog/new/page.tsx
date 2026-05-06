import { BlogPostForm } from "@/components/admin/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div className="px-8 py-10">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
          ◊ Nouvel article
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Rédiger un article</h1>
      </header>
      <BlogPostForm mode="create" />
    </div>
  );
}

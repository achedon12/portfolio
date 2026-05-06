import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) notFound();

  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post) notFound();

  return (
    <div className="px-8 py-10">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
          ◊ Édition
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">{post.title}</h1>
      </header>
      <BlogPostForm
        mode="edit"
        initial={{
          id: post.id,
          slug: post.slug,
          title: post.title,
          description: post.description,
          content: post.content,
          coverImage: post.coverImage ?? "",
          tags: Array.isArray(post.tags) ? (post.tags as string[]) : [],
          metaTitle: post.metaTitle ?? "",
          metaDescription: post.metaDescription ?? "",
          metaKeywords: post.metaKeywords ?? "",
          ogImage: post.ogImage ?? "",
          canonicalUrl: post.canonicalUrl ?? "",
          noIndex: post.noIndex,
          published: post.published,
          publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
        }}
      />
    </div>
  );
}

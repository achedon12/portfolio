import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: "github-dark-default",
  keepBackground: true,
  defaultLang: "plaintext",
};

export const mdxOptions: MDXRemoteProps["options"] = {
  parseFrontmatter: false, // déjà fait par gray-matter dans src/lib/blog.ts
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: { className: ["heading-anchor"] },
        },
      ],
      [rehypePrettyCode, prettyCodeOptions],
    ],
  },
};

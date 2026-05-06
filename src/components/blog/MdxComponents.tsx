import type { ComponentPropsWithoutRef } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Composants MDX custom : headings reliables, liens en cyan, code stylé.
 * Passé à <MDXRemote components={...} /> dans la page article.
 */
export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1 {...props} className={cn("font-display text-3xl font-bold mt-12 mb-6", props.className)} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 {...props} className={cn("font-display text-2xl font-bold mt-12 mb-4 scroll-mt-28", props.className)} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 {...props} className={cn("font-display text-xl font-semibold mt-8 mb-3 scroll-mt-28", props.className)} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p {...props} className={cn("mb-4 leading-relaxed text-slate-300", props.className)} />
  ),
  a: ({ href, children, ...rest }: ComponentPropsWithoutRef<"a">) => {
    const isExternal = href?.startsWith("http");
    const cls = "text-nebula-cyan underline decoration-nebula-cyan/40 underline-offset-4 hover:decoration-nebula-cyan transition-colors";
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href ?? "#"} className={cls}>
        {children}
      </Link>
    );
  },
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul {...props} className={cn("mb-5 ml-5 list-disc space-y-1.5 text-slate-300 marker:text-nebula-cyan/60", props.className)} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol {...props} className={cn("mb-5 ml-5 list-decimal space-y-1.5 text-slate-300 marker:text-nebula-cyan/60", props.className)} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li {...props} className={cn("leading-relaxed", props.className)} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      {...props}
      className={cn(
        "my-6 border-l-2 border-nebula-cyan/50 bg-cosmos-dark/40 px-5 py-3 italic text-slate-300",
        props.className,
      )}
    />
  ),
  code: ({ className, ...rest }: ComponentPropsWithoutRef<"code">) => {
    if (className) return <code className={className} {...rest} />;
    return (
      <code
        className="rounded-sm border border-white/10 bg-cosmos-dark/60 px-1.5 py-0.5 font-mono text-[0.9em] text-nebula-cyan"
        {...rest}
      />
    );
  },
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      {...props}
      className={cn(
        "my-5 overflow-x-auto rounded-lg border border-white/10 bg-cosmos-dark/80 p-4 text-sm leading-relaxed",
        props.className,
      )}
    />
  ),
  hr: () => <hr className="my-10 border-white/5" />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong {...props} className={cn("font-semibold text-slate-100", props.className)} />
  ),
};

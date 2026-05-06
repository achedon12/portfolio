import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-32 w-full rounded-md border border-white/10 bg-cosmos-dark/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 backdrop-blur-sm",
        "focus-visible:outline-none focus-visible:border-nebula-cyan/60 focus-visible:ring-2 focus-visible:ring-nebula-cyan/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "font-mono leading-relaxed resize-y",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono transition-colors",
  {
    variants: {
      variant: {
        default: "border-white/15 bg-white/5 text-slate-300",
        cyan: "border-nebula-cyan/40 bg-nebula-cyan/10 text-nebula-cyan",
        violet: "border-nebula-violet/40 bg-nebula-violet/10 text-violet-300",
        solar: "border-solar-orange/40 bg-solar-orange/10 text-solar-orange",
        success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

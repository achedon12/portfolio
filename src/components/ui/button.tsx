import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-nebula-violet to-nebula-cyan text-white shadow-[0_0_30px_rgba(124,58,237,0.35)] hover:shadow-[0_0_50px_rgba(124,58,237,0.55)] hover:scale-[1.02]",
        solar:
          "bg-solar-orange text-cosmos-deep font-semibold shadow-[0_0_25px_rgba(251,146,60,0.4)] hover:shadow-[0_0_45px_rgba(251,146,60,0.6)]",
        outline:
          "border border-white/15 bg-white/5 backdrop-blur-sm text-slate-200 hover:bg-white/10 hover:border-nebula-cyan/40",
        ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
        destructive:
          "bg-rose-500/20 border border-rose-500/40 text-rose-200 hover:bg-rose-500/30",
        link: "text-nebula-cyan underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { buttonVariants };

import * as React from "react";
import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-xs font-mono uppercase tracking-[0.2em] text-nebula-cyan/80",
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = "Label";

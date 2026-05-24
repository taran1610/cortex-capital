import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-cyan-400/30 bg-cyan-400/10 text-cyan-100 shadow-[0_0_14px_-4px_rgba(34,211,238,0.35)]",
        success:
          "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
        destructive:
          "border-red-400/30 bg-red-500/10 text-red-200",
        outline: "border-white/10 bg-white/[0.03] text-slate-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06080f] disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-cyan-400/25 bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-400 text-[#06080f] shadow-[0_0_36px_-8px_rgba(34,211,238,0.5)] hover:brightness-110 hover:shadow-[0_0_48px_-6px_rgba(34,211,238,0.55)] active:scale-[0.98]",
        ghost:
          "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100 rounded-lg",
        outline:
          "border border-white/[0.1] bg-white/[0.02] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white",
        destructive:
          "border border-red-500/35 bg-red-500/10 text-red-100 hover:bg-red-500/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        lg: "h-12 px-8 text-base rounded-xl",
        sm: "h-8 px-3 text-xs rounded-lg",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

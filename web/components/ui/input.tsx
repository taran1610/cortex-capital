import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-white/[0.08] bg-[#0c1019]/90 px-3 py-2 font-mono text-sm text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition placeholder:text-slate-600 focus-visible:border-cyan-400/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };

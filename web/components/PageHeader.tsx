import type { ReactNode } from "react";

type PageHeaderProps = {
  kicker: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageHeader({
  kicker,
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 border-b border-white/[0.06] pb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-3">
        <p className="saas-kicker">{kicker}</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-[2.5rem] lg:leading-tight">
          {title}
        </h1>
        {description ? (
          <p className="max-w-xl text-sm leading-relaxed text-slate-500 md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}

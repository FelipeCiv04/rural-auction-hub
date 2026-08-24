import type { ReactNode } from "react";

/** Cabeçalho padrão das páginas internas. */
export function PageIntro({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-4 py-16 md:flex-row md:items-end">
        <div className="max-w-2xl animate-entry">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter md:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </section>
  );
}

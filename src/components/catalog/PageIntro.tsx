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
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-primary/20 blur-3xl"
      />
      <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-8 px-4 py-14 md:flex-row md:items-end md:py-20">
        <div className="max-w-2xl animate-entry">
          <p className="mb-4 inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
            {eyebrow}
          </p>
          <h1 className="font-display text-4xl font-black leading-[1.02] md:text-6xl">{title}</h1>
          {description ? (
            <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </section>
  );
}

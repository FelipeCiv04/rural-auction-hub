import type { InputHTMLAttributes, ReactNode } from "react";

/** Moldura das páginas de autenticação. */
export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-12 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 size-72 rounded-full bg-primary/20 blur-3xl"
      />
      <div className="relative animate-entry md:col-span-5">
        <p className="mb-4 inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
          {eyebrow}
        </p>
        <h1 className="font-display text-4xl font-black leading-[1.02] md:text-5xl">{title}</h1>
        <p className="mt-5 max-w-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="relative md:col-span-7">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-elevated md:p-8">
          {children}
        </div>
      </div>
    </section>
  );
}

export function FormField({
  id,
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string; label: string }) {
  return (
    <div>
      <label htmlFor={id} className="meta-label mb-2 block">
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        {...props}
      />
    </div>
  );
}

import type { InputHTMLAttributes, ReactNode } from "react";

/** Moldura das páginas de autenticação, no mesmo padrão de ficha do catálogo. */
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
    <section className="mx-auto grid max-w-7xl gap-16 px-4 py-20 md:grid-cols-12">
      <div className="animate-entry md:col-span-5">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          {eyebrow}
        </p>
        <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tighter">{title}</h1>
        <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="md:col-span-7">
        <div className="bg-surface p-8 ring-1 ring-black/[0.05]">{children}</div>
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
        className="w-full border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
        {...props}
      />
    </div>
  );
}

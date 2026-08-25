import type { ReactNode } from "react";

interface Section {
  id: string;
  title: string;
  content: ReactNode;
}

/** Blocos de informação empilhados, no formato de ficha do catálogo. */
export function SiteLayoutTabs({ sections }: { sections: Section[] }) {
  return (
    <div className="mt-14 grid gap-4 lg:grid-cols-2">
      {sections.map((section) => (
        <section key={section.id} className="rounded-xl border border-border bg-surface p-6">
          <h2 className="eyebrow mb-5 border-b border-border pb-3 text-primary">{section.title}</h2>
          {section.content}
        </section>
      ))}
    </div>
  );
}

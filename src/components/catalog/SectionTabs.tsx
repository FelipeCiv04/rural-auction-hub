import type { ReactNode } from "react";

interface Section {
  id: string;
  title: string;
  content: ReactNode;
}

/** Blocos de informação empilhados, no formato de ficha do catálogo. */
export function SiteLayoutTabs({ sections }: { sections: Section[] }) {
  return (
    <div className="mt-16 grid gap-1 lg:grid-cols-2">
      {sections.map((section) => (
        <section key={section.id} className="bg-surface p-6 ring-1 ring-black/[0.05]">
          <h2 className="eyebrow mb-6 border-b border-border pb-3 text-muted-foreground">
            {section.title}
          </h2>
          {section.content}
        </section>
      ))}
    </div>
  );
}

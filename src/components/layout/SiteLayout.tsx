import type { ReactNode } from "react";

import { LiveTickerBar } from "./LiveTickerBar";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Casca padrão das páginas públicas: barra de pregão ao vivo, header e footer. */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <LiveTickerBar />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

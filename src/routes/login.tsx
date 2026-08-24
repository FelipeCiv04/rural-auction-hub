import { createFileRoute, Link } from "@tanstack/react-router";

import { AuthShell, FormField } from "@/components/auth/AuthShell";
import { CatalogButton } from "@/components/catalog/CatalogButton";
import { SiteLayout } from "@/components/layout/SiteLayout";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Terroir Remates" },
      {
        name: "description",
        content:
          "Acesse sua conta para acompanhar remates, habilitar-se em leilões e revisar seus lotes favoritos.",
      },
      { property: "og:title", content: "Entrar — Terroir Remates" },
      {
        property: "og:description",
        content: "Área do comprador da plataforma de leilões rurais Terroir Remates.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <SiteLayout>
      <AuthShell
        eyebrow="Área do Comprador"
        title="Entrar no Pregão"
        description="Use as credenciais cadastradas para acompanhar remates ao vivo e seus lotes habilitados."
      >
        <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
          <FormField id="email" label="E-mail" type="email" placeholder="seu@email.com" />
          <FormField id="senha" label="Senha" type="password" placeholder="••••••••" />
          <CatalogButton variant="solid" size="block" type="submit">
            Entrar
          </CatalogButton>
        </form>
        <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Ainda não tem cadastro?{" "}
          <Link to="/cadastro" className="border-b border-foreground text-foreground">
            Criar conta
          </Link>
        </p>
      </AuthShell>
    </SiteLayout>
  );
}

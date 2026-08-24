import { createFileRoute, Link } from "@tanstack/react-router";

import { AuthShell, FormField } from "@/components/auth/AuthShell";
import { CatalogButton } from "@/components/catalog/CatalogButton";
import { SiteLayout } from "@/components/layout/SiteLayout";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar Conta — Terroir Remates" },
      {
        name: "description",
        content:
          "Cadastre-se para habilitar-se em leilões de gado e propriedades rurais e acompanhar o catálogo de lotes.",
      },
      { property: "og:title", content: "Criar Conta — Terroir Remates" },
      {
        property: "og:description",
        content: "Cadastro de comprador na plataforma de leilões rurais Terroir Remates.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <SiteLayout>
      <AuthShell
        eyebrow="Novo Comprador"
        title="Criar Cadastro"
        description="A habilitação para dar lances é liberada após a análise dos dados cadastrais e documentais."
      >
        <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField id="nome" label="Nome completo" placeholder="João da Silva" />
            <FormField id="documento" label="CPF / CNPJ" placeholder="000.000.000-00" />
            <FormField id="email" label="E-mail" type="email" placeholder="seu@email.com" />
            <FormField id="telefone" label="Telefone" placeholder="(67) 90000-0000" />
            <FormField id="propriedade" label="Propriedade / Empresa" placeholder="Fazenda ..." />
            <FormField id="estado" label="Estado" placeholder="MS" />
            <FormField id="senha" label="Senha" type="password" placeholder="••••••••" />
            <FormField
              id="confirmar"
              label="Confirmar senha"
              type="password"
              placeholder="••••••••"
            />
          </div>
          <CatalogButton variant="accent" size="block" type="submit">
            Enviar Cadastro
          </CatalogButton>
        </form>
        <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Já possui conta?{" "}
          <Link to="/login" className="border-b border-foreground text-foreground">
            Entrar
          </Link>
        </p>
      </AuthShell>
    </SiteLayout>
  );
}

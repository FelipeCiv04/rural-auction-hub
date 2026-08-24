import { createFileRoute, Link } from "@tanstack/react-router";

import { AuthShell, FormField } from "@/components/auth/AuthShell";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
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
  const { signUp, isConfigured } = useAuth();
  const [form, setForm] = useState({
    nome: "",
    documento: "",
    email: "",
    telefone: "",
    propriedade: "",
    estado: "",
    senha: "",
    confirmar: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField(id: string, value: string) {
    setForm((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isConfigured) {
      setError("Autenticação não está configurada no frontend.");
      return;
    }
    if (!form.email || !form.senha) {
      setError("Preencha e-mail e senha.");
      return;
    }
    if (form.senha !== form.confirmar) {
      setError("As senhas não conferem.");
      return;
    }
    setLoading(true);
    const res = await signUp({
      email: form.email,
      password: form.senha,
      full_name: form.nome,
      phone: form.telefone,
    });
    setLoading(false);
    if (res.error) {
      const getErrorMessage = (err: unknown): string => {
        if (!err) return "Falha ao cadastrar. Tente novamente.";
        if (err instanceof Error) return err.message;
        if (typeof err === "object" && err !== null && "message" in err) {
          const m = (err as { message?: unknown }).message;
          if (typeof m === "string") return m;
        }
        return String(err);
      };

      setError(getErrorMessage(res.error));
      return;
    }
    // after signup redirect to login
    window.location.href = "/login";
  }

  return (
    <SiteLayout>
      <AuthShell
        eyebrow="Novo Comprador"
        title="Criar Cadastro"
        description="A habilitação para dar lances é liberada após a análise dos dados cadastrais e documentais."
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              id="nome"
              label="Nome completo"
              placeholder="João da Silva"
              value={form.nome}
              onChange={(e) => updateField("nome", e.target.value)}
            />
            <FormField
              id="documento"
              label="CPF / CNPJ"
              placeholder="000.000.000-00"
              value={form.documento}
              onChange={(e) => updateField("documento", e.target.value)}
            />
            <FormField
              id="email"
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
            <FormField
              id="telefone"
              label="Telefone"
              placeholder="(67) 90000-0000"
              value={form.telefone}
              onChange={(e) => updateField("telefone", e.target.value)}
            />
            <FormField
              id="propriedade"
              label="Propriedade / Empresa"
              placeholder="Fazenda ..."
              value={form.propriedade}
              onChange={(e) => updateField("propriedade", e.target.value)}
            />
            <FormField
              id="estado"
              label="Estado"
              placeholder="MS"
              value={form.estado}
              onChange={(e) => updateField("estado", e.target.value)}
            />
            <FormField
              id="senha"
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={form.senha}
              onChange={(e) => updateField("senha", e.target.value)}
            />
            <FormField
              id="confirmar"
              label="Confirmar senha"
              type="password"
              placeholder="••••••••"
              value={form.confirmar}
              onChange={(e) => updateField("confirmar", e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <CatalogButton variant="accent" size="block" type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Cadastro"}
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

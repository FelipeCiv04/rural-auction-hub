import { createFileRoute, Link } from "@tanstack/react-router";

import { AuthShell, FormField } from "@/components/auth/AuthShell";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
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
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isConfigured) {
      setError("Autenticação não está configurada no frontend.");
      return;
    }
    setLoading(true);
    const res = await signIn({ email, password });
    setLoading(false);
    if (res.error) {
      const getErrorMessage = (err: unknown): string => {
        if (!err) return "Falha ao autenticar. Verifique suas credenciais.";
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
    // redirect to account
    window.location.href = "/minha-conta";
  }

  return (
    <SiteLayout>
      <AuthShell
        eyebrow="Área do Comprador"
        title="Entrar no Pregão"
        description="Use as credenciais cadastradas para acompanhar remates ao vivo e seus lotes habilitados."
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormField
            id="email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormField
            id="senha"
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <CatalogButton variant="solid" size="block" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
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

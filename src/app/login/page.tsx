"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const senha = String(formData.get("senha") ?? "");

    try {
      const response = await authApi.login({ email, senha });
      window.localStorage.setItem("safeaccess_token", response.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-[420px]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-ink text-white shadow-soft">
            <Shield size={25} aria-hidden />
          </div>
          <h1 className="text-3xl font-bold text-ink">SafeAccess</h1>
          <p className="mt-2 text-sm text-muted">Painel administrativo de acesso industrial</p>
        </div>

        <form onSubmit={handleSubmit} className="surface grid gap-5 p-7">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span className="flex items-center gap-2 font-semibold">
              <ShieldCheck size={16} aria-hidden />
              Acesso restrito ao administrador
            </span>
          </div>

          <Field label="E-mail corporativo">
            <Input name="email" type="email" placeholder="usuario@empresa.com" required />
          </Field>

          <Field label="Senha">
            <div className="relative">
              <Input name="senha" type={showPassword ? "text" : "password"} placeholder="••••••••" required />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-2 top-1/2 rounded-md p-2 text-muted transition hover:bg-black/5 hover:text-ink"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
              </button>
            </div>
          </Field>

          {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">{error}</p> : null}

          <Button type="submit" disabled={loading}>
            <LockKeyhole size={16} aria-hidden />
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <button type="button" className="text-sm font-medium text-muted transition hover:text-ink">
            Esqueci minha senha
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted">Conta bloqueada após 5 tentativas inválidas</p>
      </section>
    </main>
  );
}

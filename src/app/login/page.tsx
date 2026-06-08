"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { setSession } from "@/lib/local-store";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const senha = String(formData.get("senha") ?? "");

    await new Promise((resolve) => setTimeout(resolve, 350));

    if (!email.includes("@") || senha.length < 4) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setError(
        nextAttempts >= 5
          ? "Conta bloqueada por excesso de tentativas nesta simulação."
          : "Informe um e-mail válido e senha com pelo menos 4 caracteres."
      );
      setLoading(false);
      return;
    }

    const nome = email
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((item) => `${item.charAt(0).toUpperCase()}${item.slice(1)}`)
      .join(" ");

    setSession({
      nome: nome || "Administrador",
      email,
      expira_em: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
    });

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
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
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted transition hover:bg-black/5 hover:text-ink"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setShowPassword((current) => !current);
                }}
              >
                {showPassword ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
              </button>
            </div>
          </Field>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
          ) : null}
          {message ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {message}
            </p>
          ) : null}

          <Button type="submit" disabled={loading}>
            <LockKeyhole size={16} aria-hidden />
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <button
            type="button"
            className="text-sm font-medium text-muted transition hover:text-ink"
            onClick={() => {
              setError("");
              setMessage("Um link de redefinição simulado foi enviado para o e-mail informado.");
            }}
          >
            Esqueci minha senha
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted">Conta bloqueada após 5 tentativas inválidas</p>
      </section>
    </main>
  );
}
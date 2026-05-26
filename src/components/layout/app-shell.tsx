"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  DoorOpen,
  HardHat,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  Wifi,
  Users
} from "lucide-react";
import { clearSession, getSession, type SafeAccessSession } from "@/lib/local-store";
import { cn, initials } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Funcionarios", href: "/funcionarios", icon: Users },
  { label: "Areas", href: "/areas", icon: DoorOpen },
  { label: "EPIs", href: "/epis", icon: HardHat },
  { label: "Relatorios", href: "/relatorios", icon: ClipboardList },
  { label: "Configuracoes", href: "/configuracoes", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<SafeAccessSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);
    setCheckingSession(false);

    if (!currentSession) {
      router.replace("/login");
    }
  }, [router]);

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-sm font-semibold text-muted">
        Carregando painel...
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="relative flex flex-col border-b border-black/10 bg-[#111514] text-white shadow-lift lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-r-black/30">
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-full bg-[linear-gradient(135deg,rgba(255,255,255,0.045)_0,rgba(255,255,255,0.045)_1px,transparent_1px,transparent_72px)] bg-[length:72px_72px] lg:block" />
        <div className="relative flex h-16 items-center justify-between px-5 lg:h-24">
          <Link href="/dashboard" className="flex items-center gap-3 font-bold text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-ink shadow-sm">
              <Shield size={19} aria-hidden />
            </span>
            <span>
              <span className="block leading-tight">SafeAccess</span>
              <span className="block text-xs font-medium text-white/55">Controle industrial</span>
            </span>
          </Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/12 text-sm font-semibold lg:hidden">
            {initials(session.nome)}
          </div>
        </div>

        <div className="relative hidden px-5 pb-4 lg:block">
          <div className="rounded-lg border border-white/10 bg-white/[0.055] px-3 py-3 text-xs font-semibold text-white shadow-sm">
            <span className="inline-flex items-center gap-2 text-emerald-200">
              <Sparkles size={14} aria-hidden />
              MVP pronto para API
            </span>
            <span className="mt-2 flex items-center gap-2 text-white/55">
              <Wifi size={14} aria-hidden />
              Dados locais persistidos
            </span>
          </div>
        </div>

        <nav className="relative flex gap-1 overflow-x-auto px-3 pb-3 lg:grid lg:gap-1.5 lg:overflow-visible lg:px-3">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex min-w-max items-center gap-3 whitespace-nowrap rounded-md border px-3 py-2.5 text-sm font-semibold transition",
                  active
                    ? "border-white/15 bg-white text-ink shadow-sm hover:border-white/15 hover:bg-white hover:text-ink"
                    : "border-transparent text-white/65 hover:border-white/10 hover:bg-white/[0.075] hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md transition",
                    active ? "bg-emerald-50 text-signal" : "text-white/45 group-hover:text-white"
                  )}
                >
                  <Icon size={16} aria-hidden />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative mt-auto hidden border-t border-white/10 p-4 lg:block">
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.055] p-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-ink">
              {initials(session.nome)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{session.nome}</p>
              <p className="truncate text-xs text-white/55">Administrador</p>
            </div>
            <button type="button" aria-label="Sair" onClick={handleLogout} className="rounded-md p-2 text-white/55 transition hover:bg-white/10 hover:text-white">
              <LogOut size={16} aria-hidden />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1560px]">{children}</div>
      </main>
    </div>
  );
}

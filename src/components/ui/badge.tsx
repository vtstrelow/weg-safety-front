import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "border-neutral-200 bg-neutral-100 text-neutral-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-700"
};

export function Badge({
  children,
  tone = "neutral",
  className
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full border px-3 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): BadgeTone {
  const value = status.toUpperCase();

  if (["ATIVO", "VALIDO", "VALIDA", "LIBERADA", "PERMITIDO"].includes(value)) {
    return "success";
  }

  if (["ALERTA", "VENCENDO", "MEDIO", "MÉDIO"].includes(value)) {
    return "warning";
  }

  if (["INATIVO", "VENCIDO", "BLOQUEADO", "BLOQUEADA", "NEGADO", "CRITICO", "CRÍTICO", "RESTRITA"].includes(value)) {
    return "danger";
  }

  return "neutral";
}

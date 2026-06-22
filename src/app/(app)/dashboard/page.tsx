"use client";

import { AlertTriangle, DoorOpen, HardHat, RotateCcw, ShieldCheck, Users, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, Td, Th } from "@/components/data/table";
import { dashboardResumo, criticalEpis, resetState } from "@/lib/local-store";
import { useSafeAccessStore } from "@/lib/use-safeaccess-store";
import { formatDate, formatDateTime } from "@/lib/utils";

const kpiIcons = {
  funcionarios: Users,
  areas: DoorOpen,
  vencidos: XCircle,
  vencer: AlertTriangle,
  acessos: ShieldCheck,
  negados: XCircle
};

const cardStyles = {
  neutral: {
    border: "border-neutral-200",
    icon: "bg-neutral-100 text-ink",
    accent: "bg-neutral-300",
    caption: "Operacao cadastrada"
  },
  success: {
    border: "border-emerald-200",
    icon: "bg-emerald-50 text-emerald-700",
    accent: "bg-emerald-500",
    caption: "Dentro do esperado"
  },
  warning: {
    border: "border-amber-200",
    icon: "bg-amber-50 text-amber-800",
    accent: "bg-amber-500",
    caption: "Requer acompanhamento"
  },
  danger: {
    border: "border-red-200",
    icon: "bg-red-50 text-red-700",
    accent: "bg-red-500",
    caption: "Acao recomendada"
  }
};

export default function DashboardPage() {
  const { state, ready, replace } = useSafeAccessStore();

  if (!ready || !state) {
    return <p className="text-sm font-semibold text-muted">Carregando dashboard...</p>;
  }

  const summary = dashboardResumo(state);
  const critical = criticalEpis(state);
  const recentAccess = state.logs.slice(0, 6);
  const cards = [
    { label: "Funcionarios ativos", value: summary.total_funcionarios_ativos, icon: kpiIcons.funcionarios, tone: "success" },
    { label: "Areas ativas", value: summary.total_areas_ativas, icon: kpiIcons.areas, tone: "neutral" },
    { label: "EPIs vencidos", value: summary.total_epis_vencidos, icon: kpiIcons.vencidos, tone: "danger" },
    { label: "EPIs a vencer", value: summary.total_epis_a_vencer, icon: kpiIcons.vencer, tone: "warning" },
    { label: "Acessos hoje", value: summary.total_acessos_hoje, icon: kpiIcons.acessos, tone: "success" },
    { label: "Negados hoje", value: summary.total_negados_hoje, icon: kpiIcons.negados, tone: "danger" }
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumo operacional para acompanhamento do controle de acesso."
        action={
          <Button type="button" variant="secondary" onClick={() => replace(resetState())}>
            <RotateCcw size={16} aria-hidden />
            Restaurar dados
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const style = cardStyles[card.tone as keyof typeof cardStyles];

          return (
            <article key={card.label} className={`surface relative overflow-hidden border ${style.border} p-5`}>
              <span className={`absolute left-0 top-0 h-full w-1 ${style.accent}`} />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted">{card.label}</p>
                  <strong className="mt-2 block text-4xl text-ink">{card.value}</strong>
                  <p className="mt-2 text-xs font-medium text-muted">{style.caption}</p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${style.icon}`}>
                  <Icon size={18} aria-hidden />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <HardHat size={18} aria-hidden />
              <h2 className="text-lg font-bold">EPIs criticos</h2>
            </div>
            <Badge tone="warning">{critical.length} alertas</Badge>
          </div>
          <Table>
            <thead className="table-head">
              <tr>
                <Th>Funcionario</Th>
                <Th>EPI</Th>
                <Th>Validade</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {critical.map((epi) => (
                <tr key={`${epi.funcionario_nome}-${epi.epi_tipo}-${epi.nr_ca}`}>
                  <Td>{epi.funcionario_nome}</Td>
                  <Td>{epi.epi_tipo}</Td>
                  <Td>{formatDate(epi.data_validade)}</Td>
                  <Td>
                    <Badge tone={statusTone(epi.status)}>{epi.status}</Badge>
                  </Td>
                </tr>
              ))}
              {!critical.length ? (
                <tr>
                  <Td colSpan={4}>Nenhum EPI critico no momento.</Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} aria-hidden />
              <h2 className="text-lg font-bold">Acessos recentes</h2>
            </div>
            <Badge tone="success">Ao vivo</Badge>
          </div>
          <Table>
            <thead className="table-head">
              <tr>
                <Th>Funcionario</Th>
                <Th>Area</Th>
                <Th>Resultado</Th>
                <Th>Data/Hora</Th>
              </tr>
            </thead>
            <tbody>
              {recentAccess.map((log) => (
                <tr key={log.id}>
                  <Td>{log.funcionario_nome}</Td>
                  <Td>{log.area_nome}</Td>
                  <Td>
                    <Badge tone={statusTone(log.resultado)}>{log.resultado}</Badge>
                  </Td>
                  <Td>{formatDateTime(log.ts_evento)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </section>
    </>
  );
}
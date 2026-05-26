import { AlertTriangle, DoorOpen, HardHat, ShieldCheck, Users, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, statusTone } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/data/table";
import { dashboardApi } from "@/lib/api";
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
    caption: "Operação cadastrada"
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
    caption: "Ação recomendada"
  }
};

export default async function DashboardPage() {
  const [summary, criticalEpis, recentAccess] = await Promise.all([
    dashboardApi.summary(),
    dashboardApi.criticalEpis(),
    dashboardApi.recentAccess()
  ]);

  const cards = [
    { label: "Funcionários ativos", value: summary.total_funcionarios_ativos, icon: kpiIcons.funcionarios, tone: "success" },
    { label: "Áreas ativas", value: summary.total_areas_ativas, icon: kpiIcons.areas, tone: "neutral" },
    { label: "EPIs vencidos", value: summary.total_epis_vencidos, icon: kpiIcons.vencidos, tone: "danger" },
    { label: "EPIs a vencer", value: summary.total_epis_a_vencer, icon: kpiIcons.vencer, tone: "warning" },
    { label: "Acessos hoje", value: summary.total_acessos_hoje, icon: kpiIcons.acessos, tone: "success" },
    { label: "Negados hoje", value: summary.total_negados_hoje, icon: kpiIcons.negados, tone: "danger" }
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Resumo operacional para acompanhamento do controle de acesso." />

      <section className="mb-5 grid gap-4 overflow-hidden rounded-lg border border-[#18201f] bg-[#121615] p-5 text-white shadow-lift lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-emerald-200">
            <ShieldCheck size={20} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-bold text-white">Operação em modo administrativo</p>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-white/65">
              Dados simulados ativos. O front já está preparado para consumir a API quando o backend estiver online.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">API mock ativa</Badge>
          <span className="inline-flex min-h-6 items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
            JWT preparado
          </span>
        </div>
      </section>

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
              <h2 className="text-lg font-bold">EPIs críticos</h2>
            </div>
            <Badge tone="warning">{criticalEpis.total} alertas</Badge>
          </div>
          <Table>
            <thead className="table-head">
              <tr>
                <Th>Funcionário</Th>
                <Th>EPI</Th>
                <Th>Validade</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {criticalEpis.data.map((epi) => (
                <tr key={`${epi.funcionario_nome}-${epi.epi_tipo}`}>
                  <Td>{epi.funcionario_nome}</Td>
                  <Td>{epi.epi_tipo}</Td>
                  <Td>{formatDate(epi.data_validade)}</Td>
                  <Td>
                    <Badge tone={statusTone(epi.status)}>{epi.status}</Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} aria-hidden />
              <h2 className="text-lg font-bold">Acessos recentes</h2>
            </div>
            <Badge tone="success">Hoje</Badge>
          </div>
          <Table>
            <thead className="table-head">
              <tr>
                <Th>Funcionário</Th>
                <Th>Área</Th>
                <Th>Resultado</Th>
                <Th>Data/Hora</Th>
              </tr>
            </thead>
            <tbody>
              {recentAccess.data.map((log) => (
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

import Link from "next/link";
import { CheckCircle2, Download, Eye, Filter, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/data/pagination";
import { Table, Td, Th } from "@/components/data/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { logsApi } from "@/lib/api";
import { formatDateTime, initials } from "@/lib/utils";

export default async function RelatoriosPage() {
  const response = await logsApi.list();
  const permitidos = response.data.filter((log) => log.resultado === "PERMITIDO").length;
  const negados = response.data.filter((log) => log.resultado === "NEGADO").length;

  return (
    <>
      <PageHeader
        title="Logs de Acesso"
        description="Auditoria de liberações, negações e motivos registrados pelo sistema."
        action={
          <Button variant="secondary">
            <Download size={16} aria-hidden />
            Exportar CSV
          </Button>
        }
      />

      <section className="mb-5 grid gap-3 md:grid-cols-3">
        <ReportSummary icon={<ClipboardIcon />} label="Eventos" value={response.total} tone="neutral" />
        <ReportSummary icon={<CheckCircle2 size={18} aria-hidden />} label="Permitidos" value={permitidos} tone="success" />
        <ReportSummary icon={<ShieldAlert size={18} aria-hidden />} label="Negados" value={negados} tone="danger" />
      </section>

      <section className="panel mb-5 grid gap-3 p-4 lg:grid-cols-[160px_160px_1fr_180px_auto]">
        <Input type="date" aria-label="Data início" />
        <Input type="date" aria-label="Data fim" />
        <Select defaultValue="">
          <option value="">Área</option>
          <option>Entrada Principal</option>
          <option>Sala de Máquinas</option>
          <option>Laboratório B</option>
        </Select>
        <Select defaultValue="">
          <option value="">Resultado</option>
          <option>PERMITIDO</option>
          <option>NEGADO</option>
        </Select>
        <Button>
          <Filter size={16} aria-hidden />
          Filtrar
        </Button>
      </section>

      <Table>
        <thead className="table-head">
          <tr>
            <Th>Funcionário</Th>
            <Th>Área</Th>
              <Th>Resultado</Th>
              <Th>Motivo</Th>
              <Th>Data/Hora</Th>
              <Th>Ações</Th>
          </tr>
        </thead>
        <tbody>
          {response.data.map((log) => (
            <tr key={log.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold">
                    {initials(log.funcionario_nome)}
                  </span>
                  <strong className="text-ink">{log.funcionario_nome}</strong>
                </div>
              </Td>
              <Td>{log.area_nome}</Td>
              <Td>
                <Badge tone={statusTone(log.resultado)}>{log.resultado}</Badge>
              </Td>
              <Td className={log.resultado === "NEGADO" ? "font-semibold text-danger" : ""}>{log.motivo || "—"}</Td>
              <Td>{formatDateTime(log.ts_evento)}</Td>
              <Td>
                <Link
                  href={`/relatorios/${log.id}`}
                  className="inline-flex rounded-md border border-line p-2 text-muted transition hover:border-ink hover:text-ink"
                  aria-label="Ver detalhe do log"
                >
                  <Eye size={15} aria-hidden />
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination totalLabel={`Exibindo ${response.data.length} de ${response.total} registros`} />
    </>
  );
}

function ClipboardIcon() {
  return <Download size={18} aria-hidden />;
}

function ReportSummary({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "success" | "danger" | "neutral";
}) {
  const tones = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    danger: "border-red-200 bg-red-50 text-red-700",
    neutral: "border-line bg-white text-ink"
  };

  return (
    <article className="surface flex items-center gap-3 p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-md border ${tones[tone]}`}>{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase text-muted">{label}</p>
        <strong className="text-2xl text-ink">{value}</strong>
      </div>
    </article>
  );
}

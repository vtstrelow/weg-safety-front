import { AlertTriangle, CheckCircle2, HardHat, Link2, Plus, X, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/data/pagination";
import { Table, Td, Th } from "@/components/data/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { epiTiposApi, episApi, funcionariosApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default async function EpisPage() {
  const [epis, vencimentos, funcionarios, epiTipos] = await Promise.all([
    episApi.list(),
    episApi.expirations(),
    funcionariosApi.list(),
    epiTiposApi.list()
  ]);
  const validos = epis.data.filter((epi) => epi.status === "ATIVO").length;
  const vencidos = epis.data.filter((epi) => epi.status === "VENCIDO").length;

  return (
    <>
      <PageHeader title="Gestão de EPIs" description="Vinculação múltipla com validade, número de CA e alertas de vencimento." />

      <section className="mb-5 grid gap-3 md:grid-cols-3">
        <EpiSummary icon={<HardHat size={18} aria-hidden />} label="Vínculos" value={epis.total} tone="neutral" />
        <EpiSummary icon={<CheckCircle2 size={18} aria-hidden />} label="Válidos" value={validos} tone="success" />
        <EpiSummary icon={<XCircle size={18} aria-hidden />} label="Vencidos" value={vencidos} tone="danger" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div>
          <Table>
            <thead className="bg-neutral-100 text-[11px] uppercase text-muted">
              <tr>
                <Th>Funcionário</Th>
                <Th>EPI</Th>
                <Th>CA</Th>
                <Th>Data entrega</Th>
                <Th>Validade</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {epis.data.map((epi) => (
                <tr key={epi.id}>
                  <Td className="font-semibold text-ink">{epi.funcionario.nome}</Td>
                  <Td>{epi.epi_tipo.nome}</Td>
                  <Td>{epi.nr_ca}</Td>
                  <Td>{epi.data_entrega ? formatDate(epi.data_entrega) : "—"}</Td>
                  <Td>{formatDate(epi.data_validade)}</Td>
                  <Td>
                    <Badge tone={statusTone(epi.status)}>{epi.status === "ATIVO" ? "Válido" : epi.status}</Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <button className="rounded-md border border-line p-2 text-muted transition hover:border-ink hover:text-ink" aria-label="Ver vínculo">
                        <Link2 size={15} aria-hidden />
                      </button>
                      <button className="rounded-md border border-line p-2 text-muted transition hover:border-danger hover:text-danger" aria-label="Remover EPI">
                        <X size={15} aria-hidden />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination totalLabel={`Exibindo ${epis.data.length} de ${epis.total} registros`} />
        </div>

        <aside className="surface self-start p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Vincular novo EPI</h2>
            <Plus size={16} className="text-muted" aria-hidden />
          </div>
          <form className="grid gap-3">
            <Field label="Selecionar funcionário">
              <Select defaultValue="">
                <option value="">Selecione</option>
                {funcionarios.data.map((funcionario) => (
                  <option key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tipo de EPI">
              <Select defaultValue="">
                <option value="">Selecione</option>
                {epiTipos.data.map((epi) => (
                  <option key={epi.id} value={epi.id}>
                    {epi.nome}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              <Field label="Número CA">
                <Input placeholder="Ex: 12345" />
              </Field>
              <Field label="Data de entrega">
                <Input type="date" />
              </Field>
            </div>
            <Field label="Validade">
              <Input type="date" />
            </Field>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Button type="button">Vincular</Button>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </div>
          </form>
        </aside>
      </section>

      <section className="surface mt-6 p-4">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle size={17} className="text-warning" aria-hidden />
          <h2 className="font-bold">Alertas de vencimento</h2>
        </div>
        <div className="grid gap-2">
          {vencimentos.data.map((epi) => (
            <div key={`${epi.funcionario_nome}-${epi.epi_tipo}`} className="grid gap-3 rounded-md border border-line bg-white p-3 text-sm sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center">
              <strong>{epi.funcionario_nome}</strong>
              <span>{epi.epi_tipo}</span>
              <span className="text-muted">
                {epi.status === "VENCIDO" ? "vencido" : "vence"} em {epi.dias_para_vencer} dias
              </span>
              <Button type="button" className="h-9">
                Renovar
              </Button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function EpiSummary({
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

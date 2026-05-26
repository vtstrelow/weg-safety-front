"use client";

import { FormEvent, useState } from "react";
import { AlertTriangle, CheckCircle2, HardHat, Link2, Plus, RotateCw, X, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/data/pagination";
import { Table, Td, Th } from "@/components/data/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { criticalEpis, daysUntil, epiStatus, pushLog, uid, type SafeAccessState } from "@/lib/local-store";
import { useSafeAccessStore } from "@/lib/use-safeaccess-store";
import { formatDate } from "@/lib/utils";

export default function EpisPage() {
  const { state, ready, update } = useSafeAccessStore();
  const [message, setMessage] = useState("");

  if (!ready || !state) {
    return <p className="text-sm font-semibold text-muted">Carregando EPIs...</p>;
  }

  const currentState = state;
  const epis = currentState.epis.map((epi) => ({
    ...epi,
    dias_para_vencer: daysUntil(epi.data_validade),
    status: epiStatus(epi.data_validade)
  }));
  const vencimentos = criticalEpis(currentState);
  const validos = epis.filter((epi) => epi.status === "ATIVO").length;
  const vencidos = epis.filter((epi) => epi.status === "VENCIDO").length;

  function syncEmployeeEpis(draft: SafeAccessState, funcionarioId: string) {
    const funcionario = draft.funcionarios.find((item) => item.id === funcionarioId);
    if (!funcionario) return;

    funcionario.epis = draft.epis
      .filter((epi) => epi.funcionario.id === funcionarioId)
      .map((epi) => ({
        id: epi.id,
        epi_tipo: epi.epi_tipo,
        nr_ca: epi.nr_ca,
        data_entrega: epi.data_entrega ?? "",
        data_validade: epi.data_validade,
        dias_para_vencer: daysUntil(epi.data_validade),
        status: epiStatus(epi.data_validade)
      }));
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const funcionario = currentState.funcionarios.find((item) => item.id === String(formData.get("funcionario_id")));
    const epiTipo = currentState.epiTipos.find((item) => item.id === String(formData.get("epi_tipo_id")));
    const dataValidade = String(formData.get("data_validade") ?? "");

    if (!funcionario || !epiTipo) {
      setMessage("Selecione funcionario e tipo de EPI.");
      return;
    }

    if (epiStatus(dataValidade) === "VENCIDO") {
      setMessage("A validade nao pode estar expirada.");
      return;
    }

    update((draft) => {
      draft.epis.push({
        id: uid("epi-func"),
        funcionario: { id: funcionario.id, nome: funcionario.nome, matricula: funcionario.matricula },
        epi_tipo: epiTipo,
        nr_ca: String(formData.get("nr_ca") ?? ""),
        data_entrega: String(formData.get("data_entrega") ?? ""),
        data_validade: dataValidade,
        dias_para_vencer: daysUntil(dataValidade),
        status: "ATIVO"
      });
      syncEmployeeEpis(draft, funcionario.id);
      pushLog(draft, {
        funcionario_nome: funcionario.nome,
        area_nome: "Gestao de EPIs",
        resultado: "PERMITIDO",
        motivo: `${epiTipo.nome} vinculado`
      });
    });

    event.currentTarget.reset();
    setMessage("EPI vinculado com sucesso.");
  }

  function removeEpi(id: string) {
    update((draft) => {
      const epi = draft.epis.find((item) => item.id === id);
      draft.epis = draft.epis.filter((item) => item.id !== id);
      if (epi) {
        syncEmployeeEpis(draft, epi.funcionario.id);
        pushLog(draft, {
          funcionario_nome: epi.funcionario.nome,
          area_nome: "Gestao de EPIs",
          resultado: "NEGADO",
          motivo: `${epi.epi_tipo.nome} removido`
        });
      }
    });
  }

  function renewEpi(id: string) {
    const nextDate = new Date();
    nextDate.setFullYear(nextDate.getFullYear() + 1);
    const formatted = nextDate.toISOString().slice(0, 10);

    update((draft) => {
      const epi = draft.epis.find((item) => item.id === id);
      if (!epi) return;
      epi.data_validade = formatted;
      epi.status = "ATIVO";
      epi.dias_para_vencer = daysUntil(formatted);
      syncEmployeeEpis(draft, epi.funcionario.id);
      pushLog(draft, {
        funcionario_nome: epi.funcionario.nome,
        area_nome: "Gestao de EPIs",
        resultado: "PERMITIDO",
        motivo: `${epi.epi_tipo.nome} renovado`
      });
    });
  }

  return (
    <>
      <PageHeader title="Gestao de EPIs" description="Vinculacao multipla com validade, numero de CA e alertas de vencimento." />

      {message ? <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p> : null}

      <section className="mb-5 grid gap-3 md:grid-cols-3">
        <EpiSummary icon={<HardHat size={18} aria-hidden />} label="Vinculos" value={epis.length} tone="neutral" />
        <EpiSummary icon={<CheckCircle2 size={18} aria-hidden />} label="Validos" value={validos} tone="success" />
        <EpiSummary icon={<XCircle size={18} aria-hidden />} label="Vencidos" value={vencidos} tone="danger" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div>
          <Table>
            <thead className="bg-neutral-100 text-[11px] uppercase text-muted">
              <tr>
                <Th>Funcionario</Th>
                <Th>EPI</Th>
                <Th>CA</Th>
                <Th>Data entrega</Th>
                <Th>Validade</Th>
                <Th>Status</Th>
                <Th>Acoes</Th>
              </tr>
            </thead>
            <tbody>
              {epis.map((epi) => (
                <tr key={epi.id}>
                  <Td className="font-semibold text-ink">{epi.funcionario.nome}</Td>
                  <Td>{epi.epi_tipo.nome}</Td>
                  <Td>{epi.nr_ca}</Td>
                  <Td>{epi.data_entrega ? formatDate(epi.data_entrega) : "-"}</Td>
                  <Td>{formatDate(epi.data_validade)}</Td>
                  <Td>
                    <Badge tone={statusTone(epi.status)}>{epi.status === "ATIVO" ? "Valido" : epi.status}</Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <button type="button" className="rounded-md border border-line p-2 text-muted transition hover:border-ink hover:text-ink" aria-label="Ver vinculo" onClick={() => setMessage(`${epi.funcionario.nome} possui ${epi.epi_tipo.nome} CA ${epi.nr_ca}.`)}>
                        <Link2 size={15} aria-hidden />
                      </button>
                      <button type="button" className="rounded-md border border-line p-2 text-muted transition hover:border-emerald-700 hover:text-emerald-700" aria-label="Renovar EPI" onClick={() => renewEpi(epi.id)}>
                        <RotateCw size={15} aria-hidden />
                      </button>
                      <button type="button" className="rounded-md border border-line p-2 text-muted transition hover:border-danger hover:text-danger" aria-label="Remover EPI" onClick={() => removeEpi(epi.id)}>
                        <X size={15} aria-hidden />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination totalLabel={`Exibindo ${epis.length} de ${epis.length} registros`} />
        </div>

        <aside className="surface self-start p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Vincular novo EPI</h2>
            <Plus size={16} className="text-muted" aria-hidden />
          </div>
          <form onSubmit={handleCreate} className="grid gap-3">
            <Field label="Selecionar funcionario">
              <Select name="funcionario_id" defaultValue="" required>
                <option value="">Selecione</option>
                {state.funcionarios.map((funcionario) => (
                  <option key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tipo de EPI">
              <Select name="epi_tipo_id" defaultValue="" required>
                <option value="">Selecione</option>
                {state.epiTipos.filter((epi) => epi.ativo !== false).map((epi) => (
                  <option key={epi.id} value={epi.id}>
                    {epi.nome}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              <Field label="Numero CA">
                <Input name="nr_ca" placeholder="Ex: 12345" required />
              </Field>
              <Field label="Data de entrega">
                <Input name="data_entrega" type="date" required />
              </Field>
            </div>
            <Field label="Validade">
              <Input name="data_validade" type="date" required />
            </Field>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Button type="submit">Vincular</Button>
              <Button type="reset" variant="secondary">
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
          {vencimentos.map((epi) => {
            const match = state.epis.find((item) => item.funcionario.id === epi.funcionario_id && item.nr_ca === epi.nr_ca);
            return (
              <div key={`${epi.funcionario_nome}-${epi.epi_tipo}-${epi.nr_ca}`} className="grid gap-3 rounded-md border border-line bg-white p-3 text-sm sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center">
                <strong>{epi.funcionario_nome}</strong>
                <span>{epi.epi_tipo}</span>
                <span className="text-muted">{epi.status === "VENCIDO" ? "vencido" : "vence"} em {epi.dias_para_vencer} dias</span>
                <Button type="button" className="h-9" onClick={() => match && renewEpi(match.id)}>
                  Renovar
                </Button>
              </div>
            );
          })}
          {!vencimentos.length ? <p className="text-sm text-muted">Nenhum vencimento critico no momento.</p> : null}
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

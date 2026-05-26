"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardList, Download, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloadTextFile, logDetalhe, toCsv } from "@/lib/local-store";
import { useSafeAccessStore } from "@/lib/use-safeaccess-store";
import { formatDateTime } from "@/lib/utils";

export default function LogDetalhePage({ params }: { params: { id: string } }) {
  const { state, ready } = useSafeAccessStore();
  const log = state ? logDetalhe(state, params.id) : null;

  if (!ready || !state) {
    return <p className="text-sm font-semibold text-muted">Carregando log...</p>;
  }

  if (!log) {
    return (
      <>
        <PageHeader title="Log nao encontrado" description="O evento pode ter sido removido localmente." />
        <Link href="/relatorios" className="text-sm font-semibold text-ink underline">
          Voltar para relatorios
        </Link>
      </>
    );
  }

  const currentLog = log;

  function exportRecord() {
    const rows = [
      {
        id: currentLog.id,
        funcionario: currentLog.funcionario.nome,
        matricula: currentLog.funcionario.matricula,
        area: currentLog.area.nome,
        resultado: currentLog.resultado,
        motivo: currentLog.motivo || "-",
        data_hora: formatDateTime(currentLog.ts_evento)
      }
    ];
    const csv = toCsv(rows, [
      { key: "id", label: "ID" },
      { key: "funcionario", label: "Funcionario" },
      { key: "matricula", label: "Matricula" },
      { key: "area", label: "Area" },
      { key: "resultado", label: "Resultado" },
      { key: "motivo", label: "Motivo" },
      { key: "data_hora", label: "Data/Hora" }
    ]);
    downloadTextFile(`log_${currentLog.id}.csv`, csv, "text/csv;charset=utf-8");
  }

  return (
    <>
      <PageHeader
        title="Detalhe do log"
        description="Registro de auditoria de acesso gerado pelo sistema."
        action={
          <Link href="/relatorios" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-ink">
            <ArrowLeft size={16} aria-hidden />
            Voltar
          </Link>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <article className="surface p-5">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
              <ClipboardList size={18} aria-hidden />
            </span>
            <div>
              <h2 className="font-bold">Evento de acesso</h2>
              <p className="text-sm text-muted">Registro compativel com GET /api/logs/:id.</p>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <Info label="ID do log" value={log.id} />
            <Info label="Funcionario" value={`${log.funcionario.nome} - ${log.funcionario.matricula}`} />
            <Info label="Area" value={log.area.nome} />
            <Info label="Data/Hora" value={formatDateTime(log.ts_evento)} />
            <div>
              <dt className="text-xs font-semibold uppercase text-muted">Resultado</dt>
              <dd className="mt-1">
                <Badge tone={statusTone(log.resultado)}>{log.resultado}</Badge>
              </dd>
            </div>
            <Info label="Motivo" value={log.motivo || "Sem motivo de negacao"} />
          </dl>
        </article>

        <aside className="surface self-start p-5">
          <div className="mb-4 flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 text-success" aria-hidden />
            <div>
              <h2 className="font-bold">Auditoria</h2>
              <p className="mt-1 text-sm text-muted">Este registro fica exportavel em CSV para rastreabilidade.</p>
            </div>
          </div>
          <Button className="w-full" variant="secondary" type="button" onClick={exportRecord}>
            <Download size={16} aria-hidden />
            Exportar registro
          </Button>
        </aside>
      </section>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-muted">{label}</dt>
      <dd className="mt-1 font-medium text-ink">{value}</dd>
    </div>
  );
}

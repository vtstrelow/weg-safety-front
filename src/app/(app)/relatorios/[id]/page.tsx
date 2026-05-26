import Link from "next/link";
import { ArrowLeft, ClipboardList, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logsApi } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default async function LogDetalhePage({ params }: { params: { id: string } }) {
  const log = await logsApi.detail(params.id);

  return (
    <>
      <PageHeader
        title="Detalhe do log"
        description="Registro de auditoria de acesso gerado pelo sistema."
        action={
          <Link
            href="/relatorios"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-ink"
          >
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
              <p className="text-sm text-muted">Retorno previsto de GET /api/logs/:id.</p>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <Info label="ID do log" value={log.id} />
            <Info label="Funcionário" value={`${log.funcionario.nome} · ${log.funcionario.matricula}`} />
            <Info label="Área" value={log.area.nome} />
            <Info label="Data/Hora" value={formatDateTime(log.ts_evento)} />
            <div>
              <dt className="text-xs font-semibold uppercase text-muted">Resultado</dt>
              <dd className="mt-1">
                <Badge tone={statusTone(log.resultado)}>{log.resultado}</Badge>
              </dd>
            </div>
            <Info label="Motivo" value={log.motivo || "Sem motivo de negação"} />
          </dl>
        </article>

        <aside className="surface self-start p-5">
          <div className="mb-4 flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 text-success" aria-hidden />
            <div>
              <h2 className="font-bold">Auditoria</h2>
              <p className="mt-1 text-sm text-muted">
                No backend, este registro deve ser imutável e exportável em CSV para rastreabilidade.
              </p>
            </div>
          </div>
          <Button className="w-full" variant="secondary">
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

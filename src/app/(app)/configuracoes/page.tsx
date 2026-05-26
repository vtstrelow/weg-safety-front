import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Table, Td, Th } from "@/components/data/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { cargosApi, epiTiposApi, setoresApi } from "@/lib/api";

export default async function ConfiguracoesPage() {
  const [cargos, setores, epiTipos] = await Promise.all([cargosApi.list(), setoresApi.list(), epiTiposApi.list()]);

  return (
    <>
      <PageHeader title="Configurações" description="Cadastros auxiliares usados nos formulários e regras do sistema." />

      <section className="grid gap-5 xl:grid-cols-3">
        <ConfigPanel title="Cargos" label="Novo cargo" rows={cargos.data.map((cargo) => ({ id: cargo.id, nome: cargo.nome, status: cargo.ativo ? "ATIVO" : "INATIVO" }))} />
        <ConfigPanel title="Setores" label="Novo setor" rows={setores.data.map((setor) => ({ id: setor.id, nome: setor.nome, status: setor.ativo ? "ATIVO" : "INATIVO" }))} />
        <ConfigPanel title="Tipos de EPI" label="Novo tipo de EPI" rows={epiTipos.data.map((epi) => ({ id: epi.id, nome: epi.nome, status: epi.ativo ? "ATIVO" : "INATIVO" }))} />
      </section>
    </>
  );
}

function ConfigPanel({
  title,
  label,
  rows
}: {
  title: string;
  label: string;
  rows: Array<{ id: string; nome: string; status: string }>;
}) {
  return (
    <article className="surface p-4">
      <h2 className="text-lg font-bold">{title}</h2>
      <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] xl:grid-cols-1">
        <Field label={label}>
          <Input />
        </Field>
        <Button type="button" className="self-end">
          <Plus size={16} aria-hidden />
          Adicionar
        </Button>
      </form>
      <div className="mt-4">
        <Table className="border-0">
          <thead className="bg-neutral-100 text-[11px] uppercase text-muted">
            <tr>
              <Th>Nome</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <Td className="font-semibold text-ink">{row.nome}</Td>
                <Td>
                  <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </article>
  );
}

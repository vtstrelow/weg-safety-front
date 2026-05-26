"use client";

import { FormEvent, useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Table, Td, Th } from "@/components/data/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { resetState, uid, type SafeAccessState } from "@/lib/local-store";
import { useSafeAccessStore } from "@/lib/use-safeaccess-store";

type ConfigCollection = "cargos" | "setores" | "epiTipos";

export default function ConfiguracoesPage() {
  const { state, ready, update, replace } = useSafeAccessStore();
  const [message, setMessage] = useState("");

  if (!ready || !state) {
    return <p className="text-sm font-semibold text-muted">Carregando configuracoes...</p>;
  }

  function addItem(collection: ConfigCollection, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nome = String(formData.get("nome") ?? "").trim();
    const descricao = String(formData.get("descricao") ?? "").trim();

    if (!nome) {
      setMessage("Informe um nome antes de adicionar.");
      return;
    }

    update((draft: SafeAccessState) => {
      draft[collection].push({
        id: uid(collection),
        nome,
        ativo: true,
        ...(collection === "epiTipos" && descricao ? { descricao } : {})
      });
    });
    form.reset();
    setMessage(`${nome} adicionado com sucesso.`);
  }

  function toggleItem(collection: ConfigCollection, id: string) {
    update((draft) => {
      const item = draft[collection].find((current) => current.id === id);
      if (item) {
        item.ativo = item.ativo === false;
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Configuracoes"
        description="Cadastros auxiliares usados nos formularios e regras do sistema."
        action={
          <Button type="button" variant="secondary" onClick={() => replace(resetState())}>
            <RotateCcw size={16} aria-hidden />
            Restaurar mocks
          </Button>
        }
      />

      {message ? <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p> : null}

      <section className="grid gap-5 xl:grid-cols-3">
        <ConfigPanel title="Cargos" label="Novo cargo" collection="cargos" rows={state.cargos.map((cargo) => ({ id: cargo.id, nome: cargo.nome, status: cargo.ativo === false ? "INATIVO" : "ATIVO" }))} onAdd={addItem} onToggle={toggleItem} />
        <ConfigPanel title="Setores" label="Novo setor" collection="setores" rows={state.setores.map((setor) => ({ id: setor.id, nome: setor.nome, status: setor.ativo === false ? "INATIVO" : "ATIVO" }))} onAdd={addItem} onToggle={toggleItem} />
        <ConfigPanel title="Tipos de EPI" label="Novo tipo de EPI" collection="epiTipos" withDescription rows={state.epiTipos.map((epi) => ({ id: epi.id, nome: epi.nome, status: epi.ativo === false ? "INATIVO" : "ATIVO" }))} onAdd={addItem} onToggle={toggleItem} />
      </section>
    </>
  );
}

function ConfigPanel({
  title,
  label,
  collection,
  rows,
  withDescription = false,
  onAdd,
  onToggle
}: {
  title: string;
  label: string;
  collection: ConfigCollection;
  rows: Array<{ id: string; nome: string; status: string }>;
  withDescription?: boolean;
  onAdd: (collection: ConfigCollection, event: FormEvent<HTMLFormElement>) => void;
  onToggle: (collection: ConfigCollection, id: string) => void;
}) {
  return (
    <article className="surface p-4">
      <h2 className="text-lg font-bold">{title}</h2>
      <form onSubmit={(event) => onAdd(collection, event)} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] xl:grid-cols-1">
        <Field label={label}>
          <Input name="nome" required />
        </Field>
        {withDescription ? (
          <Field label="Descricao">
            <Input name="descricao" />
          </Field>
        ) : null}
        <Button type="submit" className="self-end">
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
              <Th>Acoes</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <Td className="font-semibold text-ink">{row.nome}</Td>
                <Td>
                  <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                </Td>
                <Td>
                  <button type="button" onClick={() => onToggle(collection, row.id)} className="rounded-md border border-line p-2 text-muted transition hover:border-danger hover:text-danger" aria-label={row.status === "ATIVO" ? "Desativar" : "Reativar"}>
                    <Trash2 size={14} aria-hidden />
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </article>
  );
}

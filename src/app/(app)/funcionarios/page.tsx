"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, CreditCard, Edit3, Eye, Filter, Plus, Search, ToggleLeft, ToggleRight, UserX } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/data/pagination";
import { Table, Td, Th } from "@/components/data/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { funcionarioResumo, pushLog } from "@/lib/local-store";
import { useSafeAccessStore } from "@/lib/use-safeaccess-store";
import { initials } from "@/lib/utils";

export default function FuncionariosPage() {
  const { state, ready, update } = useSafeAccessStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [setor, setSetor] = useState("");
  const [cargo, setCargo] = useState("");

  const funcionarios = useMemo(() => (state?.funcionarios ?? []).map(funcionarioResumo), [state]);
  const filtered = useMemo(
    () =>
      funcionarios.filter((funcionario) => {
        const term = search.trim().toLowerCase();
        const matchesSearch = !term || `${funcionario.nome} ${funcionario.matricula}`.toLowerCase().includes(term);
        const matchesStatus = !status || funcionario.status === status;
        const matchesSetor = !setor || funcionario.setor === setor;
        const matchesCargo = !cargo || funcionario.cargo === cargo;
        return matchesSearch && matchesStatus && matchesSetor && matchesCargo;
      }),
    [cargo, funcionarios, search, setor, status]
  );

  if (!ready || !state) {
    return <p className="text-sm font-semibold text-muted">Carregando funcionarios...</p>;
  }

  const ativos = funcionarios.filter((funcionario) => funcionario.status === "ATIVO").length;
  const inativos = funcionarios.filter((funcionario) => funcionario.status === "INATIVO").length;
  const crachasAtivos = funcionarios.filter((funcionario) => funcionario.cracha.status === "ATIVO").length;

  function toggleStatus(id: string) {
    update((draft) => {
      const funcionario = draft.funcionarios.find((item) => item.id === id);

      if (!funcionario) {
        return;
      }

      funcionario.status = funcionario.status === "ATIVO" ? "INATIVO" : "ATIVO";
      if (funcionario.status === "INATIVO") {
        funcionario.cracha.status = "INATIVO";
      }

      pushLog(draft, {
        funcionario_nome: funcionario.nome,
        area_nome: "Cadastro de funcionarios",
        resultado: funcionario.status === "ATIVO" ? "PERMITIDO" : "NEGADO",
        motivo: funcionario.status === "ATIVO" ? "Funcionario reativado" : "Funcionario desativado"
      });
    });
  }

  return (
    <>
      <PageHeader
        title="Funcionarios"
        description="Gestao de pessoas, vinculo funcional, cracha e status de acesso."
        action={
          <Link
            href="/funcionarios/novo"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-ink bg-ink px-4 text-sm font-semibold text-white transition hover:bg-black sm:w-auto"
          >
            <Plus size={16} aria-hidden />
            Novo funcionario
          </Link>
        }
      />

      <section className="mb-5 grid gap-3 md:grid-cols-3">
        <SummaryCard icon={<BadgeCheck size={18} aria-hidden />} label="Ativos" value={ativos} tone="success" />
        <SummaryCard icon={<UserX size={18} aria-hidden />} label="Inativos" value={inativos} tone="danger" />
        <SummaryCard icon={<CreditCard size={18} aria-hidden />} label="Crachas ativos" value={crachasAtivos} tone="neutral" />
      </section>

      <section className="panel mb-5 grid gap-3 p-4 lg:grid-cols-[1fr_160px_160px_160px_auto]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou matricula" className="pl-9" />
        </div>
        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Status</option>
          <option value="ATIVO">ATIVO</option>
          <option value="INATIVO">INATIVO</option>
        </Select>
        <Select value={setor} onChange={(event) => setSetor(event.target.value)}>
          <option value="">Setor</option>
          {state.setores.map((item) => (
            <option key={item.id} value={item.nome}>
              {item.nome}
            </option>
          ))}
        </Select>
        <Select value={cargo} onChange={(event) => setCargo(event.target.value)}>
          <option value="">Cargo</option>
          {state.cargos.map((item) => (
            <option key={item.id} value={item.nome}>
              {item.nome}
            </option>
          ))}
        </Select>
        <Button
          type="button"
          onClick={() => {
            setSearch("");
            setStatus("");
            setSetor("");
            setCargo("");
          }}
        >
          <Filter size={16} aria-hidden />
          Limpar
        </Button>
      </section>

      <Table>
        <thead className="table-head">
          <tr>
            <Th>Foto</Th>
            <Th>Nome</Th>
            <Th>Matricula</Th>
            <Th>Cargo</Th>
            <Th>Setor</Th>
            <Th>Status</Th>
            <Th>Acoes</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((funcionario) => (
            <tr key={funcionario.id}>
              <Td>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold">
                  {initials(funcionario.nome)}
                </div>
              </Td>
              <Td className="font-semibold text-ink">{funcionario.nome}</Td>
              <Td>{funcionario.matricula}</Td>
              <Td>{funcionario.cargo}</Td>
              <Td>{funcionario.setor}</Td>
              <Td>
                <Badge tone={statusTone(funcionario.status)}>{funcionario.status}</Badge>
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <Link href={`/funcionarios/${funcionario.id}`} className="rounded-md border border-line p-2 text-muted transition hover:border-ink hover:text-ink" aria-label="Visualizar funcionario">
                    <Eye size={15} aria-hidden />
                  </Link>
                  <Link href={`/funcionarios/${funcionario.id}`} className="rounded-md border border-line p-2 text-muted transition hover:border-ink hover:text-ink" aria-label="Editar funcionario">
                    <Edit3 size={15} aria-hidden />
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleStatus(funcionario.id)}
                    className="rounded-md border border-line p-2 text-muted transition hover:border-ink hover:text-ink"
                    aria-label={funcionario.status === "ATIVO" ? "Desativar funcionario" : "Reativar funcionario"}
                  >
                    {funcionario.status === "ATIVO" ? <ToggleRight size={15} aria-hidden /> : <ToggleLeft size={15} aria-hidden />}
                  </button>
                </div>
              </Td>
            </tr>
          ))}
          {!filtered.length ? (
            <tr>
              <Td colSpan={7}>Nenhum funcionario encontrado com os filtros atuais.</Td>
            </tr>
          ) : null}
        </tbody>
      </Table>

      <Pagination totalLabel={`Exibindo ${filtered.length} de ${funcionarios.length} registros`} />
    </>
  );
}

function SummaryCard({
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

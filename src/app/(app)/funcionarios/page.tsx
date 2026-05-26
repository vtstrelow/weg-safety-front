import Link from "next/link";
import { BadgeCheck, CreditCard, Edit3, Eye, Filter, Plus, Search, UserX } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/data/pagination";
import { Table, Td, Th } from "@/components/data/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { funcionariosApi } from "@/lib/api";
import { initials } from "@/lib/utils";

export default async function FuncionariosPage() {
  const response = await funcionariosApi.list();
  const ativos = response.data.filter((funcionario) => funcionario.status === "ATIVO").length;
  const inativos = response.data.filter((funcionario) => funcionario.status === "INATIVO").length;
  const crachasAtivos = response.data.filter((funcionario) => funcionario.cracha.status === "ATIVO").length;

  return (
    <>
      <PageHeader
        title="Funcionários"
        description="Gestão de pessoas, vínculo funcional, crachá e status de acesso."
        action={
          <Link
            href="/funcionarios/novo"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-ink bg-ink px-4 text-sm font-semibold text-white transition hover:bg-black sm:w-auto"
          >
            <Plus size={16} aria-hidden />
            Novo funcionário
          </Link>
        }
      />

      <section className="mb-5 grid gap-3 md:grid-cols-3">
        <SummaryCard icon={<BadgeCheck size={18} aria-hidden />} label="Ativos" value={ativos} tone="success" />
        <SummaryCard icon={<UserX size={18} aria-hidden />} label="Inativos" value={inativos} tone="danger" />
        <SummaryCard icon={<CreditCard size={18} aria-hidden />} label="Crachás ativos" value={crachasAtivos} tone="neutral" />
      </section>

      <section className="panel mb-5 grid gap-3 p-4 lg:grid-cols-[1fr_160px_160px_160px_auto]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <Input placeholder="Nome ou matrícula" className="pl-9" />
        </div>
        <Select defaultValue="">
          <option value="">Status</option>
          <option>ATIVO</option>
          <option>INATIVO</option>
        </Select>
        <Select defaultValue="">
          <option value="">Setor</option>
          <option>Tecnologia</option>
          <option>Produção</option>
          <option>Qualidade</option>
        </Select>
        <Select defaultValue="">
          <option value="">Cargo</option>
          <option>Analista TI</option>
          <option>Operador</option>
          <option>Supervisora</option>
        </Select>
        <Button>
          <Filter size={16} aria-hidden />
          Filtrar
        </Button>
      </section>

      <Table>
        <thead className="table-head">
          <tr>
            <Th>Foto</Th>
            <Th>Nome</Th>
            <Th>Matrícula</Th>
            <Th>Cargo</Th>
            <Th>Setor</Th>
            <Th>Status</Th>
            <Th>Ações</Th>
          </tr>
        </thead>
        <tbody>
          {response.data.map((funcionario) => (
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
                  <Link
                    href={`/funcionarios/${funcionario.id}`}
                    className="rounded-md border border-line p-2 text-muted transition hover:border-ink hover:text-ink"
                    aria-label="Visualizar funcionário"
                  >
                    <Eye size={15} aria-hidden />
                  </Link>
                  <Link
                    href={`/funcionarios/${funcionario.id}`}
                    className="rounded-md border border-line p-2 text-muted transition hover:border-ink hover:text-ink"
                    aria-label="Editar funcionário"
                  >
                    <Edit3 size={15} aria-hidden />
                  </Link>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination totalLabel={`Exibindo ${response.data.length} de ${response.total} registros`} />
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

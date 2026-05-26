import Link from "next/link";
import { AlertTriangle, DoorOpen, Filter, Lock, Plus, Search, Settings2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/data/pagination";
import { Table, Td, Th } from "@/components/data/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { areasApi } from "@/lib/api";

export default async function AreasPage() {
  const response = await areasApi.list();
  const liberadas = response.data.filter((area) => area.status === "LIBERADA").length;
  const restritas = response.data.filter((area) => area.status === "RESTRITA").length;
  const totalPessoas = response.data.reduce((total, area) => total + area.total_autorizados, 0);

  return (
    <>
      <PageHeader
        title="Áreas"
        description="Mapa de áreas, regras de acesso, EPIs obrigatórios e bloqueios."
        action={
          <Link
            href="/areas/nova"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-ink bg-ink px-4 text-sm font-semibold text-white transition hover:bg-black sm:w-auto"
          >
            <Plus size={16} aria-hidden />
            Nova área
          </Link>
        }
      />

      <section className="mb-5 grid gap-3 md:grid-cols-3">
        <AreaSummary icon={<ShieldCheck size={18} aria-hidden />} label="Liberadas" value={liberadas} tone="success" />
        <AreaSummary icon={<AlertTriangle size={18} aria-hidden />} label="Restritas" value={restritas} tone="warning" />
        <AreaSummary icon={<DoorOpen size={18} aria-hidden />} label="Autorizados" value={totalPessoas} tone="neutral" />
      </section>

      <section className="panel mb-5 grid gap-3 p-4 lg:grid-cols-[1fr_180px_180px_auto]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <Input placeholder="Buscar área..." className="pl-9" />
        </div>
        <Select defaultValue="">
          <option value="">Risco: Todos</option>
          <option>Baixo</option>
          <option>Médio</option>
          <option>Alto</option>
          <option>Crítico</option>
        </Select>
        <Select defaultValue="">
          <option value="">Status: Todos</option>
          <option>LIBERADA</option>
          <option>RESTRITA</option>
          <option>BLOQUEADA</option>
        </Select>
        <Button>
          <Filter size={16} aria-hidden />
          Filtrar
        </Button>
      </section>

      <Table>
        <thead className="bg-neutral-100 text-[11px] uppercase text-muted">
          <tr>
            <Th>Área</Th>
            <Th>Risco</Th>
            <Th>Status</Th>
            <Th>Pessoas</Th>
            <Th>EPIs obrigatórios</Th>
            <Th>Ações</Th>
          </tr>
        </thead>
        <tbody>
          {response.data.map((area) => (
            <tr key={area.id}>
              <Td className="font-semibold text-ink">{area.nome}</Td>
              <Td>
                <Badge tone={statusTone(area.nivel_risco)}>{area.nivel_risco}</Badge>
              </Td>
              <Td>
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {area.status}
                </span>
              </Td>
              <Td>{area.total_autorizados}</Td>
              <Td>{area.epis_obrigatorios.join(" · ")}</Td>
              <Td>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/areas/${area.id}`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-ink"
                  >
                    <Settings2 size={15} aria-hidden />
                    Regras
                  </Link>
                  <Button variant={area.status === "BLOQUEADA" ? "secondary" : "danger"} className="h-9">
                    <Lock size={15} aria-hidden />
                    Bloquear
                  </Button>
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

function AreaSummary({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "success" | "warning" | "neutral";
}) {
  const tones = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
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

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, DoorOpen, Filter, Lock, Plus, Search, Settings2, ShieldCheck, Unlock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/data/pagination";
import { Table, Td, Th } from "@/components/data/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { areaResumo, pushLog } from "@/lib/local-store";
import { useSafeAccessStore } from "@/lib/use-safeaccess-store";

export default function AreasPage() {
  const { state, ready, update } = useSafeAccessStore();
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("");
  const [status, setStatus] = useState("");

  const areas = useMemo(() => (state?.areas ?? []).map(areaResumo), [state]);
  const filtered = useMemo(
    () =>
      areas.filter((area) => {
        const term = search.trim().toLowerCase();
        const matchesSearch = !term || `${area.nome} ${area.codigo}`.toLowerCase().includes(term);
        const matchesRisk = !risk || area.nivel_risco === risk;
        const matchesStatus = !status || area.status === status;
        return matchesSearch && matchesRisk && matchesStatus;
      }),
    [areas, risk, search, status]
  );

  if (!ready || !state) {
    return <p className="text-sm font-semibold text-muted">Carregando areas...</p>;
  }

  const liberadas = areas.filter((area) => area.status === "LIBERADA").length;
  const restritas = areas.filter((area) => area.status === "RESTRITA").length;
  const totalPessoas = areas.reduce((total, area) => total + area.total_autorizados, 0);

  function toggleBlock(id: string) {
    update((draft) => {
      const area = draft.areas.find((item) => item.id === id);

      if (!area) {
        return;
      }

      const blocked = area.status === "BLOQUEADA";
      area.status = blocked ? "LIBERADA" : "BLOQUEADA";
      pushLog(draft, {
        funcionario_nome: "Administrador",
        area_nome: area.nome,
        resultado: blocked ? "PERMITIDO" : "NEGADO",
        motivo: blocked ? "Area liberada manualmente" : "Bloqueio emergencial de area"
      });
    });
  }

  return (
    <>
      <PageHeader
        title="Areas"
        description="Mapa de areas, regras de acesso, EPIs obrigatorios e bloqueios."
        action={
          <Link href="/areas/nova" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-ink bg-ink px-4 text-sm font-semibold text-white transition hover:bg-black sm:w-auto">
            <Plus size={16} aria-hidden />
            Nova area
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
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar area..." className="pl-9" />
        </div>
        <Select value={risk} onChange={(event) => setRisk(event.target.value)}>
          <option value="">Risco: Todos</option>
          {[...new Set(areas.map((area) => area.nivel_risco))].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Status: Todos</option>
          <option value="LIBERADA">LIBERADA</option>
          <option value="RESTRITA">RESTRITA</option>
          <option value="BLOQUEADA">BLOQUEADA</option>
        </Select>
        <Button
          type="button"
          onClick={() => {
            setSearch("");
            setRisk("");
            setStatus("");
          }}
        >
          <Filter size={16} aria-hidden />
          Limpar
        </Button>
      </section>

      <Table>
        <thead className="bg-neutral-100 text-[11px] uppercase text-muted">
          <tr>
            <Th>Area</Th>
            <Th>Risco</Th>
            <Th>Status</Th>
            <Th>Pessoas</Th>
            <Th>EPIs obrigatorios</Th>
            <Th>Acoes</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((area) => (
            <tr key={area.id}>
              <Td className="font-semibold text-ink">{area.nome}</Td>
              <Td>
                <Badge tone={statusTone(area.nivel_risco)}>{area.nivel_risco}</Badge>
              </Td>
              <Td>
                <Badge tone={statusTone(area.status)}>{area.status}</Badge>
              </Td>
              <Td>{area.total_autorizados}</Td>
              <Td>{area.epis_obrigatorios.join(" - ")}</Td>
              <Td>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/areas/${area.id}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-ink">
                    <Settings2 size={15} aria-hidden />
                    Regras
                  </Link>
                  <Button type="button" variant={area.status === "BLOQUEADA" ? "secondary" : "danger"} className="h-9" onClick={() => toggleBlock(area.id)}>
                    {area.status === "BLOQUEADA" ? <Unlock size={15} aria-hidden /> : <Lock size={15} aria-hidden />}
                    {area.status === "BLOQUEADA" ? "Liberar" : "Bloquear"}
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
          {!filtered.length ? (
            <tr>
              <Td colSpan={6}>Nenhuma area encontrada.</Td>
            </tr>
          ) : null}
        </tbody>
      </Table>

      <Pagination totalLabel={`Exibindo ${filtered.length} de ${areas.length} registros`} />
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

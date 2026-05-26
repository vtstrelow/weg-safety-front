"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Download, Eye, Filter, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/data/pagination";
import { Table, Td, Th } from "@/components/data/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { downloadTextFile, toCsv } from "@/lib/local-store";
import { useSafeAccessStore } from "@/lib/use-safeaccess-store";
import { formatDateTime, initials } from "@/lib/utils";

export default function RelatoriosPage() {
  const { state, ready } = useSafeAccessStore();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [area, setArea] = useState("");
  const [resultado, setResultado] = useState("");
  const [exportMessage, setExportMessage] = useState("");

  const filtered = useMemo(() => {
    const logs = state?.logs ?? [];
    return logs.filter((log) => {
      const date = log.ts_evento.slice(0, 10);
      const matchesStart = !startDate || date >= startDate;
      const matchesEnd = !endDate || date <= endDate;
      const matchesArea = !area || log.area_nome === area;
      const matchesResultado = !resultado || log.resultado === resultado;
      return matchesStart && matchesEnd && matchesArea && matchesResultado;
    });
  }, [area, endDate, resultado, startDate, state]);

  if (!ready || !state) {
    return <p className="text-sm font-semibold text-muted">Carregando relatorios...</p>;
  }

  const permitidos = filtered.filter((log) => log.resultado === "PERMITIDO").length;
  const negados = filtered.filter((log) => log.resultado === "NEGADO").length;
  const areas = [...new Set(state.logs.map((log) => log.area_nome))];

  function exportCsv() {
    const rows = filtered.map((log) => ({
      funcionario: log.funcionario_nome,
      area: log.area_nome,
      resultado: log.resultado,
      motivo: log.motivo || "-",
      data_hora: formatDateTime(log.ts_evento)
    }));
    const csv = toCsv(rows, [
      { key: "funcionario", label: "Funcionario" },
      { key: "area", label: "Area" },
      { key: "resultado", label: "Resultado" },
      { key: "motivo", label: "Motivo" },
      { key: "data_hora", label: "Data/Hora" }
    ]);
    const filenameDate = new Date().toISOString().slice(0, 10);

    downloadTextFile(`logs_acesso_${filenameDate}.csv`, csv, "text/csv;charset=utf-8");
    setExportMessage(
      filtered.length
        ? `CSV exportado com ${filtered.length} registro${filtered.length === 1 ? "" : "s"}.`
        : "CSV exportado apenas com cabecalhos, pois o filtro atual nao possui registros."
    );
  }

  return (
    <>
      <PageHeader
        title="Logs de Acesso"
        description="Auditoria de liberacoes, negacoes e motivos registrados pelo sistema."
        action={
          <Button type="button" variant="secondary" onClick={exportCsv}>
            <Download size={16} aria-hidden />
            Exportar CSV
          </Button>
        }
      />

      <section className="mb-5 grid gap-3 md:grid-cols-3">
        <ReportSummary icon={<Download size={18} aria-hidden />} label="Eventos" value={filtered.length} tone="neutral" />
        <ReportSummary icon={<CheckCircle2 size={18} aria-hidden />} label="Permitidos" value={permitidos} tone="success" />
        <ReportSummary icon={<ShieldAlert size={18} aria-hidden />} label="Negados" value={negados} tone="danger" />
      </section>

      {exportMessage ? (
        <p className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {exportMessage}
        </p>
      ) : null}

      <section className="panel mb-5 grid gap-3 p-4 lg:grid-cols-[160px_160px_1fr_180px_auto]">
        <Input type="date" aria-label="Data inicio" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        <Input type="date" aria-label="Data fim" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        <Select value={area} onChange={(event) => setArea(event.target.value)}>
          <option value="">Area</option>
          {areas.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={resultado} onChange={(event) => setResultado(event.target.value)}>
          <option value="">Resultado</option>
          <option value="PERMITIDO">PERMITIDO</option>
          <option value="NEGADO">NEGADO</option>
        </Select>
        <Button
          type="button"
          onClick={() => {
            setStartDate("");
            setEndDate("");
            setArea("");
            setResultado("");
          }}
        >
          <Filter size={16} aria-hidden />
          Limpar
        </Button>
      </section>

      <Table>
        <thead className="table-head">
          <tr>
            <Th>Funcionario</Th>
            <Th>Area</Th>
            <Th>Resultado</Th>
            <Th>Motivo</Th>
            <Th>Data/Hora</Th>
            <Th>Acoes</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((log) => (
            <tr key={log.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold">
                    {initials(log.funcionario_nome)}
                  </span>
                  <strong className="text-ink">{log.funcionario_nome}</strong>
                </div>
              </Td>
              <Td>{log.area_nome}</Td>
              <Td>
                <Badge tone={statusTone(log.resultado)}>{log.resultado}</Badge>
              </Td>
              <Td className={log.resultado === "NEGADO" ? "font-semibold text-danger" : ""}>{log.motivo || "-"}</Td>
              <Td>{formatDateTime(log.ts_evento)}</Td>
              <Td>
                <Link href={`/relatorios/${log.id}`} className="inline-flex rounded-md border border-line p-2 text-muted transition hover:border-ink hover:text-ink" aria-label="Ver detalhe do log">
                  <Eye size={15} aria-hidden />
                </Link>
              </Td>
            </tr>
          ))}
          {!filtered.length ? (
            <tr>
              <Td colSpan={6}>Nenhum log encontrado para os filtros atuais.</Td>
            </tr>
          ) : null}
        </tbody>
      </Table>

      <Pagination totalLabel={`Exibindo ${filtered.length} de ${state.logs.length} registros`} />
    </>
  );
}

function ReportSummary({
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

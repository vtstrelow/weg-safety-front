"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock, Lock, Plus, ShieldCheck, Trash2, Unlock, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Table, Td, Th } from "@/components/data/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { pushLog, uid } from "@/lib/local-store";
import { useSafeAccessStore } from "@/lib/use-safeaccess-store";

export default function AreaDetalhePage({ params }: { params: { id: string } }) {
  const { state, ready, update } = useSafeAccessStore();
  const [message, setMessage] = useState("");
  const area = state?.areas.find((item) => item.id === params.id);

  if (!ready || !state) {
    return <p className="text-sm font-semibold text-muted">Carregando area...</p>;
  }

  if (!area) {
    return (
      <>
        <PageHeader title="Area nao encontrada" description="O registro pode ter sido removido localmente." />
        <Link href="/areas" className="text-sm font-semibold text-ink underline">
          Voltar para areas
        </Link>
      </>
    );
  }

  const currentState = state;
  const areaId = area.id;

  const permitidos = area.whitelist.map((permission) => {
    const funcionario = currentState.funcionarios.find((item) => item.id === permission.funcionario_id);
    const episValidos = Boolean(funcionario?.epis.every((epi) => epi.status === "ATIVO"));
    return {
      id: permission.funcionario_id,
      nome: permission.nome,
      matricula: funcionario?.matricula ?? "-",
      cargo: permission.cargo ?? funcionario?.cargo.nome ?? "-",
      tipo_permissao: "WHITELIST",
      epis_validos: episValidos
    };
  });

  function toggleBlock() {
    update((draft) => {
      const current = draft.areas.find((item) => item.id === areaId);

      if (!current) {
        return;
      }

      const blocked = current.status === "BLOQUEADA";
      current.status = blocked ? "LIBERADA" : "BLOQUEADA";
      pushLog(draft, {
        funcionario_nome: "Administrador",
        area_nome: current.nome,
        resultado: blocked ? "PERMITIDO" : "NEGADO",
        motivo: blocked ? "Area liberada manualmente" : "Bloqueio emergencial de area"
      });
    });
  }

  function addPermission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const funcionarioId = String(formData.get("funcionario_id") ?? "");
    const tipo = String(formData.get("tipo") ?? "WHITELIST");
    const motivo = String(formData.get("motivo") ?? "");
    const funcionario = currentState.funcionarios.find((item) => item.id === funcionarioId);

    if (!funcionario) {
      setMessage("Selecione um funcionario.");
      return;
    }

    if (tipo === "BLACKLIST" && !motivo.trim()) {
      setMessage("Informe o motivo da blacklist.");
      return;
    }

    update((draft) => {
      const current = draft.areas.find((item) => item.id === areaId);

      if (!current) {
        return;
      }

      current.whitelist = current.whitelist.filter((item) => item.funcionario_id !== funcionarioId);
      current.blacklist = current.blacklist.filter((item) => item.funcionario_id !== funcionarioId);

      if (tipo === "BLACKLIST") {
        current.blacklist.push({ id: uid("perm"), funcionario_id: funcionario.id, nome: funcionario.nome, motivo });
      } else {
        current.whitelist.push({ id: uid("perm"), funcionario_id: funcionario.id, nome: funcionario.nome, cargo: funcionario.cargo.nome });
      }

      pushLog(draft, {
        funcionario_nome: funcionario.nome,
        area_nome: current.nome,
        resultado: tipo === "BLACKLIST" ? "NEGADO" : "PERMITIDO",
        motivo: tipo === "BLACKLIST" ? motivo : "Permissao adicionada"
      });
    });

    event.currentTarget.reset();
    setMessage("Permissao atualizada.");
  }

  function removePermission(permissionId: string, list: "whitelist" | "blacklist") {
    update((draft) => {
      const current = draft.areas.find((item) => item.id === areaId);
      if (!current) return;
      if (list === "whitelist") {
        current.whitelist = current.whitelist.filter((permission) => permission.id !== permissionId);
      } else {
        current.blacklist = current.blacklist.filter((permission) => permission.id !== permissionId);
      }
    });
  }

  function addSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const horaInicio = String(formData.get("hora_inicio") ?? "");
    const horaFim = String(formData.get("hora_fim") ?? "");

    if (horaFim <= horaInicio) {
      setMessage("A hora final deve ser posterior a hora inicial.");
      return;
    }

    update((draft) => {
      const current = draft.areas.find((item) => item.id === areaId);
      if (!current) return;
      current.restricoes_horario.push({
        id: uid("hor"),
        dias: String(formData.get("dias") ?? ""),
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        perfil: String(formData.get("perfil") ?? "")
      });
    });
    event.currentTarget.reset();
    setMessage("Janela de horario adicionada.");
  }

  function removeSchedule(id: string) {
    update((draft) => {
      const current = draft.areas.find((item) => item.id === areaId);
      if (!current) return;
      current.restricoes_horario = current.restricoes_horario.filter((horario) => horario.id !== id);
    });
  }

  return (
    <>
      <PageHeader
        title={area.nome}
        description={`${area.codigo} - ${area.tipo} - risco ${area.nivel_risco.toLowerCase()}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/areas" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-ink">
              <ArrowLeft size={16} aria-hidden />
              Voltar
            </Link>
            <Button type="button" variant={area.status === "BLOQUEADA" ? "secondary" : "danger"} onClick={toggleBlock}>
              {area.status === "BLOQUEADA" ? <Unlock size={16} aria-hidden /> : <Lock size={16} aria-hidden />}
              {area.status === "BLOQUEADA" ? "Liberar area" : "Bloquear area"}
            </Button>
          </div>
        }
      />

      {message ? <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p> : null}

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          <article className="surface p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
                <ShieldCheck size={18} aria-hidden />
              </span>
              <div>
                <h2 className="font-bold">Configuracao da area</h2>
                <p className="text-sm text-muted">Parametros usados na validacao de acesso.</p>
              </div>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Status" value={area.status} badge />
              <Info label="Capacidade maxima" value={`${area.capacidade_maxima} pessoas`} />
              <Info label="Anti-passback" value={area.anti_passback ? "Ativo" : "Inativo"} />
              <Info label="Verificar EPIs" value={area.verificar_epi ? "Ativo" : "Inativo"} />
              <Info label="Fail-open" value={area.fail_open ? "Ativo" : "Inativo"} />
              <Info label="EPIs obrigatorios" value={area.epis_obrigatorios.map((epi) => epi.nome).join(", ")} />
            </dl>
          </article>

          <article className="surface p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
                <Users size={18} aria-hidden />
              </span>
              <div>
                <h2 className="font-bold">Funcionarios autorizados</h2>
                <p className="text-sm text-muted">Lista branca atual e validade de EPIs.</p>
              </div>
            </div>

            <Table className="border-0">
              <thead className="bg-neutral-100 text-[11px] uppercase text-muted">
                <tr>
                  <Th>Nome</Th>
                  <Th>Matricula</Th>
                  <Th>Cargo</Th>
                  <Th>Permissao</Th>
                  <Th>EPIs</Th>
                  <Th>Acoes</Th>
                </tr>
              </thead>
              <tbody>
                {permitidos.map((funcionario) => (
                  <tr key={funcionario.id}>
                    <Td className="font-semibold text-ink">{funcionario.nome}</Td>
                    <Td>{funcionario.matricula}</Td>
                    <Td>{funcionario.cargo}</Td>
                    <Td>
                      <Badge>{funcionario.tipo_permissao}</Badge>
                    </Td>
                    <Td>
                      <Badge tone={funcionario.epis_validos ? "success" : "danger"}>{funcionario.epis_validos ? "Validos" : "Pendentes"}</Badge>
                    </Td>
                    <Td>
                      <button type="button" onClick={() => removePermission(area.whitelist.find((item) => item.funcionario_id === funcionario.id)?.id ?? "", "whitelist")} className="rounded-md border border-line p-2 text-muted hover:text-danger">
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </Td>
                  </tr>
                ))}
                {!permitidos.length ? (
                  <tr>
                    <Td colSpan={6}>Nenhum funcionario autorizado.</Td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </article>

          <article className="surface p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
                <CalendarClock size={18} aria-hidden />
              </span>
              <div>
                <h2 className="font-bold">Janelas horarias</h2>
                <p className="text-sm text-muted">Restricoes por perfil, dia da semana e horario.</p>
              </div>
            </div>

            <form onSubmit={addSchedule} className="mb-4 grid gap-3 md:grid-cols-[1fr_130px_130px_1fr_auto]">
              <Input name="dias" placeholder="Dias" required />
              <Input name="hora_inicio" type="time" required />
              <Input name="hora_fim" type="time" required />
              <Input name="perfil" placeholder="Perfil" required />
              <Button type="submit" variant="secondary">
                <Plus size={15} aria-hidden />
                Adicionar
              </Button>
            </form>

            <Table className="border-0">
              <thead className="bg-neutral-100 text-[11px] uppercase text-muted">
                <tr>
                  <Th>Dias</Th>
                  <Th>Inicio</Th>
                  <Th>Fim</Th>
                  <Th>Perfil</Th>
                  <Th>Acoes</Th>
                </tr>
              </thead>
              <tbody>
                {area.restricoes_horario.map((horario) => (
                  <tr key={horario.id}>
                    <Td>{horario.dias}</Td>
                    <Td>{horario.hora_inicio}</Td>
                    <Td>{horario.hora_fim}</Td>
                    <Td>{horario.perfil}</Td>
                    <Td>
                      <button type="button" onClick={() => removeSchedule(horario.id)} className="rounded-md border border-line p-2 text-muted hover:text-danger">
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </article>
        </div>

        <aside className="grid gap-5 self-start">
          <article className="surface p-5">
            <h2 className="font-bold">Adicionar permissao</h2>
            <form onSubmit={addPermission} className="mt-4 grid gap-3">
              <Field label="Funcionario">
                <Select name="funcionario_id" defaultValue="" required>
                  <option value="">Selecione</option>
                  {state.funcionarios.map((funcionario) => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tipo">
                <Select name="tipo" defaultValue="WHITELIST">
                  <option value="WHITELIST">Whitelist</option>
                  <option value="BLACKLIST">Blacklist</option>
                </Select>
              </Field>
              <Field label="Motivo da blacklist">
                <Input name="motivo" placeholder="Obrigatorio se for bloqueio" />
              </Field>
              <Button type="submit">
                <Plus size={16} aria-hidden />
                Adicionar
              </Button>
            </form>
          </article>

          <article className="surface p-5">
            <h2 className="mb-4 font-bold">Blacklist atual</h2>
            <div className="grid gap-3">
              {area.blacklist.map((item) => (
                <div key={item.id} className="rounded-md border border-line bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="text-sm">{item.nome}</strong>
                      <p className="mt-1 text-sm text-muted">{item.motivo}</p>
                    </div>
                    <button type="button" onClick={() => removePermission(item.id, "blacklist")} className="rounded-md border border-line p-2 text-muted hover:text-danger">
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </div>
                </div>
              ))}
              {!area.blacklist.length ? <p className="text-sm text-muted">Nenhum bloqueio cadastrado.</p> : null}
            </div>
          </article>
        </aside>
      </section>
    </>
  );
}

function Info({ label, value, badge = false }: { label: string; value: string; badge?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-muted">{label}</dt>
      <dd className="mt-1 font-medium text-ink">{badge ? <Badge tone={statusTone(value)}>{value}</Badge> : value}</dd>
    </div>
  );
}

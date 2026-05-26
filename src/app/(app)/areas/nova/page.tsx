"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Table, Td, Th } from "@/components/data/table";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { pushLog, uid } from "@/lib/local-store";
import { useSafeAccessStore } from "@/lib/use-safeaccess-store";

type ScheduleDraft = {
  id: string;
  dias: string;
  hora_inicio: string;
  hora_fim: string;
  perfil: string;
};

export default function NovaAreaPage() {
  const router = useRouter();
  const { state, ready, update } = useSafeAccessStore();
  const [message, setMessage] = useState("");
  const [blacklistFuncionario, setBlacklistFuncionario] = useState("");
  const [blacklistMotivo, setBlacklistMotivo] = useState("");
  const [blacklist, setBlacklist] = useState<Array<{ id: string; funcionario_id: string; nome: string; motivo: string }>>([]);
  const [schedule, setSchedule] = useState<ScheduleDraft>({ id: uid("hor"), dias: "", hora_inicio: "", hora_fim: "", perfil: "" });
  const [schedules, setSchedules] = useState<ScheduleDraft[]>([
    { id: uid("hor"), dias: "Seg-Sex", hora_inicio: "06:00", hora_fim: "22:00", perfil: "Operacoes" }
  ]);

  if (!ready || !state) {
    return <p className="text-sm font-semibold text-muted">Carregando cadastro de area...</p>;
  }

  const currentState = state;

  function addBlacklist() {
    const funcionario = currentState.funcionarios.find((item) => item.id === blacklistFuncionario);

    if (!funcionario || !blacklistMotivo.trim()) {
      setMessage("Escolha uma pessoa e informe o motivo do bloqueio.");
      return;
    }

    setBlacklist((current) => [
      ...current,
      {
        id: uid("perm"),
        funcionario_id: funcionario.id,
        nome: funcionario.nome,
        motivo: blacklistMotivo
      }
    ]);
    setBlacklistFuncionario("");
    setBlacklistMotivo("");
  }

  function addSchedule() {
    if (!schedule.dias || !schedule.hora_inicio || !schedule.hora_fim || !schedule.perfil) {
      setMessage("Preencha dias, inicio, fim e perfil da janela.");
      return;
    }

    if (schedule.hora_fim <= schedule.hora_inicio) {
      setMessage("A hora final deve ser posterior a hora inicial.");
      return;
    }

    setSchedules((current) => [...current, schedule]);
    setSchedule({ id: uid("hor"), dias: "", hora_inicio: "", hora_fim: "", perfil: "" });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const id = uid("area");
    const epiIds = formData.getAll("epis_obrigatorios").map(String);
    const whitelistIds = formData.getAll("whitelist").map(String);
    const episObrigatorios = currentState.epiTipos.filter((epi) => epiIds.includes(epi.id));
    const whitelist = currentState.funcionarios
      .filter((funcionario) => whitelistIds.includes(funcionario.id))
      .map((funcionario) => ({
        id: uid("perm"),
        funcionario_id: funcionario.id,
        nome: funcionario.nome,
        cargo: funcionario.cargo.nome
      }));
    const nome = String(formData.get("nome") ?? "");

    update((draft) => {
      draft.areas.push({
        id,
        nome,
        codigo: String(formData.get("codigo") ?? ""),
        tipo: String(formData.get("tipo") ?? ""),
        nivel_risco: String(formData.get("nivel_risco") ?? ""),
        capacidade_maxima: Number(formData.get("capacidade_maxima") ?? 0),
        anti_passback: formData.get("anti_passback") === "on",
        verificar_epi: formData.get("verificar_epi") === "on",
        fail_open: formData.get("fail_open") === "on",
        status: "LIBERADA",
        epis_obrigatorios: episObrigatorios,
        whitelist,
        blacklist,
        restricoes_horario: schedules
      });
      pushLog(draft, {
        funcionario_nome: "Administrador",
        area_nome: nome,
        resultado: "PERMITIDO",
        motivo: "Area criada"
      });
    });

    router.push(`/areas/${id}`);
  }

  return (
    <>
      <PageHeader
        title="Nova Area"
        description="Cadastro com EPIs obrigatorios, nivel de risco e regras de acesso."
        action={
          <Button form="area-form" type="submit">
            <Save size={16} aria-hidden />
            Salvar area
          </Button>
        }
      />

      {message ? <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">{message}</p> : null}

      <form id="area-form" onSubmit={handleSubmit} className="grid gap-5">
        <section className="surface max-w-4xl p-4">
          <p className="label mb-3">Identificacao</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Nome da area" className="lg:col-span-2">
              <Input name="nome" required />
            </Field>
            <Field label="Codigo">
              <Input name="codigo" placeholder="Ex: TQ04" required />
            </Field>
            <Field label="Tipo">
              <Select name="tipo" defaultValue="" required>
                <option value="">Selecione</option>
                <option value="Aberta">Aberta</option>
                <option value="Confinada">Confinada</option>
                <option value="Restrita">Restrita</option>
              </Select>
            </Field>
            <Field label="Nivel de risco">
              <Select name="nivel_risco" defaultValue="" required>
                <option value="">Selecione</option>
                <option value="Baixo">Baixo</option>
                <option value="Medio">Medio</option>
                <option value="Alto">Alto</option>
                <option value="Critico">Critico</option>
              </Select>
            </Field>
            <Field label="Capacidade maxima">
              <Input name="capacidade_maxima" type="number" min={1} required />
            </Field>
          </div>
        </section>

        <section className="surface p-4">
          <p className="label mb-4">EPIs obrigatorios</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {state.epiTipos.filter((epi) => epi.ativo !== false).map((epi, index) => (
              <Checkbox key={epi.id} name="epis_obrigatorios" value={epi.id} label={epi.nome} defaultChecked={index < 2} />
            ))}
          </div>
        </section>

        <section className="surface p-4">
          <p className="label mb-4">Validacoes especiais</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Checkbox name="anti_passback" label="Anti-Passback" defaultChecked />
            <Checkbox name="verificar_epi" label="Verificar EPIs no acesso" defaultChecked />
            <Checkbox name="fail_open" label="Fail-open em emergencia" defaultChecked />
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Configuracao de Regras</h2>
            <p className="text-sm text-muted">Lista de permissoes, bloqueios e janelas horarias.</p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="surface p-4">
              <p className="label mb-3">Lista de Permissao (Whitelist)</p>
              <div className="mt-4 grid gap-3">
                {state.funcionarios.map((funcionario) => (
                  <Checkbox key={funcionario.id} name="whitelist" value={funcionario.id} label={`${funcionario.nome} - ${funcionario.cargo.nome}`} defaultChecked={funcionario.status === "ATIVO"} />
                ))}
              </div>
            </div>

            <div className="surface p-4">
              <p className="label mb-3">Lista de Bloqueio (Blacklist)</p>
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <Select value={blacklistFuncionario} onChange={(event) => setBlacklistFuncionario(event.target.value)}>
                  <option value="">Pessoa</option>
                  {state.funcionarios.map((funcionario) => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome}
                    </option>
                  ))}
                </Select>
                <Input value={blacklistMotivo} onChange={(event) => setBlacklistMotivo(event.target.value)} placeholder="Motivo" />
                <Button type="button" variant="secondary" onClick={addBlacklist}>
                  <Plus size={15} aria-hidden />
                  Adicionar
                </Button>
              </div>
              <Table className="mt-4 border-0">
                <thead className="bg-neutral-100 text-[11px] uppercase text-muted">
                  <tr>
                    <Th>Pessoa</Th>
                    <Th>Motivo</Th>
                    <Th>Acoes</Th>
                  </tr>
                </thead>
                <tbody>
                  {blacklist.map((item) => (
                    <tr key={item.id}>
                      <Td>{item.nome}</Td>
                      <Td>{item.motivo}</Td>
                      <Td>
                        <button type="button" onClick={() => setBlacklist((current) => current.filter((permission) => permission.id !== item.id))} className="rounded-md border border-line p-2 text-muted hover:text-danger">
                          <X size={14} aria-hidden />
                        </button>
                      </Td>
                    </tr>
                  ))}
                  {!blacklist.length ? (
                    <tr>
                      <Td colSpan={3}>Nenhuma pessoa bloqueada.</Td>
                    </tr>
                  ) : null}
                </tbody>
              </Table>
            </div>
          </div>

          <div className="surface mt-5 p-4">
            <p className="label mb-3">Janelas horarias</p>
            <div className="mb-3 grid gap-3 md:grid-cols-[1fr_130px_130px_1fr_auto]">
              <Input value={schedule.dias} onChange={(event) => setSchedule((current) => ({ ...current, dias: event.target.value }))} placeholder="Dias" />
              <Input value={schedule.hora_inicio} onChange={(event) => setSchedule((current) => ({ ...current, hora_inicio: event.target.value }))} type="time" />
              <Input value={schedule.hora_fim} onChange={(event) => setSchedule((current) => ({ ...current, hora_fim: event.target.value }))} type="time" />
              <Input value={schedule.perfil} onChange={(event) => setSchedule((current) => ({ ...current, perfil: event.target.value }))} placeholder="Perfil" />
              <Button type="button" variant="secondary" onClick={addSchedule}>
                <Plus size={15} aria-hidden />
                Nova janela
              </Button>
            </div>
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
                {schedules.map((horario) => (
                  <tr key={horario.id}>
                    <Td>{horario.dias}</Td>
                    <Td>{horario.hora_inicio}</Td>
                    <Td>{horario.hora_fim}</Td>
                    <Td>{horario.perfil}</Td>
                    <Td>
                      <button type="button" onClick={() => setSchedules((current) => current.filter((item) => item.id !== horario.id))} className="rounded-md border border-line p-2 text-muted hover:text-danger">
                        <X size={14} aria-hidden />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </section>
      </form>
    </>
  );
}

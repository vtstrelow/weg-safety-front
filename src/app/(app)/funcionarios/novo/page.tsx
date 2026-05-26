"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Save, Upload, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Table, Td, Th } from "@/components/data/table";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import type { EpiVinculoResumo, FuncionarioDetalhe } from "@/lib/api-types";
import { daysUntil, epiStatus, pushLog, uid, type SafeAccessState } from "@/lib/local-store";
import { useSafeAccessStore } from "@/lib/use-safeaccess-store";
import { formatDate } from "@/lib/utils";

type EpiDraft = {
  id: string;
  epi_tipo_id: string;
  epi_nome: string;
  nr_ca: string;
  data_entrega: string;
  data_validade: string;
};

export default function NovoFuncionarioPage() {
  const router = useRouter();
  const { state, ready, update } = useSafeAccessStore();
  const [photoStatus, setPhotoStatus] = useState("Foto 3x4");
  const [message, setMessage] = useState("");
  const [selectedEpi, setSelectedEpi] = useState("");
  const [epiCa, setEpiCa] = useState("");
  const [epiEntrega, setEpiEntrega] = useState("");
  const [epiValidade, setEpiValidade] = useState("");
  const [episVinculados, setEpisVinculados] = useState<EpiDraft[]>([]);

  if (!ready || !state) {
    return <p className="text-sm font-semibold text-muted">Carregando cadastro...</p>;
  }

  const currentState = state;

  function addEpi() {
    const epi = currentState.epiTipos.find((item) => item.id === selectedEpi);

    if (!epi || !epiCa || !epiEntrega || !epiValidade) {
      setMessage("Preencha EPI, CA, entrega e validade antes de vincular.");
      return;
    }

    setEpisVinculados((current) => [
      ...current,
      {
        id: uid("epi-draft"),
        epi_tipo_id: epi.id,
        epi_nome: epi.nome,
        nr_ca: epiCa,
        data_entrega: epiEntrega,
        data_validade: epiValidade
      }
    ]);
    setSelectedEpi("");
    setEpiCa("");
    setEpiEntrega("");
    setEpiValidade("");
    setMessage("EPI adicionado ao cadastro.");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const cargo = currentState.cargos.find((item) => item.id === String(formData.get("cargo_id")));
    const setor = currentState.setores.find((item) => item.id === String(formData.get("setor_id")));

    if (!cargo || !setor) {
      setMessage("Selecione cargo e setor para salvar o funcionario.");
      return;
    }

    const id = uid("func");
    const matricula = String(formData.get("matricula") || `${currentState.funcionarios.length + 1}`.padStart(6, "0"));
    const nome = String(formData.get("nome") ?? "");
    const uidRfid = String(formData.get("uid_rfid") ?? "");
    const crachaValidade = String(formData.get("validade") ?? "");

    update((draft: SafeAccessState) => {
      const funcionario: FuncionarioDetalhe = {
        id,
        nome,
        cpf: String(formData.get("cpf") ?? ""),
        rg: String(formData.get("rg") ?? ""),
        matricula,
        email: String(formData.get("email") ?? ""),
        data_nascimento: String(formData.get("data_nascimento") ?? ""),
        genero: String(formData.get("genero") ?? ""),
        data_admissao: String(formData.get("data_admissao") ?? ""),
        turno: String(formData.get("turno") ?? "Comercial"),
        status: "ATIVO",
        cargo,
        setor,
        cracha: {
          id: uid("cracha"),
          uid_rfid: uidRfid,
          validade: crachaValidade,
          perfil_acesso: String(formData.get("perfil_acesso") ?? ""),
          status: "ATIVO"
        },
        epis: []
      };

      const novosEpis: EpiVinculoResumo[] = episVinculados.map((epi) => {
        const epiTipo = draft.epiTipos.find((item) => item.id === epi.epi_tipo_id) ?? draft.epiTipos[0];
        return {
          id: uid("epi-func"),
          funcionario: { id, nome, matricula },
          epi_tipo: epiTipo,
          nr_ca: epi.nr_ca,
          data_entrega: epi.data_entrega,
          data_validade: epi.data_validade,
          dias_para_vencer: daysUntil(epi.data_validade),
          status: epiStatus(epi.data_validade)
        };
      });

      funcionario.epis = novosEpis.map((epi) => ({
        id: epi.id,
        epi_tipo: epi.epi_tipo,
        nr_ca: epi.nr_ca,
        data_entrega: epi.data_entrega ?? "",
        data_validade: epi.data_validade,
        dias_para_vencer: epi.dias_para_vencer ?? daysUntil(epi.data_validade),
        status: epi.status
      }));

      draft.funcionarios.push(funcionario);
      draft.epis.push(...novosEpis);
      pushLog(draft, {
        funcionario_nome: nome,
        area_nome: "Cadastro de funcionarios",
        resultado: "PERMITIDO",
        motivo: "Funcionario criado"
      });
    });

    router.push(`/funcionarios/${id}`);
  }

  return (
    <>
      <PageHeader
        title="Cadastro - Funcionario direto"
        description="Vinculo CLT com matricula corporativa, cracha RFID e EPIs."
        action={
          <div className="flex gap-2">
            <Link href="/funcionarios" className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-ink">
              Cancelar
            </Link>
            <Button form="funcionario-form" type="submit">
              <Save size={16} aria-hidden />
              Salvar
            </Button>
          </div>
        }
      />

      {message ? <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p> : null}

      <form id="funcionario-form" onSubmit={handleSubmit} className="grid gap-5">
        <section className="grid gap-5 xl:grid-cols-[112px_1fr]">
          <div className="grid gap-3 self-start">
            <div className="flex aspect-[3/4] items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white px-2 text-center text-xs text-muted">
              {photoStatus}
            </div>
            <Button type="button" variant="secondary" className="h-9 px-2 text-xs" onClick={() => setPhotoStatus("Foto capturada")}>
              <Camera size={14} aria-hidden />
              Capturar
            </Button>
            <Button type="button" variant="secondary" className="h-9 px-2 text-xs" onClick={() => setPhotoStatus("Upload recebido")}>
              <Upload size={14} aria-hidden />
              Upload
            </Button>
          </div>

          <div className="surface p-4">
            <p className="label mb-3">Dados pessoais</p>
            <div className="grid gap-4 lg:grid-cols-4">
              <Field label="Nome completo" className="lg:col-span-2">
                <Input name="nome" required />
              </Field>
              <Field label="CPF">
                <Input name="cpf" required />
              </Field>
              <Field label="RG">
                <Input name="rg" required />
              </Field>
            </div>

            <p className="label mb-3 mt-5">Vinculo</p>
            <div className="grid gap-4 lg:grid-cols-4">
              <Field label="Data nascimento">
                <Input name="data_nascimento" type="date" required />
              </Field>
              <Field label="Genero">
                <Select name="genero" defaultValue="" required>
                  <option value="">Selecione</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="NAO_INFORMADO">Nao informado</option>
                </Select>
              </Field>
              <Field label="E-mail corporativo" className="lg:col-span-2">
                <Input name="email" type="email" required />
              </Field>
              <Field label="Matricula">
                <Input name="matricula" placeholder="Gerada automaticamente se vazio" />
              </Field>
              <Field label="Cargo">
                <Select name="cargo_id" defaultValue="" required>
                  <option value="">Selecione</option>
                  {state.cargos.filter((cargo) => cargo.ativo !== false).map((cargo) => (
                    <option key={cargo.id} value={cargo.id}>
                      {cargo.nome}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Setor">
                <Select name="setor_id" defaultValue="" required>
                  <option value="">Selecione</option>
                  {state.setores.filter((setor) => setor.ativo !== false).map((setor) => (
                    <option key={setor.id} value={setor.id}>
                      {setor.nome}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Admissao">
                <Input name="data_admissao" type="date" required />
              </Field>
              <Field label="Turno">
                <Select name="turno" defaultValue="Comercial">
                  <option value="Comercial">Comercial</option>
                  <option value="Primeiro turno">Primeiro turno</option>
                  <option value="Segundo turno">Segundo turno</option>
                  <option value="Noturno">Noturno</option>
                </Select>
              </Field>
            </div>
          </div>
        </section>

        <section className="surface p-4">
          <p className="label mb-3">Cracha RFID</p>
          <div className="grid gap-4 lg:grid-cols-[1fr_180px_1fr]">
            <Field label="Numero Cracha / RFID">
              <Input name="uid_rfid" required />
            </Field>
            <Field label="Validade">
              <Input name="validade" type="date" required />
            </Field>
            <Field label="Perfil de acesso">
              <Select name="perfil_acesso" defaultValue="" required>
                <option value="">Selecione</option>
                <option value="OPERADOR">Operador</option>
                <option value="MANUTENCAO">Manutencao</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="VISITANTE">Visitante</option>
              </Select>
            </Field>
          </div>
        </section>

        <section className="surface p-4">
          <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <p className="label">EPIs vinculados</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[180px_110px_150px_150px_auto]">
              <Select value={selectedEpi} onChange={(event) => setSelectedEpi(event.target.value)} className="h-9">
                <option value="">Adicionar EPI</option>
                {state.epiTipos.filter((epi) => epi.ativo !== false).map((epi) => (
                  <option key={epi.id} value={epi.id}>
                    {epi.nome}
                  </option>
                ))}
              </Select>
              <Input value={epiCa} onChange={(event) => setEpiCa(event.target.value)} placeholder="CA" className="h-9" />
              <Input value={epiEntrega} onChange={(event) => setEpiEntrega(event.target.value)} type="date" className="h-9" />
              <Input value={epiValidade} onChange={(event) => setEpiValidade(event.target.value)} type="date" className="h-9" />
              <Button type="button" variant="secondary" className="h-9" onClick={addEpi}>
                Vincular
              </Button>
            </div>
          </div>
          <Table className="border-0">
            <thead className="bg-neutral-100 text-[11px] uppercase text-muted">
              <tr>
                <Th>EPI</Th>
                <Th>CA</Th>
                <Th>Entrega</Th>
                <Th>Validade</Th>
                <Th>Acoes</Th>
              </tr>
            </thead>
            <tbody>
              {episVinculados.map((epi) => (
                <tr key={epi.id}>
                  <Td className="font-semibold text-ink">{epi.epi_nome}</Td>
                  <Td>{epi.nr_ca}</Td>
                  <Td>{formatDate(epi.data_entrega)}</Td>
                  <Td>{formatDate(epi.data_validade)}</Td>
                  <Td>
                    <button type="button" aria-label="Remover EPI" onClick={() => setEpisVinculados((current) => current.filter((item) => item.id !== epi.id))} className="rounded-full bg-neutral-200 p-1.5 text-muted hover:text-ink">
                      <X size={14} aria-hidden />
                    </button>
                  </Td>
                </tr>
              ))}
              {!episVinculados.length ? (
                <tr>
                  <Td colSpan={5}>Nenhum EPI vinculado neste cadastro.</Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </section>
      </form>
    </>
  );
}

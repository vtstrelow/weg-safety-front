import { Camera, Save, Upload, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Table, Td, Th } from "@/components/data/table";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { cargosApi, epiTiposApi, setoresApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default async function NovoFuncionarioPage() {
  const [cargos, setores, epiTipos] = await Promise.all([cargosApi.list(), setoresApi.list(), epiTiposApi.list()]);

  const episVinculados = [
    { epi: "Capacete", ca: "12345", entrega: "2025-03-01", validade: "2026-03-01" },
    { epi: "Bota de segurança", ca: "22871", entrega: "2025-03-01", validade: "2025-09-01" }
  ];

  return (
    <>
      <PageHeader
        title="Cadastro - Funcionário direto"
        description="Vínculo CLT com matrícula corporativa, crachá RFID e EPIs."
        action={
          <div className="flex gap-2">
            <Button variant="secondary">Cancelar</Button>
            <Button>
              <Save size={16} aria-hidden />
              Salvar
            </Button>
          </div>
        }
      />

      <form className="grid gap-5">
        <section className="grid gap-5 xl:grid-cols-[112px_1fr]">
          <div className="grid gap-3 self-start">
            <div className="flex aspect-[3/4] items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white text-xs text-muted">
              Foto 3x4
            </div>
            <Button type="button" variant="secondary" className="h-9 px-2 text-xs">
              <Camera size={14} aria-hidden />
              Capturar
            </Button>
            <Button type="button" variant="secondary" className="h-9 px-2 text-xs">
              <Upload size={14} aria-hidden />
              Upload
            </Button>
          </div>

          <div className="surface p-4">
            <p className="label mb-3">Dados pessoais</p>
            <div className="grid gap-4 lg:grid-cols-4">
              <Field label="Nome completo" className="lg:col-span-2">
                <Input name="nome" />
              </Field>
              <Field label="CPF">
                <Input name="cpf" />
              </Field>
              <Field label="RG">
                <Input name="rg" />
              </Field>
            </div>

            <p className="label mb-3 mt-5">Vínculo</p>
            <div className="grid gap-4 lg:grid-cols-4">
              <Field label="Data nascimento">
                <Input name="data_nascimento" type="date" />
              </Field>
              <Field label="Gênero">
                <Select name="genero" defaultValue="">
                  <option value="">Selecione</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="NAO_INFORMADO">Não informado</option>
                </Select>
              </Field>
              <Field label="E-mail corporativo" className="lg:col-span-2">
                <Input name="email" type="email" />
              </Field>
              <Field label="Matrícula">
                <Input name="matricula" placeholder="Gerada pelo backend" />
              </Field>
              <Field label="Cargo">
                <Select name="cargo_id" defaultValue="">
                  <option value="">Selecione</option>
                  {cargos.data.map((cargo) => (
                    <option key={cargo.id} value={cargo.id}>
                      {cargo.nome}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Setor">
                <Select name="setor_id" defaultValue="">
                  <option value="">Selecione</option>
                  {setores.data.map((setor) => (
                    <option key={setor.id} value={setor.id}>
                      {setor.nome}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Admissão">
                <Input name="data_admissao" type="date" />
              </Field>
            </div>
          </div>
        </section>

        <section className="surface p-4">
          <p className="label mb-3">Crachá RFID</p>
          <div className="grid gap-4 lg:grid-cols-[1fr_180px_1fr]">
            <Field label="Nº Crachá / RFID">
              <Input name="uid_rfid" />
            </Field>
            <Field label="Validade">
              <Input name="validade" type="date" />
            </Field>
            <Field label="Perfil de acesso">
              <Select name="perfil_acesso" defaultValue="">
                <option value="">Selecione</option>
                <option value="OPERADOR">Operador</option>
                <option value="MANUTENCAO">Manutenção</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="VISITANTE">Visitante</option>
              </Select>
            </Field>
          </div>
        </section>

        <section className="surface p-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="label">EPIs vinculados</p>
            <div className="flex gap-2">
              <Select defaultValue="" className="h-9 min-w-48">
                <option value="">Adicionar EPI</option>
                {epiTipos.data.map((epi) => (
                  <option key={epi.id} value={epi.id}>
                    {epi.nome}
                  </option>
                ))}
              </Select>
              <Button type="button" variant="secondary" className="h-9">
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
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {episVinculados.map((epi) => (
                <tr key={epi.ca}>
                  <Td className="font-semibold text-ink">{epi.epi}</Td>
                  <Td>{epi.ca}</Td>
                  <Td>{formatDate(epi.entrega)}</Td>
                  <Td>{formatDate(epi.validade)}</Td>
                  <Td>
                    <button type="button" aria-label="Remover EPI" className="rounded-full bg-neutral-200 p-1.5 text-muted hover:text-ink">
                      <X size={14} aria-hidden />
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      </form>
    </>
  );
}

import { Plus, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Table, Td, Th } from "@/components/data/table";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { areasApi, epiTiposApi, funcionariosApi } from "@/lib/api";

export default async function NovaAreaPage() {
  const [epiTipos, funcionarios, area] = await Promise.all([epiTiposApi.list(), funcionariosApi.list(), areasApi.detail("area-4")]);

  return (
    <>
      <PageHeader
        title="Nova Área"
        description="Cadastro com EPIs obrigatórios, nível de risco e regras de acesso."
        action={
          <Button>
            <Save size={16} aria-hidden />
            Salvar área
          </Button>
        }
      />

      <form className="grid gap-5">
        <section className="surface max-w-4xl p-4">
          <p className="label mb-3">Identificação</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Nome da área" className="lg:col-span-2">
              <Input name="nome" />
            </Field>
            <Field label="Código">
              <Input name="codigo" placeholder="Ex: TQ04" />
            </Field>
            <Field label="Tipo">
              <Select name="tipo" defaultValue="">
                <option value="">Selecione</option>
                <option value="ABERTA">Aberta</option>
                <option value="CONFINADA">Confinada</option>
                <option value="RESTRITA">Restrita</option>
              </Select>
            </Field>
            <Field label="Nível de risco">
              <Select name="nivel_risco" defaultValue="">
                <option value="">Selecione</option>
                <option value="BAIXO">Baixo</option>
                <option value="MEDIO">Médio</option>
                <option value="ALTO">Alto</option>
                <option value="CRITICO">Crítico</option>
              </Select>
            </Field>
            <Field label="Capacidade máxima">
              <Input name="capacidade_maxima" type="number" min={1} />
            </Field>
          </div>
        </section>

        <section className="surface p-4">
          <p className="label mb-4">EPIs obrigatórios</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {epiTipos.data.map((epi, index) => (
              <Checkbox key={epi.id} label={epi.nome} defaultChecked={index < 2} />
            ))}
          </div>
          <Button type="button" variant="ghost" className="mt-3 h-8 px-0">
            <Plus size={15} aria-hidden />
            Adicionar EPI
          </Button>
        </section>

        <section className="surface p-4">
          <p className="label mb-4">Validações especiais</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Checkbox label="Anti-Passback" defaultChecked />
            <Checkbox label="Verificar EPIs no acesso" defaultChecked />
            <Checkbox label="Fail-open em emergência" defaultChecked />
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Configuração de Regras</h2>
            <p className="text-sm text-muted">Lista de permissões, bloqueios e janelas horárias.</p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="surface p-4">
              <p className="label mb-3">Lista de Permissão (Whitelist)</p>
              <Input placeholder="Buscar perfil/pessoa" />
              <div className="mt-4 grid gap-3">
                {funcionarios.data.slice(0, 4).map((funcionario) => (
                  <Checkbox key={funcionario.id} label={`${funcionario.nome} · ${funcionario.cargo}`} defaultChecked={funcionario.status === "ATIVO"} />
                ))}
              </div>
            </div>

            <div className="surface p-4">
              <p className="label mb-3">Lista de Bloqueio (Blacklist)</p>
              <Input placeholder="Adicionar pessoa/perfil" />
              <Table className="mt-4 border-0">
                <thead className="bg-neutral-100 text-[11px] uppercase text-muted">
                  <tr>
                    <Th>Pessoa</Th>
                    <Th>Motivo</Th>
                  </tr>
                </thead>
                <tbody>
                  {area.blacklist.map((item) => (
                    <tr key={item.id}>
                      <Td>{item.nome}</Td>
                      <Td>{item.motivo}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>

          <div className="surface mt-5 p-4">
            <p className="label mb-3">Janelas horárias</p>
            <Table className="border-0">
              <thead className="bg-neutral-100 text-[11px] uppercase text-muted">
                <tr>
                  <Th>Dias</Th>
                  <Th>Início</Th>
                  <Th>Fim</Th>
                  <Th>Perfil</Th>
                </tr>
              </thead>
              <tbody>
                {area.restricoes_horario.map((horario) => (
                  <tr key={horario.id}>
                    <Td>{horario.dias}</Td>
                    <Td>{horario.hora_inicio}</Td>
                    <Td>{horario.hora_fim}</Td>
                    <Td>{horario.perfil}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button type="button" variant="ghost" className="mt-3 h-8 px-0">
              <Plus size={15} aria-hidden />
              Nova janela
            </Button>
          </div>
        </section>
      </form>
    </>
  );
}

import Link from "next/link";
import { ArrowLeft, CalendarClock, Lock, Plus, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Table, Td, Th } from "@/components/data/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { areasApi, funcionariosApi } from "@/lib/api";

export default async function AreaDetalhePage({ params }: { params: { id: string } }) {
  const [area, permitidos, funcionarios] = await Promise.all([
    areasApi.detail(params.id),
    areasApi.funcionarios(params.id),
    funcionariosApi.list()
  ]);

  return (
    <>
      <PageHeader
        title={area.nome}
        description={`${area.codigo} · ${area.tipo} · risco ${area.nivel_risco.toLowerCase()}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/areas"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-ink"
            >
              <ArrowLeft size={16} aria-hidden />
              Voltar
            </Link>
            <Button variant="danger">
              <Lock size={16} aria-hidden />
              Bloquear área
            </Button>
          </div>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          <article className="surface p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
                <ShieldCheck size={18} aria-hidden />
              </span>
              <div>
                <h2 className="font-bold">Configuração da área</h2>
                <p className="text-sm text-muted">Parâmetros usados na validação de acesso.</p>
              </div>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Status" value={area.status} badge />
              <Info label="Capacidade máxima" value={`${area.capacidade_maxima} pessoas`} />
              <Info label="Anti-passback" value={area.anti_passback ? "Ativo" : "Inativo"} />
              <Info label="Verificar EPIs" value={area.verificar_epi ? "Ativo" : "Inativo"} />
              <Info label="Fail-open" value={area.fail_open ? "Ativo" : "Inativo"} />
              <Info label="EPIs obrigatórios" value={area.epis_obrigatorios.map((epi) => epi.nome).join(", ")} />
            </dl>
          </article>

          <article className="surface p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
                <Users size={18} aria-hidden />
              </span>
              <div>
                <h2 className="font-bold">Funcionários autorizados</h2>
                <p className="text-sm text-muted">Retorno previsto de GET /api/areas/:id/funcionarios.</p>
              </div>
            </div>

            <Table className="border-0">
              <thead className="bg-neutral-100 text-[11px] uppercase text-muted">
                <tr>
                  <Th>Nome</Th>
                  <Th>Matrícula</Th>
                  <Th>Cargo</Th>
                  <Th>Permissão</Th>
                  <Th>EPIs</Th>
                </tr>
              </thead>
              <tbody>
                {permitidos.data.map((funcionario) => (
                  <tr key={funcionario.id}>
                    <Td className="font-semibold text-ink">{funcionario.nome}</Td>
                    <Td>{funcionario.matricula}</Td>
                    <Td>{funcionario.cargo}</Td>
                    <Td>
                      <Badge>{funcionario.tipo_permissao}</Badge>
                    </Td>
                    <Td>
                      <Badge tone={funcionario.epis_validos ? "success" : "danger"}>
                        {funcionario.epis_validos ? "Válidos" : "Pendentes"}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </article>

          <article className="surface p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
                <CalendarClock size={18} aria-hidden />
              </span>
              <div>
                <h2 className="font-bold">Janelas horárias</h2>
                <p className="text-sm text-muted">Restrições por perfil, dia da semana e horário.</p>
              </div>
            </div>

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
          </article>
        </div>

        <aside className="grid gap-5 self-start">
          <article className="surface p-5">
            <h2 className="font-bold">Adicionar permissão</h2>
            <form className="mt-4 grid gap-3">
              <Field label="Funcionário">
                <Select defaultValue="">
                  <option value="">Selecione</option>
                  {funcionarios.data.map((funcionario) => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tipo">
                <Select defaultValue="WHITELIST">
                  <option value="WHITELIST">Whitelist</option>
                  <option value="BLACKLIST">Blacklist</option>
                </Select>
              </Field>
              <Field label="Motivo da blacklist">
                <Input placeholder="Obrigatório se for bloqueio" />
              </Field>
              <Button type="button">
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
                  <strong className="text-sm">{item.nome}</strong>
                  <p className="mt-1 text-sm text-muted">{item.motivo}</p>
                </div>
              ))}
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

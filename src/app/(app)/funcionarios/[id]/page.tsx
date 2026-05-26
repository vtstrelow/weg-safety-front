import Link from "next/link";
import { ArrowLeft, BadgeCheck, CreditCard, HardHat, ShieldAlert, UserRound } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Table, Td, Th } from "@/components/data/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { funcionariosApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default async function FuncionarioDetalhePage({ params }: { params: { id: string } }) {
  const funcionario = await funcionariosApi.detail(params.id);

  return (
    <>
      <PageHeader
        title={funcionario.nome}
        description={`Matrícula ${funcionario.matricula} · ${funcionario.cargo.nome} · ${funcionario.setor.nome}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/funcionarios"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-ink"
            >
              <ArrowLeft size={16} aria-hidden />
              Voltar
            </Link>
            <Button variant={funcionario.status === "ATIVO" ? "danger" : "secondary"}>
              <ShieldAlert size={16} aria-hidden />
              {funcionario.status === "ATIVO" ? "Desativar" : "Reativar"}
            </Button>
          </div>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          <article className="surface p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
                <UserRound size={18} aria-hidden />
              </span>
              <div>
                <h2 className="font-bold">Dados pessoais e vínculo</h2>
                <p className="text-sm text-muted">Informações usadas no cadastro central de identidades.</p>
              </div>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="CPF" value={funcionario.cpf} />
              <Info label="RG" value={funcionario.rg} />
              <Info label="E-mail" value={funcionario.email} />
              <Info label="Nascimento" value={formatDate(funcionario.data_nascimento)} />
              <Info label="Admissão" value={formatDate(funcionario.data_admissao)} />
              <Info label="Turno" value={funcionario.turno} />
              <Info label="Gênero" value={funcionario.genero} />
              <Info label="Setor" value={funcionario.setor.nome} />
              <Info label="Cargo" value={funcionario.cargo.nome} />
            </dl>
          </article>

          <article className="surface p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
                <HardHat size={18} aria-hidden />
              </span>
              <div>
                <h2 className="font-bold">EPIs vinculados</h2>
                <p className="text-sm text-muted">Validade documental usada na decisão de acesso.</p>
              </div>
            </div>

            <Table className="border-0">
              <thead className="bg-neutral-100 text-[11px] uppercase text-muted">
                <tr>
                  <Th>EPI</Th>
                  <Th>CA</Th>
                  <Th>Entrega</Th>
                  <Th>Validade</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {funcionario.epis.map((epi) => (
                  <tr key={epi.id}>
                    <Td className="font-semibold text-ink">{epi.epi_tipo.nome}</Td>
                    <Td>{epi.nr_ca}</Td>
                    <Td>{formatDate(epi.data_entrega)}</Td>
                    <Td>{formatDate(epi.data_validade)}</Td>
                    <Td>
                      <Badge tone={statusTone(epi.status)}>{epi.status}</Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </article>
        </div>

        <aside className="grid gap-5 self-start">
          <article className="surface p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
                <CreditCard size={18} aria-hidden />
              </span>
              <div>
                <h2 className="font-bold">Crachá RFID</h2>
                <p className="text-sm text-muted">Credencial ativa do funcionário.</p>
              </div>
            </div>

            <div className="grid gap-4">
              <Info label="UID RFID" value={funcionario.cracha.uid_rfid} />
              <Info label="Perfil de acesso" value={funcionario.cracha.perfil_acesso} />
              <Info label="Validade" value={formatDate(funcionario.cracha.validade)} />
              <div>
                <dt className="text-xs font-semibold uppercase text-muted">Status</dt>
                <dd className="mt-1">
                  <Badge tone={statusTone(funcionario.cracha.status)}>{funcionario.cracha.status}</Badge>
                </dd>
              </div>
            </div>

            <Button className="mt-5 w-full" variant="danger">
              Invalidar crachá
            </Button>
          </article>

          <article className="surface p-5">
            <div className="flex items-start gap-3">
              <BadgeCheck size={18} className="mt-0.5 text-success" aria-hidden />
              <div>
                <h2 className="font-bold">Resumo operacional</h2>
                <p className="mt-1 text-sm text-muted">
                  Funcionário com status {funcionario.status.toLowerCase()} e {funcionario.epis.length} EPIs registrados no cadastro.
                </p>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-muted">{label}</dt>
      <dd className="mt-1 font-medium text-ink">{value}</dd>
    </div>
  );
}

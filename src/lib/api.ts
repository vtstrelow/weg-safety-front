import { request, useMocks } from "./api-client";
import type {
  AreaDetalhe,
  AreaFuncionario,
  AreaPayload,
  AreaResumo,
  AuthLoginResponse,
  AuthMeResponse,
  CreatedResponse,
  CrachaDetalhe,
  CrachaPayload,
  CrachaValidacao,
  DashboardResumo,
  EntityOption,
  EpiCritico,
  EpiPayload,
  EpiVinculoResumo,
  FuncionarioCreateResponse,
  FuncionarioDetalhe,
  FuncionarioPayload,
  FuncionarioResumo,
  ListResponse,
  LogAcesso,
  LogDetalhe,
  MessageResponse,
  PermissoesArea,
  RestricaoHorario
} from "./api-types";
import { endpoints } from "./endpoints";
import {
  areaDetalhe,
  areaFuncionarios,
  areas,
  cargos,
  crachaDetalhe,
  dashboardResumo,
  epiCriticos,
  epiTipos,
  epis,
  funcionarioDetalhe,
  funcionarios,
  logDetalhe,
  logs,
  setores
} from "./mock-data";

type QueryValue = string | number | boolean | undefined | null;

const pause = <T>(data: T) => new Promise<T>((resolve) => setTimeout(() => resolve(data), 80));
const ok = (message: string): MessageResponse => ({ message });
const created = (id: string, message: string) => ({ id, message });

function withQuery(path: string, params?: Record<string, QueryValue>) {
  if (!params) {
    return path;
  }

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export const authApi = {
  login: (payload: { email: string; senha: string }) =>
    useMocks
      ? pause<AuthLoginResponse>({
          token: "mock-safeaccess-token",
          nome: "Victor Strelow",
          email: payload.email,
          expira_em: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
        })
      : request<AuthLoginResponse>(endpoints.auth.login, {
          method: "POST",
          body: JSON.stringify(payload)
        }),
  me: () =>
    useMocks
      ? pause<AuthMeResponse>({
          id: "user-1",
          nome: "Victor Strelow",
          email: "victor@empresa.com",
          status: "ATIVO",
          ultimo_acesso: new Date().toISOString()
        })
      : request<AuthMeResponse>(endpoints.auth.me),
  logout: () =>
    useMocks
      ? pause(ok("Sessão encerrada com sucesso"))
      : request<MessageResponse>(endpoints.auth.logout, { method: "POST" }),
  changePassword: (payload: { senha_atual: string; nova_senha: string }) =>
    useMocks
      ? pause(ok("Senha alterada com sucesso"))
      : request<MessageResponse>(endpoints.auth.changePassword, {
          method: "PATCH",
          body: JSON.stringify(payload)
        })
};

export const dashboardApi = {
  summary: () => (useMocks ? pause(dashboardResumo) : request<DashboardResumo>(endpoints.dashboard.summary)),
  criticalEpis: () =>
    useMocks
      ? pause<ListResponse<EpiCritico>>({ data: epiCriticos, total: epiCriticos.length })
      : request<ListResponse<EpiCritico>>(endpoints.dashboard.criticalEpis),
  recentAccess: () =>
    useMocks
      ? pause<ListResponse<LogAcesso>>({ data: logs, total: logs.length })
      : request<ListResponse<LogAcesso>>(endpoints.dashboard.recentAccess)
};

export const funcionariosApi = {
  list: (params?: {
    nome?: string;
    matricula?: string;
    cargo_id?: string;
    setor_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) =>
    useMocks
      ? pause<ListResponse<FuncionarioResumo>>({
          data: funcionarios,
          total: funcionarios.length,
          page: 1,
          limit: 20
        })
      : request<ListResponse<FuncionarioResumo>>(withQuery(endpoints.funcionarios.list, params)),
  detail: (id: string) =>
    useMocks ? pause({ ...funcionarioDetalhe, id }) : request<FuncionarioDetalhe>(endpoints.funcionarios.detail(id)),
  create: (payload: FuncionarioPayload) =>
    useMocks
      ? pause<FuncionarioCreateResponse>({
          id: "func-novo",
          matricula: "004201",
          message: "Funcionário criado com sucesso"
        })
      : request<FuncionarioCreateResponse>(endpoints.funcionarios.create, {
          method: "POST",
          body: JSON.stringify(payload)
        }),
  update: (id: string, payload: Partial<FuncionarioPayload>) =>
    useMocks
      ? pause(ok("Funcionário atualizado com sucesso"))
      : request<MessageResponse>(endpoints.funcionarios.update(id), {
          method: "PUT",
          body: JSON.stringify(payload)
        }),
  setStatus: (id: string, status: "ATIVO" | "INATIVO") =>
    useMocks
      ? pause(ok("Status atualizado com sucesso"))
      : request<MessageResponse>(endpoints.funcionarios.status(id), {
          method: "PATCH",
          body: JSON.stringify({ status })
        })
};

export const crachasApi = {
  create: (payload: CrachaPayload) =>
    useMocks
      ? pause(created("cracha-novo", "Crachá emitido com sucesso. Crachá anterior invalidado automaticamente."))
      : request<CreatedResponse>(endpoints.crachas.create, {
          method: "POST",
          body: JSON.stringify(payload)
        }),
  detail: (id: string) =>
    useMocks ? pause({ ...crachaDetalhe, id }) : request<CrachaDetalhe>(endpoints.crachas.detail(id)),
  invalidate: (id: string) =>
    useMocks
      ? pause(ok("Crachá invalidado com sucesso"))
      : request<MessageResponse>(endpoints.crachas.invalidate(id), { method: "PATCH" }),
  validate: (uidRfid: string) =>
    useMocks
      ? pause<CrachaValidacao>({
          valido: true,
          funcionario: {
            id: funcionarioDetalhe.id,
            nome: funcionarioDetalhe.nome,
            status: funcionarioDetalhe.status
          },
          cracha: {
            perfil_acesso: funcionarioDetalhe.cracha.perfil_acesso,
            validade: funcionarioDetalhe.cracha.validade,
            status: funcionarioDetalhe.cracha.status
          }
        })
      : request<CrachaValidacao>(endpoints.crachas.validate(uidRfid))
};

export const cargosApi = {
  list: () =>
    useMocks
      ? pause<ListResponse<EntityOption>>({ data: cargos, total: cargos.length })
      : request<ListResponse<EntityOption>>(endpoints.cargos.list),
  detail: (id: string) => (useMocks ? pause({ ...cargos[0], id }) : request<EntityOption>(endpoints.cargos.detail(id))),
  create: (payload: { nome: string }) =>
    useMocks
      ? pause({ id: "cargo-novo", nome: payload.nome })
      : request<Pick<EntityOption, "id" | "nome">>(endpoints.cargos.create, {
          method: "POST",
          body: JSON.stringify(payload)
        }),
  update: (id: string, payload: { nome: string }) =>
    useMocks
      ? pause(ok("Cargo atualizado com sucesso"))
      : request<MessageResponse>(endpoints.cargos.update(id), {
          method: "PUT",
          body: JSON.stringify(payload)
        }),
  delete: (id: string) =>
    useMocks
      ? pause(ok("Cargo desativado com sucesso"))
      : request<MessageResponse>(endpoints.cargos.delete(id), { method: "DELETE" })
};

export const setoresApi = {
  list: () =>
    useMocks
      ? pause<ListResponse<EntityOption>>({ data: setores, total: setores.length })
      : request<ListResponse<EntityOption>>(endpoints.setores.list),
  detail: (id: string) => (useMocks ? pause({ ...setores[0], id }) : request<EntityOption>(endpoints.setores.detail(id))),
  create: (payload: { nome: string }) =>
    useMocks
      ? pause({ id: "setor-novo", nome: payload.nome })
      : request<Pick<EntityOption, "id" | "nome">>(endpoints.setores.create, {
          method: "POST",
          body: JSON.stringify(payload)
        }),
  update: (id: string, payload: { nome: string }) =>
    useMocks
      ? pause(ok("Setor atualizado com sucesso"))
      : request<MessageResponse>(endpoints.setores.update(id), {
          method: "PUT",
          body: JSON.stringify(payload)
        }),
  delete: (id: string) =>
    useMocks
      ? pause(ok("Setor desativado com sucesso"))
      : request<MessageResponse>(endpoints.setores.delete(id), { method: "DELETE" })
};

export const epiTiposApi = {
  list: () =>
    useMocks
      ? pause<ListResponse<EntityOption>>({ data: epiTipos, total: epiTipos.length })
      : request<ListResponse<EntityOption>>(endpoints.epiTipos.list),
  detail: (id: string) =>
    useMocks ? pause({ ...epiTipos[0], id }) : request<EntityOption>(endpoints.epiTipos.detail(id)),
  create: (payload: { nome: string; descricao: string }) =>
    useMocks
      ? pause({ id: "epi-tipo-novo", nome: payload.nome })
      : request<Pick<EntityOption, "id" | "nome">>(endpoints.epiTipos.create, {
          method: "POST",
          body: JSON.stringify(payload)
        }),
  update: (id: string, payload: { nome: string; descricao: string }) =>
    useMocks
      ? pause(ok("Tipo de EPI atualizado com sucesso"))
      : request<MessageResponse>(endpoints.epiTipos.update(id), {
          method: "PUT",
          body: JSON.stringify(payload)
        }),
  delete: (id: string) =>
    useMocks
      ? pause(ok("Tipo de EPI desativado com sucesso"))
      : request<MessageResponse>(endpoints.epiTipos.delete(id), { method: "DELETE" })
};

export const episApi = {
  list: () =>
    useMocks
      ? pause<ListResponse<EpiVinculoResumo>>({ data: epis, total: epis.length })
      : request<ListResponse<EpiVinculoResumo>>(endpoints.epis.list),
  detail: (id: string) =>
    useMocks ? pause({ ...epis[0], id }) : request<EpiVinculoResumo>(endpoints.epis.detail(id)),
  byFuncionario: (funcionarioId: string) =>
    useMocks
      ? pause<ListResponse<EpiVinculoResumo>>({
          data: epis.filter((epi) => epi.funcionario.id === funcionarioId),
          total: epis.length
        })
      : request<ListResponse<EpiVinculoResumo>>(endpoints.epis.byFuncionario(funcionarioId)),
  expirations: () =>
    useMocks
      ? pause<ListResponse<EpiCritico>>({ data: epiCriticos, total: epiCriticos.length })
      : request<ListResponse<EpiCritico>>(endpoints.epis.expirations),
  create: (payload: EpiPayload) =>
    useMocks
      ? pause(created("epi-func-novo", "EPI vinculado com sucesso"))
      : request<CreatedResponse>(endpoints.epis.create, {
          method: "POST",
          body: JSON.stringify(payload)
        }),
  remove: (id: string) =>
    useMocks
      ? pause(ok("EPI removido com sucesso"))
      : request<MessageResponse>(endpoints.epis.remove(id), { method: "PATCH" })
};

export const areasApi = {
  list: (params?: { nome?: string; nivel_risco?: string; status?: string; page?: number; limit?: number }) =>
    useMocks
      ? pause<ListResponse<AreaResumo>>({
          data: areas,
          total: areas.length,
          page: 1,
          limit: 20
        })
      : request<ListResponse<AreaResumo>>(withQuery(endpoints.areas.list, params)),
  detail: (id: string) => (useMocks ? pause({ ...areaDetalhe, id }) : request<AreaDetalhe>(endpoints.areas.detail(id))),
  funcionarios: (id: string) =>
    useMocks
      ? pause<ListResponse<AreaFuncionario>>({ data: areaFuncionarios, total: areaFuncionarios.length })
      : request<ListResponse<AreaFuncionario>>(endpoints.areas.funcionarios(id)),
  create: (payload: AreaPayload) =>
    useMocks
      ? pause(created("area-nova", "Área criada com sucesso"))
      : request<CreatedResponse>(endpoints.areas.create, {
          method: "POST",
          body: JSON.stringify(payload)
        }),
  update: (id: string, payload: AreaPayload) =>
    useMocks
      ? pause(ok("Área atualizada com sucesso"))
      : request<MessageResponse>(endpoints.areas.update(id), {
          method: "PUT",
          body: JSON.stringify(payload)
        }),
  setStatus: (id: string, status: "ATIVA" | "INATIVA" | "BLOQUEADA") =>
    useMocks
      ? pause(ok("Status da área atualizado com sucesso"))
      : request<MessageResponse>(endpoints.areas.status(id), {
          method: "PATCH",
          body: JSON.stringify({ status })
        }),
  permissions: (areaId: string) =>
    useMocks
      ? pause<PermissoesArea>({ whitelist: areaDetalhe.whitelist, blacklist: areaDetalhe.blacklist })
      : request<PermissoesArea>(endpoints.areas.permissions(areaId)),
  addPermission: (areaId: string, payload: { funcionario_id: string; tipo: "WHITELIST" | "BLACKLIST"; motivo?: string }) =>
    useMocks
      ? pause(created("perm-nova", "Permissão adicionada com sucesso"))
      : request<CreatedResponse>(endpoints.areas.permissions(areaId), {
          method: "POST",
          body: JSON.stringify(payload)
        }),
  removePermission: (areaId: string, id: string) =>
    useMocks
      ? pause(ok("Permissão removida com sucesso"))
      : request<MessageResponse>(endpoints.areas.permission(areaId, id), { method: "DELETE" }),
  schedules: (areaId: string) =>
    useMocks
      ? pause<ListResponse<RestricaoHorario>>({
          data: areaDetalhe.restricoes_horario,
          total: areaDetalhe.restricoes_horario.length
        })
      : request<ListResponse<RestricaoHorario>>(endpoints.areas.schedules(areaId)),
  createSchedule: (areaId: string, payload: Omit<RestricaoHorario, "id">) =>
    useMocks
      ? pause(created("horario-novo", "Janela de horário criada com sucesso"))
      : request<CreatedResponse>(endpoints.areas.schedules(areaId), {
          method: "POST",
          body: JSON.stringify(payload)
        }),
  updateSchedule: (areaId: string, id: string, payload: Omit<RestricaoHorario, "id">) =>
    useMocks
      ? pause(ok("Janela de horário atualizada com sucesso"))
      : request<MessageResponse>(endpoints.areas.schedule(areaId, id), {
          method: "PUT",
          body: JSON.stringify(payload)
        }),
  deleteSchedule: (areaId: string, id: string) =>
    useMocks
      ? pause(ok("Janela de horário removida com sucesso"))
      : request<MessageResponse>(endpoints.areas.schedule(areaId, id), { method: "DELETE" })
};

export const logsApi = {
  list: (params?: {
    funcionario_id?: string;
    area_id?: string;
    resultado?: string;
    data_inicio?: string;
    data_fim?: string;
    page?: number;
    limit?: number;
  }) =>
    useMocks
      ? pause<ListResponse<LogAcesso>>({
          data: logs,
          total: logs.length,
          page: 1,
          limit: 50
        })
      : request<ListResponse<LogAcesso>>(withQuery(endpoints.logs.list, params)),
  detail: (id: string) => (useMocks ? pause({ ...logDetalhe, id }) : request<LogDetalhe>(endpoints.logs.detail(id))),
  exportUrl: (params?: Record<string, QueryValue>) => withQuery(endpoints.logs.export, params)
};

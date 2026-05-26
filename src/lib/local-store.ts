"use client";

import type {
  AreaDetalhe,
  AreaResumo,
  DashboardResumo,
  EntityOption,
  EpiCritico,
  EpiVinculoResumo,
  FuncionarioDetalhe,
  FuncionarioResumo,
  LogAcesso,
  LogDetalhe
} from "./api-types";
import {
  areaDetalhe,
  areas as mockAreas,
  cargos as mockCargos,
  epiTipos as mockEpiTipos,
  epis as mockEpis,
  funcionarioDetalhe,
  funcionarios as mockFuncionarios,
  logs as mockLogs,
  setores as mockSetores
} from "./mock-data";

const STORE_KEY = "safeaccess_state_v3";
const TOKEN_KEY = "safeaccess_token";
const USER_KEY = "safeaccess_user";
const DAY_MS = 24 * 60 * 60 * 1000;

export type SafeAccessSession = {
  nome: string;
  email: string;
  expira_em: string;
};

export type SafeAccessState = {
  cargos: EntityOption[];
  setores: EntityOption[];
  epiTipos: EntityOption[];
  funcionarios: FuncionarioDetalhe[];
  areas: AreaDetalhe[];
  epis: EpiVinculoResumo[];
  logs: LogAcesso[];
};

export function uid(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }

  return `${prefix}-${Math.random().toString(16).slice(2, 10)}`;
}

export function daysUntil(date: string) {
  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / DAY_MS);
}

export function epiStatus(date: string): "ATIVO" | "VENCIDO" {
  return daysUntil(date) < 0 ? "VENCIDO" : "ATIVO";
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function detailFromResumo(funcionario: FuncionarioResumo, index: number): FuncionarioDetalhe {
  if (funcionario.id === funcionarioDetalhe.id) {
    return clone(funcionarioDetalhe);
  }

  const cargo = mockCargos.find((item) => item.nome === funcionario.cargo) ?? mockCargos[0];
  const setor = mockSetores.find((item) => item.nome === funcionario.setor) ?? mockSetores[0];

  return {
    id: funcionario.id,
    nome: funcionario.nome,
    cpf: `000.000.000-0${index + 1}`,
    rg: `9.000.00${index}`,
    matricula: funcionario.matricula,
    email: `${funcionario.nome.toLowerCase().replace(/\s+/g, ".").replace(".", "")}@empresa.com`,
    data_nascimento: "1992-01-10",
    genero: "NAO_INFORMADO",
    data_admissao: "2023-02-01",
    turno: "Comercial",
    status: funcionario.status,
    cargo,
    setor,
    cracha: {
      id: `cracha-${index + 1}`,
      uid_rfid: funcionario.cracha.uid_rfid,
      validade: funcionario.cracha.validade,
      perfil_acesso: cargo.nome.toUpperCase(),
      status: funcionario.cracha.status
    },
    epis: []
  };
}

function areaFromResumo(area: AreaResumo, index: number): AreaDetalhe {
  if (area.id === areaDetalhe.id) {
    return clone(areaDetalhe);
  }

  return {
    id: area.id,
    nome: area.nome,
    codigo: area.codigo,
    tipo: area.tipo,
    nivel_risco: area.nivel_risco,
    capacidade_maxima: Math.max(area.total_autorizados, 6),
    anti_passback: index % 2 === 0,
    verificar_epi: true,
    fail_open: area.nivel_risco.toLowerCase() !== "critico",
    status: area.status,
    epis_obrigatorios: mockEpiTipos.filter((epi) => area.epis_obrigatorios.some((nome) => epi.nome.includes(nome))),
    whitelist: mockFuncionarios
      .filter((funcionario) => funcionario.status === "ATIVO")
      .slice(0, 2)
      .map((funcionario, permissionIndex) => ({
        id: `perm-${area.id}-${permissionIndex}`,
        funcionario_id: funcionario.id,
        nome: funcionario.nome,
        cargo: funcionario.cargo
      })),
    blacklist: [],
    restricoes_horario: [
      { id: `hor-${area.id}-1`, dias: "Seg-Sex", hora_inicio: "06:00", hora_fim: "22:00", perfil: "Operacoes" }
    ]
  };
}

export function getInitialState(): SafeAccessState {
  const funcionarios = mockFuncionarios.map(detailFromResumo);
  const areas = mockAreas.map(areaFromResumo);
  const epis = clone(mockEpis).map((epi) => ({
    ...epi,
    dias_para_vencer: daysUntil(epi.data_validade),
    status: epiStatus(epi.data_validade)
  }));

  return {
    cargos: clone(mockCargos),
    setores: clone(mockSetores),
    epiTipos: clone(mockEpiTipos),
    funcionarios: funcionarios.map((funcionario) => ({
      ...funcionario,
      epis: epis
        .filter((epi) => epi.funcionario.id === funcionario.id)
        .map((epi) => ({
          id: epi.id,
          epi_tipo: epi.epi_tipo,
          nr_ca: epi.nr_ca,
          data_entrega: epi.data_entrega ?? "",
          data_validade: epi.data_validade,
          dias_para_vencer: epi.dias_para_vencer ?? daysUntil(epi.data_validade),
          status: epi.status
        }))
    })),
    areas,
    epis,
    logs: clone(mockLogs)
  };
}

export function loadState(): SafeAccessState {
  if (typeof window === "undefined") {
    return getInitialState();
  }

  const stored = window.localStorage.getItem(STORE_KEY);

  if (!stored) {
    const initial = getInitialState();
    saveState(initial);
    return initial;
  }

  try {
    return JSON.parse(stored) as SafeAccessState;
  } catch {
    const initial = getInitialState();
    saveState(initial);
    return initial;
  }
}

export function saveState(state: SafeAccessState) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }
}

export function resetState() {
  const initial = getInitialState();
  saveState(initial);
  return initial;
}

export function getSession(): SafeAccessSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem(TOKEN_KEY);
  const user = window.localStorage.getItem(USER_KEY);

  if (!token || !user) {
    return null;
  }

  try {
    return JSON.parse(user) as SafeAccessSession;
  } catch {
    clearSession();
    return null;
  }
}

export function setSession(session: SafeAccessSession) {
  window.localStorage.setItem(TOKEN_KEY, `mock-${Date.now()}`);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }
}

export function funcionarioResumo(funcionario: FuncionarioDetalhe): FuncionarioResumo {
  return {
    id: funcionario.id,
    nome: funcionario.nome,
    matricula: funcionario.matricula,
    cargo: funcionario.cargo.nome,
    setor: funcionario.setor.nome,
    status: funcionario.status as "ATIVO" | "INATIVO",
    cracha: {
      uid_rfid: funcionario.cracha.uid_rfid,
      validade: funcionario.cracha.validade,
      status: funcionario.cracha.status
    }
  };
}

export function areaResumo(area: AreaDetalhe): AreaResumo {
  return {
    id: area.id,
    nome: area.nome,
    codigo: area.codigo,
    tipo: area.tipo,
    nivel_risco: area.nivel_risco,
    status: area.status,
    total_autorizados: area.whitelist.length,
    epis_obrigatorios: area.epis_obrigatorios.map((epi) => epi.nome)
  };
}

export function dashboardResumo(state: SafeAccessState): DashboardResumo {
  const episCriticos = criticalEpis(state);
  const hoje = new Date().toISOString().slice(0, 10);

  return {
    total_funcionarios_ativos: state.funcionarios.filter((funcionario) => funcionario.status === "ATIVO").length,
    total_areas_ativas: state.areas.filter((area) => area.status !== "BLOQUEADA").length,
    total_epis_vencidos: state.epis.filter((epi) => epiStatus(epi.data_validade) === "VENCIDO").length,
    total_epis_a_vencer: episCriticos.filter((epi) => epi.status === "ALERTA").length,
    total_acessos_hoje: state.logs.filter((log) => log.ts_evento.slice(0, 10) === hoje).length || state.logs.length,
    total_negados_hoje: state.logs.filter((log) => log.resultado === "NEGADO").length
  };
}

export function criticalEpis(state: SafeAccessState): EpiCritico[] {
  return state.epis
    .map((epi) => {
      const dias = daysUntil(epi.data_validade);
      return {
        funcionario_id: epi.funcionario.id,
        funcionario_nome: epi.funcionario.nome,
        epi_tipo: epi.epi_tipo.nome,
        nr_ca: epi.nr_ca,
        data_validade: epi.data_validade,
        dias_para_vencer: dias,
        status: dias < 0 ? "VENCIDO" : "ALERTA"
      } satisfies EpiCritico;
    })
    .filter((epi) => epi.dias_para_vencer <= 30)
    .sort((a, b) => a.dias_para_vencer - b.dias_para_vencer);
}

export function logDetalhe(state: SafeAccessState, id: string): LogDetalhe | null {
  const log = state.logs.find((item) => item.id === id);

  if (!log) {
    return null;
  }

  const funcionario = state.funcionarios.find((item) => item.nome === log.funcionario_nome) ?? state.funcionarios[0];
  const area = state.areas.find((item) => item.nome === log.area_nome) ?? state.areas[0];

  return {
    id: log.id,
    funcionario: {
      id: funcionario.id,
      nome: funcionario.nome,
      matricula: funcionario.matricula
    },
    area: {
      id: area.id,
      nome: area.nome
    },
    resultado: log.resultado,
    motivo: log.motivo,
    ts_evento: log.ts_evento
  };
}

export function pushLog(state: SafeAccessState, log: Omit<LogAcesso, "id" | "ts_evento">) {
  state.logs = [
    {
      id: uid("log"),
      ts_evento: new Date().toISOString(),
      ...log
    },
    ...state.logs
  ];
}

export type CsvColumn<T extends Record<string, string | number>> = {
  key: keyof T;
  label: string;
};

export function toCsv<T extends Record<string, string | number>>(rows: T[], columns: Array<CsvColumn<T>>) {
  const escape = (value: string | number | undefined) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header = columns.map((column) => escape(column.label)).join(";");
  const body = rows.map((row) => columns.map((column) => escape(row[column.key])).join(";"));
  return [header, ...body].join("\r\n");
}

export function downloadTextFile(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const normalizedContent = type.includes("csv") ? `\uFEFF${content}` : content;
  const blob = new Blob([normalizedContent], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

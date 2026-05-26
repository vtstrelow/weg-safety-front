export type ApiErrorBody = {
  error: string;
  campos?: string[];
  desbloqueio_em?: string;
};

export type AuthLoginResponse = {
  token: string;
  nome: string;
  email: string;
  expira_em: string;
};

export type AuthMeResponse = {
  id: string;
  nome: string;
  email: string;
  status: string;
  ultimo_acesso: string;
};

export type MessageResponse = {
  message: string;
};

export type CreatedResponse = {
  id: string;
  message: string;
};

export type EntityOption = {
  id: string;
  nome: string;
  ativo?: boolean;
};

export type CrachaResumo = {
  uid_rfid: string;
  validade: string;
  status: string;
};

export type FuncionarioResumo = {
  id: string;
  nome: string;
  matricula: string;
  cargo: string;
  setor: string;
  status: "ATIVO" | "INATIVO";
  cracha: CrachaResumo;
};

export type EpiFuncionario = {
  id: string;
  epi_tipo: EntityOption;
  nr_ca: string;
  data_entrega: string;
  data_validade: string;
  dias_para_vencer: number;
  status: "ATIVO" | "VENCIDO" | "INATIVO";
};

export type FuncionarioDetalhe = {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  matricula: string;
  email: string;
  data_nascimento: string;
  genero: string;
  data_admissao: string;
  turno: string;
  status: string;
  cargo: EntityOption;
  setor: EntityOption;
  cracha: {
    id: string;
    uid_rfid: string;
    validade: string;
    perfil_acesso: string;
    status: string;
  };
  epis: EpiFuncionario[];
};

export type FuncionarioPayload = {
  nome: string;
  cpf: string;
  rg: string;
  email: string;
  data_nascimento: string;
  genero: string;
  cargo_id: string;
  setor_id: string;
  data_admissao: string;
  turno: string;
  cracha?: {
    uid_rfid: string;
    validade: string;
    perfil_acesso: string;
  };
  epis?: Array<{
    epi_tipo_id: string;
    nr_ca: string;
    data_entrega: string;
    data_validade: string;
  }>;
};

export type FuncionarioCreateResponse = {
  id: string;
  matricula: string;
  message: string;
};

export type ListResponse<T> = {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
};

export type AreaResumo = {
  id: string;
  nome: string;
  codigo: string;
  tipo: string;
  nivel_risco: string;
  status: string;
  total_autorizados: number;
  epis_obrigatorios: string[];
};

export type AreaDetalhe = {
  id: string;
  nome: string;
  codigo: string;
  tipo: string;
  nivel_risco: string;
  capacidade_maxima: number;
  anti_passback: boolean;
  verificar_epi: boolean;
  fail_open: boolean;
  status: string;
  epis_obrigatorios: EntityOption[];
  whitelist: Array<{
    id: string;
    funcionario_id: string;
    nome: string;
    cargo?: string;
  }>;
  blacklist: Array<{
    id: string;
    funcionario_id: string;
    nome: string;
    motivo: string;
  }>;
  restricoes_horario: RestricaoHorario[];
};

export type AreaFuncionario = {
  id: string;
  nome: string;
  matricula: string;
  cargo: string;
  tipo_permissao: "WHITELIST";
  epis_validos: boolean;
};

export type AreaPayload = {
  nome: string;
  codigo: string;
  tipo: string;
  nivel_risco: string;
  capacidade_maxima: number;
  anti_passback: boolean;
  verificar_epi: boolean;
  fail_open: boolean;
  epis_obrigatorios: string[];
  whitelist?: Array<{ funcionario_id: string }>;
  blacklist?: Array<{ funcionario_id: string; motivo: string }>;
  restricoes_horario?: Array<{
    dias: string;
    hora_inicio: string;
    hora_fim: string;
    perfil: string;
  }>;
};

export type RestricaoHorario = {
  id: string;
  dias: string;
  hora_inicio: string;
  hora_fim: string;
  perfil: string;
};

export type PermissoesArea = {
  whitelist: Array<{
    id: string;
    funcionario_id: string;
    nome: string;
    cargo?: string;
  }>;
  blacklist: Array<{
    id: string;
    funcionario_id: string;
    nome: string;
    motivo: string;
  }>;
};

export type CrachaPayload = {
  funcionario_id: string;
  uid_rfid: string;
  validade: string;
  perfil_acesso: string;
};

export type CrachaDetalhe = {
  id: string;
  uid_rfid: string;
  validade: string;
  perfil_acesso: string;
  status: string;
  data_emissao: string;
  funcionario: {
    id: string;
    nome: string;
    matricula: string;
  };
};

export type CrachaValidacao = {
  valido: boolean;
  funcionario?: {
    id: string;
    nome: string;
    status: string;
  };
  cracha?: {
    perfil_acesso: string;
    validade: string;
    status: string;
  };
  error?: string;
};

export type EpiVinculoResumo = {
  id: string;
  funcionario: {
    id: string;
    nome: string;
    matricula?: string;
  };
  epi_tipo: EntityOption;
  nr_ca: string;
  data_validade: string;
  data_entrega?: string;
  dias_para_vencer?: number;
  status: "ATIVO" | "VENCIDO" | "INATIVO";
};

export type EpiPayload = {
  funcionario_id: string;
  epi_tipo_id: string;
  nr_ca: string;
  data_entrega: string;
  data_validade: string;
};

export type EpiCritico = {
  funcionario_id?: string;
  funcionario_nome: string;
  epi_tipo: string;
  nr_ca?: string;
  data_validade: string;
  dias_para_vencer: number;
  status: "ALERTA" | "VENCIDO" | "BLOQUEADO";
};

export type LogAcesso = {
  id: string;
  funcionario_nome: string;
  area_nome: string;
  resultado: "PERMITIDO" | "NEGADO";
  motivo: string;
  ts_evento: string;
};

export type LogDetalhe = {
  id: string;
  funcionario: {
    id: string;
    nome: string;
    matricula: string;
  };
  area: {
    id: string;
    nome: string;
  };
  resultado: "PERMITIDO" | "NEGADO";
  motivo: string;
  ts_evento: string;
};

export type DashboardResumo = {
  total_funcionarios_ativos: number;
  total_areas_ativas: number;
  total_epis_vencidos: number;
  total_epis_a_vencer: number;
  total_acessos_hoje: number;
  total_negados_hoje: number;
};

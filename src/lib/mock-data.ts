import type {
  AreaDetalhe,
  AreaFuncionario,
  AreaResumo,
  CrachaDetalhe,
  DashboardResumo,
  EntityOption,
  EpiCritico,
  EpiVinculoResumo,
  FuncionarioDetalhe,
  FuncionarioResumo,
  LogDetalhe,
  LogAcesso
} from "./api-types";

export const cargos: EntityOption[] = [
  { id: "cargo-1", nome: "Analista TI", ativo: true },
  { id: "cargo-2", nome: "Operador", ativo: true },
  { id: "cargo-3", nome: "Supervisor", ativo: true },
  { id: "cargo-4", nome: "Manutenção Mecânica", ativo: true }
];

export const setores: EntityOption[] = [
  { id: "setor-1", nome: "Tecnologia", ativo: true },
  { id: "setor-2", nome: "Produção", ativo: true },
  { id: "setor-3", nome: "Qualidade", ativo: true },
  { id: "setor-4", nome: "Manutenção", ativo: true }
];

export const epiTipos: EntityOption[] = [
  { id: "epi-1", nome: "Capacete", ativo: true },
  { id: "epi-2", nome: "Bota de segurança", ativo: true },
  { id: "epi-3", nome: "Luva NR-10", ativo: true },
  { id: "epi-4", nome: "Óculos", ativo: true },
  { id: "epi-5", nome: "Protetor auricular", ativo: true }
];

export const funcionarios: FuncionarioResumo[] = [
  {
    id: "func-1",
    nome: "Ana Costa",
    matricula: "001234",
    cargo: "Analista TI",
    setor: "Tecnologia",
    status: "ATIVO",
    cracha: { uid_rfid: "RFID-8A42", validade: "2026-03-01", status: "ATIVO" }
  },
  {
    id: "func-2",
    nome: "Bruno Lima",
    matricula: "002187",
    cargo: "Operador",
    setor: "Produção",
    status: "INATIVO",
    cracha: { uid_rfid: "RFID-7C19", validade: "2025-09-01", status: "INATIVO" }
  },
  {
    id: "func-3",
    nome: "Carla Mendes",
    matricula: "003041",
    cargo: "Supervisor",
    setor: "Qualidade",
    status: "ATIVO",
    cracha: { uid_rfid: "RFID-1F20", validade: "2026-01-15", status: "ATIVO" }
  },
  {
    id: "func-4",
    nome: "Pedro R.",
    matricula: "003722",
    cargo: "Manutenção Mecânica",
    setor: "Manutenção",
    status: "ATIVO",
    cracha: { uid_rfid: "RFID-3D91", validade: "2026-06-20", status: "ATIVO" }
  }
];

export const funcionarioDetalhe: FuncionarioDetalhe = {
  id: "func-1",
  nome: "Ana Costa",
  cpf: "123.456.789-09",
  rg: "5.234.881",
  matricula: "001234",
  email: "ana.costa@empresa.com",
  data_nascimento: "1994-08-12",
  genero: "FEMININO",
  data_admissao: "2021-04-02",
  turno: "Comercial",
  status: "ATIVO",
  cargo: cargos[0],
  setor: setores[0],
  cracha: {
    id: "cracha-1",
    uid_rfid: "RFID-8A42",
    validade: "2026-03-01",
    perfil_acesso: "OPERADOR",
    status: "ATIVO"
  },
  epis: [
    {
      id: "epi-func-1",
      epi_tipo: epiTipos[0],
      nr_ca: "12345",
      data_entrega: "2025-03-01",
      data_validade: "2026-03-01",
      dias_para_vencer: 280,
      status: "ATIVO"
    },
    {
      id: "epi-func-2",
      epi_tipo: epiTipos[1],
      nr_ca: "22871",
      data_entrega: "2025-03-01",
      data_validade: "2025-09-01",
      dias_para_vencer: -266,
      status: "VENCIDO"
    }
  ]
};

export const areas: AreaResumo[] = [
  {
    id: "area-1",
    nome: "Portaria",
    codigo: "POR-01",
    tipo: "Aberta",
    nivel_risco: "Baixo",
    status: "LIBERADA",
    total_autorizados: 12,
    epis_obrigatorios: ["Capacete", "Bota", "NR-33"]
  },
  {
    id: "area-2",
    nome: "Refeitório",
    codigo: "REF-01",
    tipo: "Aberta",
    nivel_risco: "Baixo",
    status: "LIBERADA",
    total_autorizados: 48,
    epis_obrigatorios: ["Capacete", "Bota"]
  },
  {
    id: "area-3",
    nome: "Caldeiraria",
    codigo: "CAL-01",
    tipo: "Restrita",
    nivel_risco: "Médio",
    status: "LIBERADA",
    total_autorizados: 22,
    epis_obrigatorios: ["Capacete", "Bota", "NR-53"]
  },
  {
    id: "area-4",
    nome: "Tanque T-04",
    codigo: "TQ04",
    tipo: "Confinada",
    nivel_risco: "Crítico",
    status: "RESTRITA",
    total_autorizados: 3,
    epis_obrigatorios: ["Capacete", "Bota", "NR-33"]
  },
  {
    id: "area-5",
    nome: "Lab. Químico",
    codigo: "LAB-Q",
    tipo: "Restrita",
    nivel_risco: "Alto",
    status: "LIBERADA",
    total_autorizados: 8,
    epis_obrigatorios: ["Capacete", "Bota", "Óculos"]
  }
];

export const areaDetalhe: AreaDetalhe = {
  id: "area-4",
  nome: "Tanque T-04",
  codigo: "TQ04",
  tipo: "Confinada",
  nivel_risco: "Crítico",
  capacidade_maxima: 4,
  anti_passback: true,
  verificar_epi: true,
  fail_open: true,
  status: "RESTRITA",
  epis_obrigatorios: [epiTipos[0], epiTipos[1], epiTipos[2]],
  whitelist: [
    { id: "perm-1", funcionario_id: "func-4", nome: "Pedro R.", cargo: "Manutenção Mecânica" },
    { id: "perm-2", funcionario_id: "func-3", nome: "Carla Mendes", cargo: "Supervisor" }
  ],
  blacklist: [{ id: "perm-3", funcionario_id: "func-2", nome: "Bruno Lima", motivo: "Restrição operacional" }],
  restricoes_horario: [
    { id: "hor-1", dias: "Seg-Sex", hora_inicio: "06:00", hora_fim: "22:00", perfil: "Operações" },
    { id: "hor-2", dias: "Sáb", hora_inicio: "08:00", hora_fim: "14:00", perfil: "Manutenção" }
  ]
};

export const epis: EpiVinculoResumo[] = [
  {
    id: "epi-func-1",
    funcionario: { id: "func-1", nome: "Ana Costa", matricula: "001234" },
    epi_tipo: epiTipos[0],
    nr_ca: "12345",
    data_entrega: "2025-03-01",
    data_validade: "2026-03-01",
    dias_para_vencer: 280,
    status: "ATIVO"
  },
  {
    id: "epi-func-2",
    funcionario: { id: "func-4", nome: "Pedro R.", matricula: "003722" },
    epi_tipo: epiTipos[1],
    nr_ca: "22871",
    data_entrega: "2025-01-02",
    data_validade: "2025-09-01",
    dias_para_vencer: -266,
    status: "VENCIDO"
  },
  {
    id: "epi-func-3",
    funcionario: { id: "func-3", nome: "Carla Mendes", matricula: "003041" },
    epi_tipo: epiTipos[2],
    nr_ca: "33210",
    data_entrega: "2025-01-15",
    data_validade: "2026-01-15",
    dias_para_vencer: 235,
    status: "ATIVO"
  }
];

export const epiCriticos: EpiCritico[] = [
  {
    funcionario_id: "func-4",
    funcionario_nome: "Pedro R.",
    epi_tipo: "Bota de segurança",
    nr_ca: "22871",
    data_validade: "2026-06-06",
    dias_para_vencer: 12,
    status: "ALERTA"
  },
  {
    funcionario_id: "func-5",
    funcionario_nome: "Carlos M.",
    epi_tipo: "NR-33 / Protetor",
    nr_ca: "11920",
    data_validade: "2026-06-22",
    dias_para_vencer: 28,
    status: "ALERTA"
  },
  {
    funcionario_id: "func-2",
    funcionario_nome: "Bruno Lima",
    epi_tipo: "Bota de segurança",
    nr_ca: "22871",
    data_validade: "2025-09-01",
    dias_para_vencer: -266,
    status: "VENCIDO"
  }
];

export const logs: LogAcesso[] = [
  {
    id: "log-1",
    funcionario_nome: "Ana Costa",
    area_nome: "Entrada Principal",
    resultado: "PERMITIDO",
    motivo: "",
    ts_evento: "2026-05-25T08:14:00-03:00"
  },
  {
    id: "log-2",
    funcionario_nome: "Bruno Lima",
    area_nome: "Sala de Máquinas",
    resultado: "NEGADO",
    motivo: "EPI vencido",
    ts_evento: "2026-05-25T08:31:00-03:00"
  },
  {
    id: "log-3",
    funcionario_nome: "Carla Mendes",
    area_nome: "Laboratório B",
    resultado: "PERMITIDO",
    motivo: "",
    ts_evento: "2026-05-25T09:02:00-03:00"
  }
];

export const areaFuncionarios: AreaFuncionario[] = [
  {
    id: "func-1",
    nome: "Ana Costa",
    matricula: "001234",
    cargo: "Analista TI",
    tipo_permissao: "WHITELIST",
    epis_validos: true
  },
  {
    id: "func-3",
    nome: "Carla Mendes",
    matricula: "003041",
    cargo: "Supervisor",
    tipo_permissao: "WHITELIST",
    epis_validos: true
  },
  {
    id: "func-4",
    nome: "Pedro R.",
    matricula: "003722",
    cargo: "Manutenção Mecânica",
    tipo_permissao: "WHITELIST",
    epis_validos: false
  }
];

export const crachaDetalhe: CrachaDetalhe = {
  id: "cracha-1",
  uid_rfid: "RFID-8A42",
  validade: "2026-03-01",
  perfil_acesso: "OPERADOR",
  status: "ATIVO",
  data_emissao: "2025-03-01T08:00:00-03:00",
  funcionario: {
    id: "func-1",
    nome: "Ana Costa",
    matricula: "001234"
  }
};

export const logDetalhe: LogDetalhe = {
  id: "log-2",
  funcionario: {
    id: "func-2",
    nome: "Bruno Lima",
    matricula: "002187"
  },
  area: {
    id: "area-3",
    nome: "Sala de Máquinas"
  },
  resultado: "NEGADO",
  motivo: "EPI vencido",
  ts_evento: "2026-05-25T08:31:00-03:00"
};

export const dashboardResumo: DashboardResumo = {
  total_funcionarios_ativos: 3,
  total_areas_ativas: 5,
  total_epis_vencidos: 1,
  total_epis_a_vencer: 2,
  total_acessos_hoje: 126,
  total_negados_hoje: 7
};
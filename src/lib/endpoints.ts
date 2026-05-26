export const endpoints = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    me: "/api/auth/me",
    changePassword: "/api/auth/me/senha"
  },
  funcionarios: {
    list: "/api/funcionarios",
    detail: (id: string) => `/api/funcionarios/${id}`,
    create: "/api/funcionarios",
    update: (id: string) => `/api/funcionarios/${id}`,
    status: (id: string) => `/api/funcionarios/${id}/status`
  },
  crachas: {
    create: "/api/crachas",
    detail: (id: string) => `/api/crachas/${id}`,
    invalidate: (id: string) => `/api/crachas/${id}/invalidar`,
    validate: (uidRfid: string) => `/api/crachas/validar/${uidRfid}`
  },
  cargos: {
    list: "/api/cargos",
    detail: (id: string) => `/api/cargos/${id}`,
    create: "/api/cargos",
    update: (id: string) => `/api/cargos/${id}`,
    delete: (id: string) => `/api/cargos/${id}`
  },
  setores: {
    list: "/api/setores",
    detail: (id: string) => `/api/setores/${id}`,
    create: "/api/setores",
    update: (id: string) => `/api/setores/${id}`,
    delete: (id: string) => `/api/setores/${id}`
  },
  epiTipos: {
    list: "/api/epi-tipos",
    detail: (id: string) => `/api/epi-tipos/${id}`,
    create: "/api/epi-tipos",
    update: (id: string) => `/api/epi-tipos/${id}`,
    delete: (id: string) => `/api/epi-tipos/${id}`
  },
  epis: {
    list: "/api/epis",
    detail: (id: string) => `/api/epis/${id}`,
    byFuncionario: (funcionarioId: string) => `/api/epis/funcionario/${funcionarioId}`,
    expirations: "/api/epis/vencimentos",
    create: "/api/epis",
    remove: (id: string) => `/api/epis/${id}/remover`
  },
  areas: {
    list: "/api/areas",
    detail: (id: string) => `/api/areas/${id}`,
    funcionarios: (id: string) => `/api/areas/${id}/funcionarios`,
    create: "/api/areas",
    update: (id: string) => `/api/areas/${id}`,
    status: (id: string) => `/api/areas/${id}/status`,
    permissions: (areaId: string) => `/api/areas/${areaId}/permissoes`,
    permission: (areaId: string, id: string) => `/api/areas/${areaId}/permissoes/${id}`,
    schedules: (areaId: string) => `/api/areas/${areaId}/horarios`,
    schedule: (areaId: string, id: string) => `/api/areas/${areaId}/horarios/${id}`
  },
  logs: {
    list: "/api/logs",
    detail: (id: string) => `/api/logs/${id}`,
    export: "/api/logs/export"
  },
  dashboard: {
    summary: "/api/dashboard/resumo",
    criticalEpis: "/api/dashboard/epis-criticos",
    recentAccess: "/api/dashboard/acessos-recentes"
  }
} as const;

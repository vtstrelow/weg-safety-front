# SafeAccess Front-end

Painel administrativo do MVP do Sistema de Controle de Acesso Industrial.

## Stack

- Next.js
- TypeScript
- Tailwind CSS

## Como rodar

```bash
npm install
npm run dev:local
```

O projeto usa dados mockados por padrão para permitir o desenvolvimento sem backend.
Quando a API estiver pronta, crie um `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_USE_MOCKS=false
```

## Rotas do MVP

- `/login`: autenticação do administrador.
- `/dashboard`: resumo operacional e alertas.
- `/funcionarios`: listagem, filtros e acesso ao detalhe.
- `/funcionarios/novo`: cadastro com crachá e EPIs.
- `/funcionarios/[id]`: detalhe do funcionário, crachá e EPIs.
- `/areas`: listagem, filtros e ações de regras/bloqueio.
- `/areas/nova`: cadastro de área e regras iniciais.
- `/areas/[id]`: regras, whitelist, blacklist e janelas horárias.
- `/epis`: gestão de vínculos e vencimentos.
- `/relatorios`: logs de acesso e exportação.
- `/relatorios/[id]`: detalhe de auditoria de um log.
- `/configuracoes`: cargos, setores e tipos de EPI.

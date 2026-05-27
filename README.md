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
Quando a API estiver pronta, crie um .env.local:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_USE_MOCKS=false
```

## Rotas do MVP

| Rota | Descrição |
| :--- | :--- |
| 🔒 `/login` | Autenticação do administrador. |
| 📊 `/dashboard` | Resumo operacional e alertas. |
| 👥 `/funcionarios` | Listagem, filtros e acesso ao detalhe. |
| ➕ `/funcionarios/novo` | Cadastro com crachá e EPIs. |
| 🪪 `/funcionarios/[id]` | Detalhe do funcionário, crachá e EPIs. |
| 🚧 `/areas` | Listagem, filtros e ações de regras/bloqueio. |
| ➕ `/areas/nova` | Cadastro de área e regras iniciais. |
| ⚙️ `/areas/[id]` | Regras, whitelist, blacklist e janelas horárias. |
| 🦺 `/epis` | Gestão de vínculos e vencimentos. |
| 📋 `/relatorios` | Logs de acesso e exportação. |
| 🔍 `/relatorios/[id]` | Detalhe de auditoria de um log. |
| 🛠️ `/configuracoes` | Cargos, setores e tipos de EPI. |

## 📁 Estrutura do Projeto

```
📂 public/           — Arquivos públicos e estáticos (logos, ícones).
📂 src/              — Diretório principal com o código-fonte do app.
 ├── 🧱 components/  — Componentes visuais reutilizáveis da interface.
 ├── 🪝 hooks/       — Hooks customizados para gerenciamento de estado e lógica.
 ├── 📄 pages/       — Páginas e rotas estruturadas do Next.js.
 ├── 🎨 styles/      — Arquivos de estilo e configurações do Tailwind CSS.
 └── 🛠️ utils/       — Funções auxiliares e arquivos de dados mockados.
```

# CI / Deploy — secrets necessários

Este repositório consome os contratos de um repositório **privado**
(`@feedback/lib-shared` → `TCC-Feedback-Analytics/feedback-analytics-contracts`,
via dependência git por tag). Por isso o CI precisa de um token para instalar
essa dependência, além dos secrets de build/deploy.

Configure em **Settings → Secrets and variables → Actions**:

| Secret | Usado em | Para quê |
|---|---|---|
| `CONTRACTS_TOKEN` | ci · deploy · e2e | PAT (fine-grained, **read-only Contents** no repo `feedback-analytics-contracts`) para o `npm ci` clonar o pacote privado. O `GITHUB_TOKEN` padrão só enxerga este repo. |
| `SUPABASE_URL` | deploy (homolog) · e2e-main | URL do Supabase usada **pelo e2e** (setup/limpeza de dados via service role). O app **não** usa Supabase no browser. |
| `VERCEL_TOKEN` | deploy | Token da conta/projeto Vercel. |
| `VERCEL_ORG_ID` | deploy | ID da org no Vercel. |
| `VERCEL_PROJECT_ID_WEB` | deploy | ID do projeto Vercel do frontend. |
| `E2E_TEST_EMAIL` · `E2E_TEST_PASSWORD` · `E2E_TEST_ENTERPRISE_ID` | deploy (homolog) · e2e-main | Credenciais do e2e contra o homolog. |
| `SUPABASE_SERVICE_ROLE_KEY` | deploy (homolog) · e2e-main | Setup/limpeza de dados do e2e. |

## Por que o token do contrato

O `package-lock.json` resolve `@feedback/lib-shared` como `git+ssh://…` (npm
canonicaliza deps do GitHub para ssh). Os workflows reescrevem **ssh→https** e
**https→https** com o `CONTRACTS_TOKEN` antes do `npm ci`
(`git config --global --add url.<token@github>.insteadOf …`), então o clone do
pacote privado funciona sem chave SSH no runner.

## Vercel

O deploy é por **CLI com token** (`npx vercel deploy --local-config vercel.json`),
disparado manualmente (`workflow_dispatch`). O `vercel.json` já aponta para a raiz
do repo (build de `package.json`, saída em `dist`, SPA fallback para `index.html`).
Se o projeto Vercel ainda estiver conectado ao monorepo via Git Integration,
desconecte lá para evitar deploy duplicado — este repo publica via CLI.

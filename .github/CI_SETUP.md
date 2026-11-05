# CI / Deploy — secrets necessários

Este repositório consome os contratos de `@feedback/lib-shared`
(`TCC-Feedback-Analytics/feedback-analytics-contracts`, **repositório público**,
via dependência git — tag `v1.8.0` no `package.json`). Como o repo é público, o `npm ci` clona sem token —
os workflows só reescrevem `ssh→https` (ver abaixo). Nenhum secret é necessário
para o **CI** (lint/typecheck/build/unit).

## Workflows

| Workflow | Gatilho | Jobs |
|---|---|---|
| `ci.yml` (CI Pipeline - Web) | `push` e `pull_request` para `main` e `developer` | `lint-typecheck-build`: `npm run lint`, `tsc -p tsconfig.ci.json --noEmit` (sem os testes) e `npm run build`. `unit-tests`: `npm run test -- run` (Vitest em execução única). Node 20. |
| `deploy-web.yml` (Deploy Web (Vercel)) | Manual (`workflow_dispatch`), com o campo `confirm_deploy` = `ok` | `deploy-web`: recusa qualquer branch que não seja `main`, roda `npm ci` e publica em produção pela CLI da Vercel. Node 20. Um deploy novo na mesma branch cancela o anterior (`concurrency`). |

Configure em **Settings → Secrets and variables → Actions** apenas o que o
workflow de **deploy** usa:

| Secret | Usado em | Para quê |
|---|---|---|
| `VERCEL_TOKEN` | deploy | Token da conta/projeto Vercel. |
| `VERCEL_ORG_ID` | deploy | ID da org no Vercel. |
| `VERCEL_PROJECT_ID_WEB` | deploy | ID do projeto Vercel do frontend (vira `VERCEL_PROJECT_ID` no passo de deploy). |

> O deploy é **só `main` → produção** (sem ambiente homolog/`developer`). O e2e (Playwright) foi **removido do CI** e virou **teste manual**, então os secrets de Supabase/E2E não são mais necessários. Runbook manual: `feedback-analytics/docs/guias/testes/manuais-web.md`.

## Por que o rewrite ssh→https

O `package-lock.json` resolve `@feedback/lib-shared` como `git+ssh://…` (o npm
canonicaliza deps do GitHub para ssh). Os runners não têm chave SSH, então cada
workflow reescreve a URL para https **anônimo** antes do `npm ci`:

```
git config --global url."https://github.com/".insteadOf "ssh://git@github.com/"
```

Como o repo de contratos é público, isso basta — sem token. Se um dia o contrato
voltar a ser privado, este passo precisaria injetar um PAT com read no repo.

## Vercel

O deploy é por **CLI com token** (`npx vercel deploy --yes --prod --local-config vercel.json`),
disparado manualmente (`workflow_dispatch`). O `vercel.json` já aponta para a raiz
do repo (build de `package.json` com `@vercel/static-build`, saída em `dist`) e define dois `rewrites`:
`/api/*` vai para o gateway (`https://feedback-analytics-api-gateway.vercel.app/api/*`), e o resto
cai no `index.html` (SPA fallback).
O workflow não roda o build: ele envia o código e a Vercel builda. Por isso as variáveis
`VITE_*` (lista no `.env.example`) ficam no projeto da Vercel, não nos Secrets do GitHub.
Se o projeto Vercel ainda tiver uma Git Integration ativa (de uma configuração
anterior), desconecte-a para evitar deploy duplicado — este repo publica
exclusivamente via CLI com token.

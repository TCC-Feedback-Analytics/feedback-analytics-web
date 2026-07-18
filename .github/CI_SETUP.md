# CI / Deploy — secrets necessários

Este repositório consome os contratos de `@feedback/lib-shared`
(`TCC-Feedback-Analytics/feedback-analytics-contracts`, **repositório público**,
via dependência git — tag `v1.0.0`). Como o repo é público, o `npm ci` clona sem token —
os workflows só reescrevem `ssh→https` (ver abaixo). Nenhum secret é necessário
para o **CI** (lint/typecheck/build/unit).

Configure em **Settings → Secrets and variables → Actions** apenas o que os
workflows de **deploy** e **e2e** usam:

| Secret | Usado em | Para quê |
|---|---|---|
| `VERCEL_TOKEN` | deploy | Token da conta/projeto Vercel. |
| `VERCEL_ORG_ID` | deploy | ID da org no Vercel. |
| `VERCEL_PROJECT_ID_WEB` | deploy | ID do projeto Vercel do frontend. |
| `SUPABASE_URL` | deploy (developer) · e2e-main | URL do Supabase usada **pelo e2e** (setup/limpeza de dados via service role). O app **não** usa Supabase no browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | deploy (developer) · e2e-main | Setup/limpeza de dados do e2e. |
| `E2E_TEST_EMAIL` · `E2E_TEST_PASSWORD` · `E2E_TEST_ENTERPRISE_ID` | deploy (developer) · e2e-main | Dados obrigatórios da fixture Better Auth do ambiente developer; o setup falha de imediato se algum estiver ausente. |

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

O deploy é por **CLI com token** (`npx vercel deploy --local-config vercel.json`),
disparado manualmente (`workflow_dispatch`). O `vercel.json` já aponta para a raiz
do repo (build de `package.json`, saída em `dist`, SPA fallback para `index.html`).
Se o projeto Vercel ainda tiver uma Git Integration ativa (de uma configuração
anterior), desconecte-a para evitar deploy duplicado — este repo publica
exclusivamente via CLI com token.

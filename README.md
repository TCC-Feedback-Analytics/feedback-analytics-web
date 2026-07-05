# feedback-analytics-web

Frontend do [Feedback Analytics](https://github.com/TCC-Feedback-Analytics/feedback-analytics) — uma **SPA React** com a área pública (login, cadastro, recuperação de senha e coleta de feedback por QR Code) e o **dashboard** da empresa (feedbacks, catálogo, QR Codes e painel de insights por IA).

O frontend **não fala com o banco nem com o provedor de auth diretamente**: toda comunicação passa pelo **API Gateway** (via `src/lib/utils/http.ts`, com `credentials: 'include'` — a sessão é um cookie httpOnly gerenciado pela API). A autenticação do backend usa **Better Auth**, mas isso é transparente para o frontend: os endpoints de auth do gateway (`/api/public/auth/...`) seguem com os mesmos caminhos.

- **Stack:** React 19 · Vite 7 · React Router DOM 7 (loaders/actions) · Tailwind CSS v4 · TypeScript
- **Formulários:** React Hook Form + Zod
- **Contratos:** tipos e schemas de [`@feedback/lib-shared`](https://github.com/TCC-Feedback-Analytics/feedback-analytics-contracts) (git tag `v1.0.0`, consumidos via alias `lib`)
- **Deploy:** Vercel — build estático (SPA) com rewrite catch-all para `index.html`

## Rodar localmente

Este repositório **é** o app — os comandos rodam na raiz dele:

```bash
npm install
cp .env.example .env    # VITE_API_BASE_URL=http://localhost:3000 (a API precisa estar rodando)
npm run dev             # http://localhost:5173
```

```bash
npm run build           # build de produção (dist/)
npm test                # unitários (Vitest); use `npm run test -- run` para single-shot
npm run test:e2e        # e2e (Playwright)
npm run lint
```

> Em previews/produção na Vercel, `VITE_API_BASE_URL` fica **vazia**: a base da API é derivada pelo hostname (o slug `feedback-analytics-web` vira `feedback-analytics-api` no mesmo `.vercel.app`).

## Documentação

- [Visão geral](docs/visao-geral.md) · [Arquitetura e estrutura](docs/arquitetura-estrutura.md) · [System design](docs/system-design.md) · [Fluxo de autenticação](docs/fluxo-autenticacao.md) · [Interface e performance](docs/interface-performance.md)
- CI/CD e deploy: [`.github/CI_SETUP.md`](.github/CI_SETUP.md)
- Concepção, decisões e produto: [repositório central de documentação](https://github.com/TCC-Feedback-Analytics/feedback-analytics)

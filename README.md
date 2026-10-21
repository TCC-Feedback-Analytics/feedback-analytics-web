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
npm run lint
```

> **Em produção na Vercel**, a Web repassa `/api/*` ao API Gateway (`rewrites` do `vercel.json`). Assim, o cookie de sessão é do próprio site: Safari e Samsung Internet bloqueiam cookie de outro domínio, e o login não se mantinha. As variáveis ficam assim:
>
> - `VITE_API_BASE_URL` **vazia**, para chamar `/api` no próprio site.
> - `VITE_PUBLIC_API_BASE_URL` com a URL pública do gateway. É usada nas rotas públicas que contam por IP: o formulário do cliente e o reenvio da confirmação.
> - No gateway, `COOKIE_CROSS_SITE=false` e `BETTER_AUTH_URL` com a URL da Web.
>
> Trocar o endereço do gateway é mudar o `vercel.json` e a `VITE_PUBLIC_API_BASE_URL`.

> Os casos de uso (UC-01…UC-12), antes cobertos por e2e Playwright, agora têm um **runbook de teste manual** na documentação central: `feedback-analytics/docs/guias/testes/manuais-web.md`.

## Documentação

- [Visão geral](docs/visao-geral.md) · [Arquitetura e estrutura](docs/arquitetura-estrutura.md) · [System design](docs/system-design.md) · [Fluxo de autenticação](docs/fluxo-autenticacao.md) · [Interface e performance](docs/interface-performance.md)
- CI/CD e deploy: [`.github/CI_SETUP.md`](.github/CI_SETUP.md)
- Concepção, decisões e produto: [repositório central de documentação](https://github.com/TCC-Feedback-Analytics/feedback-analytics)

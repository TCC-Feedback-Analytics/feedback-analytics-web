# feedback-analytics-web

Frontend do [Feedback Analytics](https://github.com/TCC-Feedback-Analytics/feedback-analytics) — uma **SPA React** com a área pública (login por e-mail ou Google, cadastro, recuperação de senha, Política de Privacidade, Termos e o formulário de coleta de feedback, aberto por QR Code, link ou etiqueta NFC) e o **dashboard** da empresa (métricas por escopo e período, comparação de itens, diagnóstico e análise dos comentários por IA, feedbacks recebidos, configuração da coleta e da IA, perfil).

O frontend **não fala com o banco nem com o provedor de auth diretamente**: toda comunicação passa pelo **API Gateway**, pelos caminhos `/api/*` (via `src/lib/utils/http.ts`, com `credentials: 'include'` — a sessão é um cookie httpOnly gerenciado pela API). A autenticação do backend usa **Better Auth**: a Web chama os endpoints de auth do gateway (`/api/public/auth/...`) e, para entrar com o Google e excluir a conta, as rotas nativas do Better Auth (`/api/auth/...`), também pelo gateway.

- **Stack:** React 19 · Vite 7 · React Router DOM 7 (loaders/actions) · Tailwind CSS v4 · TypeScript
- **Formulários:** React Hook Form + Zod
- **Contratos:** tipos e schemas de [`@feedback/lib-shared`](https://github.com/TCC-Feedback-Analytics/feedback-analytics-contracts) (git tag `v1.9.0`, consumidos via alias `lib`)
- **Deploy:** Vercel — build estático (SPA); o `vercel.json` repassa `/api/*` ao API Gateway e o resto cai no `index.html`

## Rodar localmente

Este repositório **é** o app — os comandos rodam na raiz dele:

```bash
npm install
cp .env.example .env    # VITE_API_BASE_URL vazia: o Vite repassa /api ao gateway (a API precisa estar rodando)
npm run dev             # http://localhost:5173
```

```bash
npm run build           # build de produção (dist/)
npm test                # unitários (Vitest); use `npm run test -- run` para single-shot
npm run test:coverage   # unitários com cobertura (V8)
npm run lint
npm run preview         # serve o build de dist/
```

> Com `VITE_API_BASE_URL` vazia no `.env` local, a Web chama `/api` no próprio endereço e o proxy do `vite.config.ts` repassa para `http://localhost:3000`. As variáveis e o que cada uma faz estão comentadas no [`.env.example`](.env.example).

> **Em produção na Vercel**, a Web repassa `/api/*` ao API Gateway (`rewrites` do `vercel.json`). Assim, o cookie de sessão é do próprio site: Safari e Samsung Internet bloqueiam cookie de outro domínio, e o login não se mantinha. As variáveis ficam assim:
>
> - `VITE_API_BASE_URL` **vazia**, para chamar `/api` no próprio site.
> - `VITE_PUBLIC_API_BASE_URL` com a URL pública do gateway. É usada nas rotas públicas que contam por IP: o formulário do cliente e o reenvio da confirmação.
> - No gateway, `COOKIE_CROSS_SITE=false` e `BETTER_AUTH_URL` com a URL da Web.
>
> Trocar o endereço do gateway é mudar o `vercel.json` e a `VITE_PUBLIC_API_BASE_URL`.

> Os casos de uso (UC-01…UC-12), antes cobertos por e2e Playwright, agora têm um **runbook de teste manual** na documentação central: `feedback-analytics/docs/guias/testes/manuais-web.md`.

## Documentação

- [Índice da documentação](docs/README.md): [Visão geral](docs/visao-geral.md) · [Arquitetura e estrutura](docs/arquitetura-estrutura.md) · [System design](docs/system-design.md) · [Fluxo de autenticação](docs/fluxo-autenticacao.md) · [Configuração de IA](docs/configuracao-ia.md) · [Interface e performance](docs/interface-performance.md)
- Testes de páginas: [`pages/tests/README.md`](pages/tests/README.md)
- CI/CD e deploy: [`.github/CI_SETUP.md`](.github/CI_SETUP.md)
- Concepção, decisões e produto: [repositório central de documentação](https://github.com/TCC-Feedback-Analytics/feedback-analytics)

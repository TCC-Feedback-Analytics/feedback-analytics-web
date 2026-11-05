# Frontend — Visão Geral

## O Que É

O frontend (`feedback-analytics-web`) é uma aplicação **React 19** com duas áreas distintas:

- **Área pública** — landing page, login (por e-mail e senha ou com o Google), cadastro, "Complete seu cadastro", recuperação de senha, reenvio da confirmação de e-mail, Política de Privacidade, Termos de Serviço e o formulário público de coleta de feedback, aberto por QR Code, link ou etiqueta NFC (sem autenticação)
- **Área protegida (`/user/*`)** — painel da empresa: onboarding e guia do sistema, Dashboard com métricas por escopo e período, comparação de itens, diagnóstico do escopo pela IA, análise dos comentários, feedbacks recebidos, configuração da coleta (avaliação da empresa, catálogo, canais de coleta, campo de comentário), configuração de IA e perfil

O frontend só conversa com o **API Gateway**, pelos caminhos `/api/*`. Em produção, a Vercel repassa `/api/*` ao gateway (`rewrites` do `vercel.json`); localmente, a base vem de `VITE_API_BASE_URL` (ver `.env.example`) e, com ela vazia, o proxy do `vite.config.ts` repassa `/api` para `http://localhost:3000`. Tipos e schemas dos contratos vêm do pacote `@feedback/lib-shared`.

## Tecnologias

### Runtime

| Tecnologia | Versão | Papel |
|---|---|---|
| **React** | 19.x | Biblioteca de UI |
| **React Router DOM** | 7.x | Roteamento SPA + data fetching (loaders/actions) |
| **React Hook Form** | 7.x | Gerenciamento de estado de formulários |
| **@hookform/resolvers** | 5.x | Integração do React Hook Form com schemas Zod |
| **Zod** | 4.x | Validação e parsing de schemas |
| **@feedback/lib-shared** | tag `v1.9.0` | Contratos compartilhados (tipos e schemas), importados pelo alias `lib` |
| **@zxcvbn-ts** (core, common, pt-br) | 4.x | Medidor de força da senha no cadastro |
| **qrcode** | 1.5.x | Gera a imagem do QR Code no navegador, sem serviço de terceiros |
| **Tailwind CSS** | 4.x | Estilização utilitária |
| **React Icons** | 5.x | Biblioteca de ícones |
| **TypeScript** | 5.8.x | Tipagem estática |

### Build

| Tecnologia | Versão | Papel |
|---|---|---|
| **Vite** | 7.x | Build tool e dev server |
| **@vitejs/plugin-react** | 4.x | Suporte a React (Fast Refresh + JSX) no Vite |
| **@tailwindcss/vite** | 4.x | Plugin do Tailwind CSS no Vite |

### Testes

| Tecnologia | Versão | Papel |
|---|---|---|
| **Vitest** | 3.x | Runner de testes unitários |
| **@vitest/coverage-v8** | 3.x | Relatório de cobertura de código via V8 |
| **@testing-library/react** | 16.x | Renderização de componentes em testes |
| **@testing-library/user-event** | 14.x | Simulação de interações do usuário |
| **@testing-library/jest-dom** | 6.x | Matchers customizados para DOM |
| **jsdom** | 27.x | Ambiente DOM simulado para os testes |

### Qualidade de Código

| Tecnologia | Versão | Papel |
|---|---|---|
| **ESLint** | 9.x | Linting de código |
| **typescript-eslint** | 8.x | Regras de lint específicas para TypeScript |

---

## Mapa de Rotas

As rotas são declaradas em `src/routes/public.tsx` e `src/routes/user.tsx`, montadas em `src/routes/source.tsx`.

### Área Pública

| Rota | Descrição |
|---|---|
| `/` | Landing page |
| `/login` | Login da empresa; mostra "Continuar com Google" quando `VITE_GOOGLE_AUTH_ENABLED=true` |
| `/register` | Cadastro (nome do negócio, e-mail, celular, senha com medidor de força e aceite dos termos); também com Google |
| `/auth/complete-signup` | "Complete seu cadastro": primeira entrada com o Google, pede nome do negócio, celular e aceite dos termos |
| `/forgot-password` | Recuperação de senha |
| `/auth/reset-password` | Redefinição de senha |
| `/resend-confirmation` | Reenvio do e-mail de confirmação do cadastro |
| `/auth/success` | Confirmação de autenticação (e-mail verificado) |
| `/auth/link-expired` | Link de ativação/confirmação expirado |
| `/privacidade` | Política de Privacidade |
| `/termos` | Termos de Serviço |
| `/feedback/qrcode` | Formulário público de coleta. O mesmo endereço serve a todos os canais; o parâmetro `canal=qr\|link\|nfc\|teste` diz por onde o cliente chegou. Feedbacks com `canal=teste` não entram nas métricas nem na análise da IA |

### Área Protegida (`/user/*`)

| Rota | Descrição |
|---|---|
| `/user/dashboard` | Visão geral: primeiros passos da conta nova, métricas de estrelas, "Por onde chegaram" (canais QR, link e NFC), movimento das avaliações, perguntas do formulário, análise dos comentários e diagnóstico do escopo |
| `/user/ratings` | Todas as métricas de estrelas: distribuição de 1 a 5, movimento no tempo, dias e horários de pico e clientes que voltam |
| `/user/questions/:questionId` | Página de uma pergunta do formulário, com subperguntas, distribuição e histórico |
| `/user/questions/removed` | Perguntas que saíram do formulário, mas ainda têm respostas no escopo |
| `/user/compare` | Comparar dois itens do catálogo do mesmo tipo, no mesmo período |
| `/user/diagnosis` | Histórico dos diagnósticos da IA já gerados para o escopo |
| `/user/feedbacks/all` | Feedbacks recebidos, com filtros, canal de chegada, marca "Teste" e detalhe em janela |
| `/user/feedbacks/:id` | Detalhe de um feedback (tela provisória, sem conteúdo além do id) |
| `/user/insights/overview` | Análise dos comentários › Visão geral: tom, assuntos que mais impactam e resumo com recomendações |
| `/user/insights/comments` | Análise dos comentários › Comentários, com filtros por tom e pela divergência entre nota e texto |
| `/user/profile` | Perfil: dados pessoais e acesso, dados da empresa, contexto da empresa para a IA e "Excluir minha conta" (ver [Fluxo de Autenticação](./fluxo-autenticacao.md)) |
| `/user/edit/feedback-general` | Avaliação da empresa: perguntas gerais, campo de comentário e canais de coleta (QR Code, link e etiqueta NFC) |
| `/user/edit/types-feedback` | Catálogo: ativar produtos, serviços e/ou departamentos |
| `/user/edit/feedback-products` | Catálogo de produtos |
| `/user/edit/feedback-services` | Catálogo de serviços |
| `/user/edit/feedback-departments` | Catálogo de departamentos |
| `/user/edit/feedback/:kind/:itemId` | Configuração por item do catálogo: dados, perguntas, campo de comentário e canais de coleta |
| `/user/edit/ia-settings` | Configuração de IA (chave OpenRouter, "Conectar com OpenRouter" e modelo) — ver [Configuração de IA](./configuracao-ia.md) |
| `/user/openrouter/callback` | Volta do "Conectar com OpenRouter": troca o código pela chave no gateway e retorna à tela de origem |
| `/user/edit/customers` | Clientes (tela "Em breve", ainda não implementada) |
| `/user/edit/collecting-data-enterprise` | Redireciona para `/user/profile#dados-da-empresa`; a action da rota segue recebendo o contexto da empresa salvo pelo onboarding |

**Rotas antigas que redirecionam** (links salvos continuam funcionando):

| Rota | Destino |
|---|---|
| `/user/insights`, `/user/insights/reports`, `/user/insights/emotional`, `/user/insights/statistics` | `/user/insights/overview` |
| `/user/feedbacks/analytics/all` | `/user/insights/comments` |
| `/user/feedbacks/analytics/positive` | `/user/insights/comments?filtro=positivos` |
| `/user/feedbacks/analytics/negative` | `/user/insights/comments?filtro=negativos` |
| `/user/insights/questions` | `/user/dashboard` (as perguntas ficam no Dashboard) |
| `/user/edit/feedback-settings` | `/user/edit/types-feedback` |
| `/user/qrcode/enterprise` | `/user/edit/feedback-general` |

> **Wayfinding e menu** — a navegação interna é padronizada por `routeMeta.ts` (mapeia `pathname` → título/descrição/breadcrumb) consumido pelo `PageHeader` (breadcrumb + título no topo de cada página). O menu (`src/lib/constants/menu.ts`) tem Visão geral, Comparar itens, Diagnósticos, Feedbacks, Análise dos comentários e **"Configuração da coleta"** (Avaliação da empresa, Catálogo e Configuração de IA). No celular, a navegação vai para a barra inferior e a gaveta de menu. O Perfil e o Guia do Sistema ficam no menu da conta, no cabeçalho.

### Controles de escopo e período

Abaixo do cabeçalho, a barra de controles (`InsightsActionBar`) aparece no Dashboard, em `/user/ratings`, nas páginas de pergunta e na Análise dos comentários. Ela escolhe o **escopo** (empresa ou um item de produto, serviço ou departamento), o **período** (todo o período, 7 ou 30 dias, 3 ou 6 meses, personalizado) com a comparação com o período anterior, e dispara "Analisar comentários com IA". O estado fica no contexto `insightsControls`, compartilhado por todas as telas da área logada. O sino do cabeçalho mostra os feedbacks do escopo aguardando análise.

### Onboarding e guia do sistema

Na primeira entrada, o layout da área logada abre o contexto da empresa para a IA (obrigatório) com a configuração de IA (opcional). Com a IA configurada, uma tela espera a geração automática das 3 perguntas do formulário; se a geração falhar, um aviso fica no topo do layout até ser resolvido (detalhes em [Configuração de IA](./configuracao-ia.md)). O guia do sistema (tour interativo) não abre sozinho: o Dashboard convida a pessoa, que pode começar ou adiar, e o guia segue disponível no menu da conta. A conta nova vê os "Primeiros passos" no topo do Dashboard: "Ativar a coleta da empresa" (QR Code, link e etiqueta NFC) e, se quiser, testar o formulário numa janela.

---

## Padrão de Data Fetching

O frontend usa o padrão **loader/action do React Router v7**, completado por hooks que buscam os dados do escopo e do período selecionados.

- **Loaders:** executados antes da renderização da rota. O loader do layout `/user` carrega usuário, empresa, dados de coleta e configuração de IA, lidos pelas páginas via `useRouteLoaderData('user')`. Os loaders de página semeiam os dados no escopo Empresa.
- **Actions:** processam mutations (submissões de formulário). Resultado via `useActionData` ou `useFetcher`.
- **Hooks de escopo (`src/lib/hooks/useScoped*`):** quando o escopo ou o período mudam, chamam os serviços de `src/services/` sem recarregar a rota.
- **Jobs da IA:** a análise dos comentários, a geração das perguntas e o diagnóstico rodam em segundo plano no backend; a Web acompanha o job por polling (`useIaOperation`, `useAnalysisJobPolling`).

---

## Autenticação

O frontend **não instancia SDK de auth**. A sessão vive em um **cookie httpOnly** definido pelo gateway (Better Auth) e enviado automaticamente (`credentials: 'include'`) em cada requisição. O loader `LoaderUserProtected` valida a sessão antes de renderizar qualquer página protegida: sem sessão, redireciona para `/login`; sem telefone (primeira entrada com o Google), para `/auth/complete-signup`.

Os fluxos passo a passo estão em [Fluxo de Autenticação e Navegação](./fluxo-autenticacao.md).

---

## Veja Também

- [Arquitetura e Componentes](./arquitetura-estrutura.md)
- [System Design](./system-design.md)
- [Interface e Performance](./interface-performance.md)
- [Fluxo de Autenticação e Navegação](./fluxo-autenticacao.md)
- [Configuração de IA](./configuracao-ia.md)
- [Funcionalidades](https://github.com/TCC-Feedback-Analytics/feedback-analytics/blob/main/docs/concepcao/requisitos-e-funcionalidades.md)
- [Padrões de Projeto](https://github.com/TCC-Feedback-Analytics/feedback-analytics/blob/main/docs/referencia/padroes-projeto.md)

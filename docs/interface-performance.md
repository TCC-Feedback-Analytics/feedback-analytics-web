# Frontend — Interface e Performance

Este documento cobre como o frontend se comporta em runtime: estratégias de carregamento, resposta a inputs, estados visuais e o formulário público de coleta. As telas e os fluxos de produto estão na [Visão Geral](./visao-geral.md).

---

## Carregamento Inteligente

### Fallback de aplicação

Enquanto o roteador hidrata pela primeira vez (resolve os loaders da primeira URL acessada), o `FallbackType01` é exibido — uma tela neutra com texto "Carregando..." que impede o usuário de ver uma tela em branco. Ele é o `hydrateFallbackElement` da rota raiz, em `src/routes/source.tsx`.

### Skeletons na navegação

Na área logada, o `layouts/user.tsx` olha o `useNavigation()`: enquanto `navigation.state === 'loading'` e o destino é outra página, ele troca o `<Outlet />` pelo skeleton do caminho de destino. Cada skeleton espelha o layout real da página com blocos animados (`SkeletonBlock`: `animate-pulse` com fundo `--seventh-color`). Caminho sem skeleton mapeado mantém a página atual até o loader terminar.

| Destino | Skeleton |
|---|---|
| `/user/dashboard` | `DashboardSkeleton` |
| `/user/profile` | `ProfileSkeleton` |
| `/user/feedbacks/all` | `FeedbacksAllSkeleton` |
| `/user/feedbacks/:id` | `FeedbackDetailsSkeleton` |
| `/user/insights/overview` | `InsightsReportSkeleton` |
| `/user/edit/customers` | `EditCustomersSkeleton` |
| `/user/edit/collecting-data-enterprise` | `EditCollectingDataSkeleton` |

> O layout ainda tem ramos para `/user/edit/profile` (`EditProfileSkeleton`) e `/user/edit/feedback-settings` (`EditFeedbackSettingsSkeleton`), mas hoje a primeira não é rota e a segunda é só um redirect para `/user/edit/types-feedback`.

### Carregamento dentro da página

Os dados que dependem do escopo e do período do header são buscados no cliente pelos hooks de `src/lib/hooks` (ver [Arquitetura e Estrutura](./arquitetura-estrutura.md)), sem trocar de rota. Cada página decide o que mostrar enquanto eles carregam:

- **Dashboard:** `DashboardScopedSkeleton` ao trocar de escopo. A primeira carga usa os dados do loader, e as atualizações em segundo plano (ex.: depois de um feedback de teste) são silenciosas, sem skeleton.
- **Visão geral dos comentários:** `InsightsReportSkeleton` só na primeira busca, enquanto ainda não há relatório nem resumo na tela.
- **Lista de feedbacks:** filtros, busca e página vão para a URL e o loader roda de novo. Nessas trocas a lista atual continua na tela; o `FeedbacksAllLoadingOverlay` (spinner sobre a lista) só aparece quando a mesma rota recarrega por outro motivo.

### Requisições em paralelo

Os loaders disparam as leituras independentes juntas, com `Promise.all`: o `LoaderUserDashboard` busca as estatísticas do escopo Geral, as da conta inteira e o status do QR Code ao mesmo tempo; o `loadUserContextData` (rota `/user`) busca usuário, empresa e configuração da IA de uma vez. As leituras opcionais usam `.catch(() => null)`, para que a falha de uma não derrube a página.

### Decodificação assíncrona de imagens

A imagem do QR Code (`components/user/pages/qrcodeEnterprise/CollectionChannelsSection.tsx`) usa `decoding="async"` nativo do browser, para não bloquear a renderização inicial.

### Code splitting

- **Medidor de força de senha:** o `zxcvbn` (`@zxcvbn-ts/core` e os dicionários) é carregado por `import()` dinâmico só quando a pessoa digita a primeira letra da senha (`loadPasswordScorer`, em `src/lib/utils/passwordStrength.ts`, usado pelo `usePasswordStrength`). A promessa fica guardada, então o pacote é baixado uma vez só. O Vite separa esse import em um chunk próprio.

> **Pendente:** nenhuma rota usa `lazy`. O `source.tsx` tem uma linha comentada (`// lazy: () => import('./root')`), e o `vite.config.ts` não define `manualChunks`: todas as páginas saem no bundle principal.

### Cache

Não há camada de cache de dados no cliente: cada loader e cada hook busca na API quando roda. O que existe:

- O catálogo de modelos da IA (`ServiceGetIaModels`) e o guia do sistema (`ServiceGetSystemGuide`) são pedidos com `cache: 'no-store'`, para nunca virem do cache HTTP do browser.
- O id do job de IA em andamento fica no `localStorage` (`useIaOperation`), para a tela retomar o acompanhamento depois de um recarregamento. Sem ele, o hook pergunta à API pelos jobs ativos (`ServiceGetActiveAnalysisJobs`).

---

## Tratamento de Inputs e Eventos

### Debounce

A busca por texto e o filtro de item em `/user/feedbacks/all` esperam **450 ms** sem digitação antes de atualizar a URL (e, com ela, disparar o loader). Os demais filtros (nota, categoria, página) aplicam na hora.

### Duplo envio

Não há throttle genérico. Os formulários desabilitam o botão de envio enquanto a submissão está em andamento (`disabled={isSubmitting}` em login, cadastro, senha, reenvio da confirmação e formulário público). O botão de sair ignora novos cliques enquanto o `fetcher` do logout não volta a `idle`.

### Cancelamento

O `useIaModels` e o `onboardingContext` passam um `AbortController` para o service e descartam a resposta se o componente desmontar antes. Parte dos hooks de escopo (`useScopedStats`, `useScopedTimeline`, `useScopedHeatmap`, `useScopedCustomers`, `usePreviousPeriod`, `useFormQuestionsConfig`) usa uma flag de cancelamento no `useEffect` para descartar a resposta que chega depois de trocar o escopo ou de desmontar. Os demais (`useScopedInsightsReport`, `useScopedFeedbackAnalysis`, `useScopedFeedbackQuestions`, `useScopedPendingCount`) ainda não têm essa proteção.

### Acompanhamento dos jobs de IA

Análise de comentários, geração de insights, geração das perguntas da empresa e diagnóstico por escopo rodam em segundo plano no servidor. O `useAnalysisJobPolling` consulta o job a cada **2,5 s** até `completed` ou `failed`. Uma falha de rede não cancela o job: o intervalo dobra a cada erro seguido (até 30 s) e o hook expõe `connectionError`, que o `layouts/user.tsx` repassa como aviso (`pollingWarning`) nas operações de análise e insights; 401, 403 ou 404 encerram o acompanhamento.

---

## Estados da Tela

Cada tela com dados remotos trata quatro estados visuais. Nem toda tela tem um componente próprio para cada um: algumas resolvem o estado inline.

### Loading

Ver **Carregamento Inteligente** acima: skeletons na navegação, skeletons e overlays dentro da página e o `FallbackType01` na primeira carga.

### Sucesso — Dados na tela

Estado padrão: o componente da página recebe os dados do loader (ou do hook) e os renderiza normalmente.

### Vazio — Empty State

Exibido quando a requisição foi bem-sucedida mas não há dados, com mensagem contextual.

Exemplo de comportamento inteligente em `FeedbacksAllEmptyState`: a mensagem muda dependendo se há filtros ativos ou não — "Tente ajustar os filtros de busca" vs. "Ainda não há feedbacks registrados".

### Erro — Error State

Exibido quando o loader, o hook ou a action retorna uma falha. Erros que escapam da página caem no `errorElement` da rota (`components/globals/handling/errorPage.tsx` na raiz e na área pública, `components/user/shared/handling/errorPage.tsx` em `/user`).

### Resumo por feature

| Feature | Loading | Vazio | Erro |
|---|---|---|---|
| Feedbacks (lista) | `FeedbacksAllSkeleton` + `FeedbacksAllLoadingOverlay` | `FeedbacksAllEmptyState` | `FeedbacksAllErrorState` (borda e fundo `rose-500`) |
| Dashboard | `DashboardSkeleton` + `DashboardScopedSkeleton` | `DashboardWelcome` + `WelcomePreview` quando a conta ainda não tem feedback | Faixa inline com a mensagem do loader (`dashboardError`) |
| Visão geral dos comentários | `InsightsReportSkeleton` | — | `InsightsReportErrorState` (modal que pode ser fechado) |
| Comentários analisados | Texto inline "Carregando os comentários…" | Mensagem inline (sem comentários analisados no escopo, ou nenhum no filtro, com botão "Ver todos os comentários") | Caixa inline com borda `--negative` |

---

## Formulário público de coleta (`/feedback/qrcode`)

A tela que o cliente final vê ao escanear o QR Code. O loader (`LoaderPublicQrCodeEnterprise`) entrega empresa, item e perguntas antes da renderização, então não há estado de loading próprio além do `FallbackType01` da primeira carga. Os estados visuais são:

| Estado | Componente |
|---|---|
| Formulário disponível | `PublicQrFeedbackTemplateRenderer` |
| Feedback já enviado anteriormente | `stateSentPreviousFeedback` |
| Enviado com sucesso | `stateSubmitted` |
| Erro (empresa não encontrada etc.) | `stateError` |

Os três estados finais usam o mesmo `FeedbackStatusLayout`. Quando o formulário está embutido no Dashboard (feedback de teste), a página avisa a tela de cima pelo `notifyEmbeddedFormResult` ao enviar ou ao detectar envio anterior.

O formulário público é o ponto de entrada de dados do produto — cada atrito removido aqui impacta diretamente o volume de feedbacks coletados.

---

## Veja Também

- [Visão Geral](./visao-geral.md)
- [Arquitetura e Estrutura](./arquitetura-estrutura.md)
- [System Design](./system-design.md)

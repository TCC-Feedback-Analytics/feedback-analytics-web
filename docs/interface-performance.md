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

> As rotas que só redirecionam (`/user/edit/collecting-data-enterprise`, `/user/edit/feedback-settings`) não têm skeleton próprio.

### Carregamento dentro da página

Os dados que dependem do escopo e do período da barra abaixo do cabeçalho são buscados no cliente pelos hooks de `src/lib/hooks` (ver [Arquitetura e Estrutura](./arquitetura-estrutura.md)), sem trocar de rota. Cada página decide o que mostrar enquanto eles carregam:

- **Dashboard:** `DashboardScopedSkeleton` ao trocar de escopo. A primeira carga usa os dados do loader, e as atualizações em segundo plano (ex.: depois de um feedback de teste) são silenciosas, sem skeleton.
- **Resumo da análise dos comentários:** `InsightsReportSkeleton` só na primeira busca, enquanto ainda não há relatório nem resumo na tela.
- **Nota e Clientes e canais:** a última resposta fica na tela até chegar a do novo recorte. Na primeira carga, Nota mostra "Carregando avaliações…".
- **Lista de feedbacks:** filtros, busca e página vão para a URL e o loader roda de novo. Nessas trocas a lista atual continua na tela; o `FeedbacksAllLoadingOverlay` (spinner sobre a lista) só aparece quando a mesma rota recarrega por outro motivo.

### Requisições em paralelo

Os loaders disparam as leituras independentes juntas, com `Promise.all`: o `LoaderUserDashboard` busca as estatísticas do escopo Geral, as da conta inteira e o status do QR Code ao mesmo tempo; o `loadUserContextData` (rota `/user`) busca usuário, empresa e configuração da IA de uma vez. As leituras opcionais usam `.catch(() => null)`, para que a falha de uma não derrube a página.

### Decodificação assíncrona de imagens

A imagem do QR Code (`components/user/pages/qrcodeEnterprise/CollectionChannelsSection.tsx`) usa `decoding="async"` nativo do browser, para não bloquear a renderização inicial.

### Code splitting

- **Rotas sob demanda:** as páginas públicas (inicial, login, cadastro, formulário do QR Code, produto e páginas legais) ficam no bundle principal, porque são onde as pessoas chegam direto e carregar sob demanda atrasaria a primeira pintura delas. A área logada (o `layouts/user` e cada página de `/user`) usa a propriedade `lazy` do React Router, pelo helper `lazyPage` de `src/routes/lazyPage.ts`. O loader e a action da rota vêm no mesmo `lazy`. O Vite gera um chunk por tela. Na primeira carga de uma URL, o `FallbackType01` cobre o tempo de baixar o chunk. Nas navegações seguintes, o React Router só troca de tela depois que ele chega, e os skeletons da área logada continuam valendo.
- **Pré-carregamento por rota:** o plugin `config/routePreload.ts` gera um script pequeno (`assets/route-preload-<hash>.js`, carregado no `<head>`) que, ao abrir `/user` ou `/user/dashboard` direto, pede ao navegador os chunks dessa rota junto com o bundle principal (`<link rel="modulepreload">`), em vez de esperar o bundle principal rodar para descobri-los. O script fica num arquivo próprio, e não embutido no HTML, porque a Content-Security-Policy do `vercel.json` não libera scripts embutidos.
- **Medidor de força de senha:** o `zxcvbn` (`@zxcvbn-ts/core` e os dicionários) é carregado por `import()` dinâmico só quando a pessoa digita a primeira letra da senha (`loadPasswordScorer`, em `src/lib/utils/passwordStrength.ts`, usado pelo `usePasswordStrength`). A promessa fica guardada, então o pacote é baixado uma vez só. O Vite separa esse import em um chunk próprio.

Com a divisão por rota, o JavaScript principal caiu de 362 KB para 237 KB (gzip), medido no build de produção.

### Fontes

Das fontes estáticas (Poppins, Geist Mono e Space Grotesk), o `styles/fonts.css` importa só os alfabetos latin e latin-ext, que cobrem o português. O `vite.config.ts` não deixa arquivo de fonte virar base64 dentro do CSS (`assetsInlineLimit`). Antes, os arquivos pequenos de outros alfabetos iam embutidos no CSS, que bloqueia a primeira pintura. O CSS principal caiu de 80 KB para 38 KB (gzip).

### Cabeçalhos de segurança

O `vercel.json` manda em todas as respostas: `Content-Security-Policy` (scripts, fontes e estilos só do próprio site, chamadas só para o próprio site e para o Gateway, imagens do site, `data:` e `blob:`, que o QR Code usa, e iframe só do próprio site, para o "Testar o formulário" do painel), `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` e `Permissions-Policy` sem câmera, microfone, localização, pagamento e USB, além de `Cross-Origin-Opener-Policy: same-origin` (uma janela de outro site não consegue controlar a do Feedback Analytics) e `Cross-Origin-Resource-Policy: same-origin` (outros sites não carregam os arquivos do site). Os dois não atrapalham o "Continuar com Google", que troca de página em vez de abrir janela, nem os e-mails, que não usam imagens do site. O HSTS já vem da Vercel. Os estilos aceitam `'unsafe-inline'` porque componentes e animações aplicam estilo direto nos elementos.

### Imagens da página inicial

As imagens de `public/field-notes/` estão em WebP: a foto de fundo do topo (`hero.webp`, 28 KB, antes 518 KB em PNG), os logos (`logo-dark.webp` e `logo-light.webp`, reduzidos a 640 px de largura, que é o dobro do tamanho exibido) e o símbolo (`symbol.webp`). As tags `<img>` declaram `width` e `height`, para o navegador reservar o espaço antes de a imagem chegar. O logo do topo, que é o maior elemento visível ao abrir a página no celular, tem `fetchPriority="high"`, e o logo do rodapé usa `loading="lazy"`.

### SEO e prévia nos links

O `index.html` traz título e descrição da página, as tags Open Graph e Twitter Card (com a imagem `field-notes/social-preview.jpg`, 1200×800) para a prévia quando o link é compartilhado, e o ícone `field-notes/symbol.webp`. O `public/robots.txt` libera o site para os buscadores.

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

O `useIaModels` e o `onboardingContext` passam um `AbortController` para o service e descartam a resposta se o componente desmontar antes. Parte dos hooks de escopo (`useScopedStats`, `useScopedTimeline`, `useScopedHeatmap`, `useScopedCustomers`, `useScopedInsightsReport`, `useScopedPendingCount`, `useScopeDiagnosis`, `usePreviousPeriod`, `useFormQuestionsConfig`) usa uma flag de cancelamento no `useEffect` para descartar a resposta que chega depois de trocar o escopo ou de desmontar. O `useScopedFeedbackAnalysis` e o `useScopedFeedbackQuestions` usam o `useLatestRequest`: cada busca ganha um número, e só a mais recente grava no estado.

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
| Resumo da análise dos comentários | `InsightsReportSkeleton` | — | `InsightsReportErrorState` (modal que pode ser fechado) |
| Comentários analisados | Texto inline "Carregando os comentários…" | Mensagem inline (sem comentários analisados no escopo, ou nenhum no filtro, com botão "Ver todos os comentários") | Caixa inline com borda `--negative` |

---

## Formulário público de coleta (`/feedback/qrcode`)

A tela que o cliente final vê ao escanear o QR Code. O loader (`LoaderPublicQrCodeEnterprise`) entrega empresa, item e perguntas antes da renderização, então não há estado de loading próprio além do `FallbackType01` da primeira carga. Os estados visuais são:

| Estado | Componente |
|---|---|
| Formulário disponível | `PublicQrFeedbackTemplateRenderer` |
| Feedback já enviado anteriormente | `stateSentPreviousFeedback` |
| Enviado com sucesso | `stateSubmitted` |
| Erro ao abrir (formulário desativado ou endereço inválido). A frase é a mesma para QR Code, link e NFC | `stateError` |

Os três estados finais usam o mesmo `FeedbackStatusLayout`. Quando o formulário está embutido no Dashboard (feedback de teste), a página avisa a tela de cima pelo `notifyEmbeddedFormResult` ao enviar ou ao detectar envio anterior.

O formulário público é o ponto de entrada de dados do produto — cada atrito removido aqui impacta diretamente o volume de feedbacks coletados.

---

## Veja Também

- [Visão Geral](./visao-geral.md)
- [Arquitetura e Estrutura](./arquitetura-estrutura.md)
- [System Design](./system-design.md)

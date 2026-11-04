# Frontend — System Design

Este documento registra as decisões estruturais do frontend: como os componentes são organizados, qual kit visual guia a interface, onde as falhas são contidas e como a base foi projetada para ser reutilizável.

---

## Componentes Globais vs. Locais

A hierarquia de componentes segue uma regra de escopo: quanto mais próximo de uma tela específica, menos reaproveitável deve ser.

| Nível | Pasta | O que vai aqui |
|---|---|---|
| **Global (app inteiro)** | `components/globals/` | Componentes que afetam qualquer rota (ex: `errorPage`) |
| **Fallbacks de carregamento** | `components/fallbacks/` | Telas de espera do nível de aplicação (`FallbackType01`) |
| **Primitivos de UI** | `components/ui/` | Peças genéricas usadas nas duas áreas: `Dialog`, `Select`, `Switch`, `Checkbox`, `Input`, `Textarea`, `Label`, `Spinner`, `Toast` e `Sidebar` |
| **SVG / Ícones inline** | `components/svg/` | Assets SVG convertidos em componentes React |
| **Compartilhado — área pública** | `components/public/shared/` e `components/public/layout/` | Peças comuns entre páginas públicas (ex: `AuthShell`, a moldura das telas de acesso) e o cabeçalho público |
| **Compartilhado — área logada** | `components/user/shared/` | Cards, Avatar, Badge, Skeletons, `PageHeader`, `SectionTabs`, `ScopeTag` e ajuda contextual |
| **Moldura da área logada** | `components/user/layout/` e `components/user/onboarding/` | Cabeçalho, menu lateral, navegação do celular e barra de escopo e período; onboarding e guia do sistema |
| **Específico de tela** | `components/public/{forms,legal,qrcode}/` e `components/user/pages/{feature}/` | Componentes que pertencem a uma única rota ou fluxo |

A árvore completa de pastas está em [Arquitetura e Estrutura](./arquitetura-estrutura.md).

**Regra prática:** se um componente for usado em mais de uma tela, ele sobe um nível para `shared/`. Se for usado em toda a aplicação, vai para `globals/`. Nunca copiar um componente entre pastas de feature — extrair para `shared/`.

---

## Design System / UI Kit

O frontend não usa uma biblioteca de componentes em runtime (sem Radix UI, sem Material). Os primitivos de `components/ui/` seguem o desenho do shadcn/ui, mas são escritos no próprio repositório. Todo o sistema visual é customizado sobre **Tailwind CSS v4**.

### Tokens de design

Os valores de cor, fundo e texto são definidos como variáveis CSS customizadas em `styles/index.css` e consumidos via Tailwind:

```
--bg-primary         → fundo da página
--bg-secondary       → fundo de cards e painéis
--bg-tertiary        → fundo de elementos aninhados
--text-primary       → texto principal
--text-secondary     → texto secundário
--text-tertiary      → texto de apoio
--primary-color      → cor de destaque (botões, links, itens ativos)
--positive / --neutral / --negative → avaliações positivas, neutras e críticas
--quaternary-color   → bordas e separadores
--sixth-color        → gradientes de fundo
--seventh-color      → cor base dos skeletons (animate-pulse)
```

Cada área reatribui as variáveis numa classe própria: `.public-theme` (área pública), `.private-user-theme` (área logada) e `.feedback-form-experience` (formulário do cliente). O tema escuro é o padrão; o claro entra pela preferência do sistema (`@media (prefers-color-scheme: light)`), que reatribui as mesmas variáveis — os componentes não mudam. Menus e janelas abertos com `createPortal` ficam fora dessas classes; `src/lib/utils/portalTheme.ts` devolve a classe do tema para o portal herdar as cores.

### Ícones

**React Icons** (v5) é a biblioteca de ícones. Importar sempre de um sub-pacote específico (ex: `react-icons/fa6`) para evitar importar a coleção inteira.

### Utilitário `glass-card`

Existe uma classe utilitária customizada `glass-card` (em `styles/user/profile.css`) aplicada em cards e painéis principais (efeito glassmorphism). Centraliza o estilo visual dos containers sem repetir propriedades CSS em cada componente.

---

## Fronteiras de Erro (Error Boundaries)

O frontend usa o mecanismo nativo de **`errorElement` do React Router v7** para conter falhas de renderização e de loaders.

### Como está implementado

No roteador raiz (`src/routes/source.tsx`), o `errorElement` captura qualquer erro não tratado que ocorra dentro da árvore de rotas:

```tsx
{
  path: '/',
  errorElement: <ErrorPage />,        // captura erros da árvore inteira
  hydrateFallbackElement: <FallbackType01 />,
  children: createRoutesFromElements(<>{RoutePublic()}{RouteUser()}</>)
}
```

O `ErrorPage` global está em `components/globals/handling/errorPage.tsx` e também é o `errorElement` da rota da área pública (`src/routes/public.tsx`).  
A rota `/user` (`src/routes/user.tsx`) usa a versão da área logada, em `components/user/shared/handling/errorPage.tsx`.

O `ErrorPage` global mostra "Página não encontrada" no 404 e "Algo deu errado" nos outros erros, com "Tentar de novo" (recarrega a página) e "Voltar ao início", e registra o erro no console. A versão da área logada usa o mesmo componente, com "Voltar ao início" levando a `/user/dashboard`.

---

## Veja Também

- [Visão Geral](./visao-geral.md)
- [Arquitetura e Estrutura](./arquitetura-estrutura.md)
- [Interface e Performance](./interface-performance.md)
- [Fluxo de Autenticação e Navegação](./fluxo-autenticacao.md)

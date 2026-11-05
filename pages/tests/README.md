# Testes de Páginas

Este diretório contém os testes para as páginas do projeto usando Vitest e React Testing Library. Os demais testes ficam junto do código que testam (ver [Onde ficam os outros testes](#onde-ficam-os-outros-testes)).

## Estrutura dos Testes

### Páginas Testadas

- **home.test.tsx** - Página Home (pública)
- **login.test.tsx** - Página Login (pública)
- **register.test.tsx** - Página Register (pública)
- **dashboard.test.tsx** - Dashboard, incluindo o convite do guia
- **profile.test.tsx** - Perfil
- **ratings.test.tsx** - Todas as métricas de estrelas, com a comparação com o período anterior
- **compare.test.tsx** - Comparar itens do catálogo
- **diagnosis.test.tsx** - Histórico de diagnósticos
- **comments.test.tsx** - Comentários analisados (filtros pela URL)
- **question.test.tsx** - Página de uma pergunta do formulário
- **openrouterCallback.test.tsx** - Volta do OpenRouter e botão "Conectar com OpenRouter"

Os blocos `describe` usam o prefixo `[Unidade]` ou `[Integração]` (este último só aparece nos testes de actions e helpers de carga em `src/routes/`). Nem todos seguem: `diagnosis.test.tsx` e `openrouterCallback.test.tsx` não têm prefixo.

### Onde ficam os outros testes

| Local | O que cobre |
|---|---|
| `components/**/*.test.tsx` | Componentes, ao lado do arquivo testado |
| `layouts/tests/` | `layouts/public.tsx` e `layouts/user.tsx` |
| `src/lib/utils/*.test.ts` e `src/lib/utils/tests/` | Utilitários puros |
| `src/lib/hooks/*.test.tsx`, `src/lib/constants/menu.test.ts` | Hooks e definição do menu |
| `src/routes/actions/`, `src/routes/loaders/`, `src/routes/load/` | Actions, loaders e helpers de carga |
| `src/services/*.test.ts` | Services |

Não há teste e2e neste repositório: a suíte Playwright foi removida em agosto de 2026, e o roteiro e2e virou teste manual (runbook em `feedback-analytics/docs/guias/testes/manuais-web.md`, no repositório central).

### Padrões de Teste

#### 1. O mock global do `react-router-dom`

O `tests/setup.ts` troca o `react-router-dom` por um módulo que só tem `useRouteLoaderData: vi.fn()`. Toda página que usa `MemoryRouter`, `Link`, `useNavigation` ou outro export do roteador precisa voltar ao módulo real no próprio arquivo:

```typescript
// O setup global troca o react-router-dom por um mock mínimo; aqui usamos o real.
vi.mock('react-router-dom', async () =>
  vi.importActual<typeof import('react-router-dom')>('react-router-dom'),
);

render(<Login />, { wrapper: MemoryRouter });
```

#### 2. Páginas com Dados do Router (Profile, Dashboard)

Módulo real com os hooks de dados substituídos por mocks:

```typescript
vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigation: vi.fn(),
    useRouteLoaderData: vi.fn(),
  };
});

beforeEach(() => {
  vi.mocked(useRouteLoaderData).mockReturnValue(mockData);
});
```

#### 3. Páginas com Componentes (Login, Register)

```typescript
// Mock de componentes filhos para focar no teste da página
vi.mock('components/public/forms/formLogin', () => ({
  default: () => <div data-testid="form-login">Login Form</div>,
}));
```

#### 4. Páginas que buscam dados no cliente (Ratings, Compare, Dashboard)

Os services, o contexto de escopo e os hooks de dados são mockados; os valores ficam em `vi.hoisted` para estarem prontos quando o `vi.mock` roda:

```typescript
const mocks = vi.hoisted(() => ({
  getFeedbackStats: vi.fn(),
  controls: { scope: 'PRODUCT', catalogItemId: 'p1', period: { preset: 'ALL' } },
}));

vi.mock('src/services/serviceFeedbacks', () => ({ ServiceGetFeedbackStats: mocks.getFeedbackStats }));
vi.mock('src/lib/context/insightsControls', () => ({ useInsightsControls: () => mocks.controls }));
```

## Executando os Testes

> `npm test` roda o Vitest em **modo watch** por padrão. Para execução única (single-shot, como no CI), use `npm run test -- run`.

### Todos os testes de páginas (single-shot)

```bash
npm run test -- run pages/tests
```

### Teste específico

```bash
npm run test -- run pages/tests/login.test.tsx
```

### Modo watch (desenvolvimento)

```bash
npm test pages/tests
```

### Cobertura

```bash
npm run test:coverage
```

Roda tudo uma vez com o provider `v8`. Mede `src/lib/utils`, `src/routes`, `pages` e `layouts` (sem os próprios testes), imprime o resumo no terminal e gera o relatório HTML em `coverage/` (fora do git).

## Configuração

### Vitest

A configuração fica no bloco `test` do `vite.config.ts`: `globals: true`, ambiente `jsdom` e `setupFiles` apontando para `tests/setup.ts`. Os aliases de import (`components/`, `src/`, `lib/`…) são os mesmos do app.

O typecheck do CI usa o `tsconfig.ci.json`, que exclui os testes: erro de tipo em teste não quebra o CI, só erro de execução.

### Setup Global

O arquivo `tests/setup.ts` (na raiz do repo) contém:

- Importação do `@testing-library/jest-dom`
- `URLSearchParams` e `AbortController` do Node no lugar dos do jsdom, para o `Request` que o React Router cria nas submissions não rejeitar instâncias de outro realm
- Mock global do `react-router-dom` (só `useRouteLoaderData`; ver padrão 1)
- Mock do `window.matchMedia`
- `localStorage` em memória

### Dependências de Teste

- `@testing-library/react` - Renderização e queries
- `@testing-library/jest-dom` - Matchers customizados
- `@testing-library/user-event` - Simulação de eventos
- `vitest` - Test runner
- `@vitest/coverage-v8` - Cobertura
- `jsdom` - Ambiente DOM simulado

## Boas Práticas

### 1. Isolamento de Componentes

- Use mocks para componentes filhos complexos
- Foque no comportamento da página, não dos componentes internos

### 2. Data-testid

- Use `data-testid` para elementos que precisam ser testados
- Evite depender de classes CSS ou texto que pode mudar

### 3. Testes de Comportamento

- Teste o que o usuário vê e faz
- Não teste detalhes de implementação

### 4. Mocks Apropriados

- Mock apenas o necessário
- Use `vi.clearAllMocks()` no `beforeEach` (ou `afterEach`) quando necessário
- Limpe `localStorage` e `sessionStorage` entre os testes quando a página guarda estado neles

## Exemplos de Testes

### Renderização Básica

```typescript
it('deve renderizar o conteúdo da página home', () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
  expect(screen.getByText('Começar agora')).toBeInTheDocument();
});
```

### Interação com Dados

```typescript
it('deve renderizar os componentes principais com dados válidos', () => {
  vi.mocked(useRouteLoaderData).mockReturnValue(mockData);
  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>,
  );
  expect(screen.getByTestId('profile-info')).toBeInTheDocument();
});
```

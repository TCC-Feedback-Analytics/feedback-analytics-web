# Frontend — Fluxo de Autenticação e Navegação

Este documento descreve como o frontend decide o que mostrar para cada usuário: quais rotas são públicas, como a sessão é verificada, o que acontece quando ela expira e como cada fluxo de auth funciona passo a passo.

> O mapa completo de URLs está em [Visão Geral → Mapa de Rotas](./visao-geral.md). Este documento foca no comportamento, não na lista.

---

## Classificação das Rotas

| Tipo | Rotas | Acesso |
|---|---|---|
| **Pública** | `/`, `/login`, `/register`, `/forgot-password`, `/resend-confirmation`, `/auth/reset-password`, `/auth/success`, `/auth/link-expired`, `/feedback/qrcode`, `/privacidade`, `/termos` | Qualquer visitante, sem verificação |
| **Pública com sessão** | `/auth/complete-signup` | Fica fora de `/user`, mas o `LoaderCompleteSignup` exige sessão (ver [Login com Google](#login-com-google)) |
| **Protegida** | Tudo em `/user/*`, inclusive `/user/openrouter/callback` | Exige sessão válida e telefone cadastrado — verificados antes de renderizar |

---

## Guarda de Rotas — `LoaderUserProtected`

Todas as rotas `/user/*` são filhas de um único layout (rota `id="user"`) que declara `LoaderUserProtected` como loader. Isso significa que **antes de qualquer tela protegida ser renderizada**, o loader executa:

```
Usuário navega para /user/*
        ↓
LoaderUserProtected executa
        ↓
  Chama loadUserContextData(), em paralelo:
  ServiceGetUser()     → GET /api/protected/user/auth_user
  ServiceGetEnterprise() → GET /api/protected/user/enterprise   (falha vira null)
  ServiceGetIaConfig()   → GET /api/protected/user/ia-config    (falha vira null)
  e, se veio empresa, GET /api/protected/user/collecting_data   (falha vira null)
        ↓
    ┌───┴──────────────┐
  auth_user ok      auth_user falhou (401, rede, etc.)
    ↓                    ↓
  user.phone?       throw redirect('/login')
    ┌───┴───┐
   sim     não (entrou com Google e não completou o cadastro)
    ↓        ↓
Renderiza  throw redirect('/auth/complete-signup')
  a tela
```

Só a falha de `auth_user` manda para o login; as outras leituras falham em silêncio e chegam como `null` (a empresa vira um objeto parcial).

### O que `loadUserContextData` retorna

Se a sessão for válida, o loader devolve para a tela:

```ts
{
  user,        // dados do usuário autenticado (id, email, phone, user_metadata)
  enterprise,  // dados da empresa (ou objeto parcial se a leitura falhou)
  collecting,  // configurações de coleta de dados (pode ser null)
  iaConfig,    // estado da configuração de IA (pode ser null)
}
```

Esses dados ficam disponíveis via `useRouteLoaderData('user')` em qualquer componente dentro da área protegida — sem necessidade de chamar a API novamente.

---

## Gerenciamento de Sessão

### Como a sessão é armazenada

A sessão trafega via **cookie httpOnly**, definido e gerenciado **pelo backend** (API Gateway, que usa **Better Auth** por baixo). O frontend **não instancia SDK de auth nem manipula tokens**: apenas envia o cookie automaticamente em cada requisição, porque `requestApi` (`src/lib/utils/http.ts`), base de todos os helpers, usa `credentials: 'include'`. A exceção é `requestPublicApi`, que usa `credentials: 'omit'` (ver [Resolução da URL da API](#resolução-da-url-da-api)). Não há sessão em `localStorage` no frontend.

Em produção a Web chama `/api/*` no próprio domínio e a Vercel repassa ao gateway (`vercel.json`). Por isso o cookie de sessão é do próprio site, e não de outro domínio: Safari e Samsung Internet bloqueiam cookie de outro site, e o login não se mantinha.

> **Nota:** a autenticação do backend migrou do **Supabase Auth** para o **Better Auth**. Os fluxos de login, logout, cadastro, reenvio e recuperação continuam em `/api/public/auth/...`. Login com Google, lista de contas e exclusão de conta chamam direto as rotas nativas do Better Auth em `/api/auth/...`. O contrato de cada rota está no `docs/endpoints.md` do repositório `feedback-analytics-api-gateway`.

### Validade e renovação

A validade e a renovação da sessão são **responsabilidade do backend** (o cookie httpOnly). O frontend não renova token: se o cookie expirar, a próxima chamada protegida recebe `401` e o app redireciona para o login (ver abaixo).

### O que acontece quando a sessão expira

Cenário: o usuário fica inativo por muito tempo e o token expira de vez.

1. Na próxima navegação para qualquer rota `/user/*`, o `LoaderUserProtected` executa
2. `ServiceGetUser()` faz `GET /api/protected/user/auth_user`
3. O backend retorna `401` pois o cookie é inválido/expirado
4. `getJson` lança um `Error` anotado com `status: 401` (extraído da resposta HTTP)
5. O `try/catch` do `LoaderUserProtected` captura o erro
6. `throw redirect('/login')` — o usuário é redirecionado para o login

Não há tela de "sessão expirada" — o redirecionamento é imediato e silencioso.

---

## Fluxo de Login

```
/login → usuário preenche email + senha (+ opção "lembrar")
        ↓
ActionLogin extrai os campos do FormData
        ↓
ServiceLogin → POST /api/public/auth/login  (credentials: 'include')
        ↓
    ┌───┴───┐
  ok: true   ok: false
    ↓              ↓
redirect       retorna payload de erro para a tela
/user/dashboard?login=success
```

O botão fica em "Entrando..." até o fim da navegação, incluindo os loaders do Dashboard. No Dashboard, `?login=success` mostra o toast "Login realizado com sucesso." e sai da URL.

### Tratamento de erros no login

Os erros aparecem em toast (título e descrição), conforme o `error` devolvido pelo gateway:

| Cenário | Mensagem exibida |
|---|---|
| Credenciais inválidas (`invalid_credentials`) | "E-mail ou senha incorretos." O dialog de ajuda é aberto automaticamente após a tentativa rejeitada. |
| Conta não confirmada (e-mail pendente) | **Mesma** mensagem e mesmas opções genéricas de ajuda — por segurança (RNE-014, proteção contra enumeração de usuários) o gateway responde `invalid_credentials` e a UI não revela que a conta existe ou está pendente. |
| Dados inválidos (`invalid_payload`) | "E-mail inválido." ou "Senha inválida.", pelo campo apontado em `issues` |
| Rate limit (429) | "Muitas tentativas de login." — "Aguarde alguns instantes antes de tentar novamente." |
| Servidor indisponível (5xx) | "Serviço de login temporariamente indisponível." |
| Sem conexão | "Falha de conexão." — "Não foi possível conectar ao servidor de login. Verifique sua internet e tente novamente." |

> A opção fixa **"Problemas para entrar?"** abre um dialog com **"Redefinir senha"** (`/forgot-password`) e **"Reenviar e-mail de confirmação"** (`/resend-confirmation`). Após uma tentativa rejeitada com `invalid_credentials`, o dialog abre automaticamente e destaca a orientação de confirmação. Nenhuma opção inclui o e-mail na URL, e a tela de reenvio mantém uma resposta genérica, sem confirmar se a conta existe ou se está pendente.

---

## Login com Google

O botão **"Continuar com Google"** (`GoogleSignInButton`) aparece acima do formulário de login e, como **"Criar conta com Google"**, no cadastro. Só é renderizado com `VITE_GOOGLE_AUTH_ENABLED=true`; as credenciais do Google ficam no gateway.

```
Usuário clica em "Continuar com Google"
        ↓
googleSignInUrl → POST /api/auth/sign-in/social  (rota nativa do Better Auth)
  { provider: 'google',
    callbackURL:        <origem>/user/dashboard,
    newUserCallbackURL: <origem>/auth/complete-signup,
    errorCallbackURL:   <origem>/login?error=google }
        ↓
Gateway devolve a URL do Google (precisa começar com https://)
        ↓
window.location.assign(url) → Google → volta pelo gateway com o cookie de sessão
        ↓
    ┌───────────┼──────────────┐
 conta antiga  conta nova     erro
    ↓           ↓               ↓
/user/dashboard /auth/complete-signup  /login?error=google
```

- Se o gateway não devolver a URL, ou na volta com `?error=google`, o botão mostra "Não deu para entrar com o Google. Tente de novo ou use e-mail e senha."
- Não há e-mail de confirmação: o Google já entrega o e-mail verificado.

### Completar o cadastro (`/auth/complete-signup`)

Quem entra pelo Google pela primeira vez ainda não tem telefone nem aceite dos termos.

1. `LoaderCompleteSignup` chama `GET /api/protected/user/auth_user`: sem sessão, vai para `/login`; com telefone, o cadastro já está completo e vai para `/user/dashboard`. Senão, devolve o e-mail e o nome vindo do Google.
2. O formulário pede o nome do negócio (preenchido com o nome do Google), o telefone e o aceite dos termos.
3. `ServiceCompleteSignup` → `POST /api/protected/user/complete-signup`. Com sucesso, vai para `/user/dashboard`. Em `409 phone_taken`, o erro aparece no campo de telefone; qualquer outra falha mostra "Não deu para salvar agora. Tente de novo em instantes."

O `LoaderUserProtected` reforça a regra: qualquer acesso a `/user/*` sem telefone volta para esta tela.

---

## Fluxo de Logout

```
Usuário clica em "Sair" (menu do layout /user)
        ↓
fetcher envia { intent: INTENT_LOGOUT } para a action da rota /user
        ↓
ActionLogout valida o intent (INTENT_LOGOUT)
        ↓
ServiceLogout → POST /api/public/auth/logout  (invalida o cookie no servidor)
        ↓
redirect('/login')
```

Falhas na chamada de logout são ignoradas (`ServiceLogout().catch(() => {})` em `ActionLogout`) para não bloquear a saída — o redirecionamento para `/login` acontece de qualquer forma.

---

## Fluxo de Recuperação de Senha

### Etapa 1 — Solicitar redefinição (`/forgot-password`)

```
Usuário informa o e-mail
        ↓
ActionForgotPassword → ServiceForgotPassword
        ↓
POST /api/public/auth/forgot-password
        ↓
Resposta sempre genérica (não revela se o e-mail existe), em toast "E-mail enviado!":
"Se este e-mail estiver cadastrado, você receberá as instruções em breve."
```

Falhas (rate limit, 5xx, rede, e-mail malformado) aparecem em toast "Não foi possível enviar".

### Etapa 2 — Redefinir senha (`/auth/reset-password`)

```
Usuário clica no link recebido por e-mail
        ↓
GET /api/public/auth/callback do gateway grava o token no cookie httpOnly ba_reset
(vale 1 h, só é enviado para PATCH /user/password) e vai direto para /auth/reset-password
        ↓
Usuário define nova senha
        ↓
ActionResetPassword → ServiceResetPassword
        ↓
PATCH /api/protected/user/password  (usa o cookie ba_reset, não a sessão)
        ↓
    ┌───┴───┐
  ok: true   Erro (ex.: 401 reset_password_invalid_token)
    ↓              ↓
redirect       toast "Erro ao redefinir senha" com a mensagem do gateway
/login?reset=success   ("O link de redefinição expirou ou é inválido. Solicite um novo.")
```

> Ao chegar com `?reset=success`, a tela de login mostra "Senha alterada. Entre com a nova senha."

---

## Fluxo de Cadastro

```
/register → usuário preenche nome do negócio, e-mail, telefone, senha, confirmação e termos
        ↓
ActionRegister → POST /api/public/auth/register
        ↓
    ┌───┴───┐
  ok: true   erro → toast com a mensagem (ou a do status: 429, 5xx, rede)
    ↓
Tela "Confirme seu e-mail" (RegisterEmailPendingNotice)
        ↓
Gateway (Better Auth) envia o e-mail de confirmação
        ↓
Usuário clica no link → /api/auth/verify-email (Better Auth) → /auth/success
        ↓
    ┌───┴───┐
  válido    ?error=<código> (TOKEN_EXPIRED, INVALID_TOKEN...)
    ↓              ↓
"Conta verificada"  /auth/link-expired
e, em 1,5 s, /user/dashboard (o Better Auth já abre a sessão ao verificar)
```

- E-mail já cadastrado não gera erro: o gateway responde como sucesso (RNE-014), e a Web mostra a mesma tela "Confirme seu e-mail".
- A tela "Confirme seu e-mail" mostra o e-mail digitado, o botão "Abrir o <provedor>" quando reconhece o provedor do e-mail, o reenvio e o link "Já confirmei · Ir para login".

### Reenvio da confirmação

O reenvio aparece em três lugares, todos com `ServiceResendConfirmation` → `POST /api/public/auth/resend-confirmation`:

| Onde | Como chega |
|---|---|
| `/resend-confirmation` (`ActionResendConfirmation`) | Pelo dialog "Problemas para entrar?" do login |
| Tela "Confirme seu e-mail" | Logo depois do cadastro, com o e-mail já preenchido |
| `/auth/link-expired` | Quando o link de confirmação falha; pede o e-mail de novo |

- A chamada usa `requestPublicApi`: vai direto ao gateway, sem cookie, porque o limite de reenvio conta por IP do cliente.
- A resposta de sucesso é sempre genérica: "Se existir uma conta pendente para este e-mail, enviaremos uma nova confirmação."
- **Tempo de espera:** o `retryAfterSeconds` do corpo (ou, sem ele, o header `Retry-After`) inicia a contagem em `useResendConfirmationCooldown`, tanto no sucesso quanto no `429 rate_limited`. Enquanto conta, o botão fica desabilitado e mostra "Solicitar novamente em mm:ss" (ou `hh:mm:ss` acima de uma hora). Os limites (intervalo por e-mail, por hora e por IP) estão no `endpoints.md` do gateway.
- Erros aparecem com título próprio: "Muitas tentativas", "Falha de conexão" ou "Serviço indisponível" (5xx).

---

## Perfil: troca de e-mail

Na seção "Dados pessoais e acesso" do Perfil (`/user/profile`), o campo **Email** é editável (`EditableFieldFixed`), com a dica "Após alterar, confirme pelo link enviado ao novo e-mail". Ao salvar, envia `intent=update_email` para a `ActionProfile`, que chama `ServiceUpdateEmail` → `PATCH /api/protected/user/email`.

O gateway pede a troca ao `changeEmail` do Better Auth, que manda o e-mail "Confirme seu novo e-mail" para o endereço novo; a tela mostra o toast "Confirme no novo e-mail!". A troca só vale depois do clique no link, que passa pelo `/api/auth/verify-email` e volta para `/auth/success`.

Se o gateway recusar, a `ActionProfile` devolve `{ error }` em vez de lançar, e a tela mostra o toast "Erro ao atualizar email" sem sair do Perfil. O mesmo vale para nome e telefone.

---

## Exclusão de conta

No fim do Perfil, a seção **"Excluir minha conta"** (`DeleteAccountSection`) apaga a conta, a empresa e todos os dados dela, sem volta.

```
Usuário clica em "Excluir minha conta"
        ↓
Dialog abre e consulta ServiceAccountHasPassword → GET /api/auth/list-accounts
        ↓
Pede a senha se a conta tem login por senha (ou se não deu para saber)
e a palavra EXCLUIR para liberar o botão "Excluir para sempre"
        ↓
ServiceDeleteAccount → POST /api/auth/delete-user  ({ password } ou {})
        ↓
Se veio CREDENTIAL_ACCOUNT_NOT_FOUND (mandou senha a uma conta só do Google,
porque o list-accounts falhou), marca a conta como sem senha e repete sem senha
```

| Resposta | O que a tela mostra |
|---|---|
| Sucesso | "Sua conta foi excluída." |
| `INVALID_PASSWORD` | "Senha incorreta. Confira e tente de novo." |
| `SESSION_EXPIRED` | "Por segurança, saia, entre de novo e volte aqui para excluir a conta." |
| Outro código ou falha de rede | "Não foi possível excluir a conta agora. Tente de novo em instantes." |

- Quem só entra pelo Google não tem senha: o pedido vai sem senha, e o gateway só aceita se a entrada foi recente (24 h); senão, cai em `SESSION_EXPIRED`.
- Durante a exclusão e depois dela o dialog não fecha. A tela final tem o botão "Ir para o início", que recarrega a página em `/`.

---

## Resolução da URL da API

O utilitário `http.ts` monta a URL a partir de duas variáveis:

| Ambiente | Comportamento |
|---|---|
| **Local** | `VITE_API_BASE_URL` vazia (como no `.env.example`): os caminhos ficam relativos (`/api/...`) e o proxy do `vite.config.ts` repassa para `http://localhost:3000`, o mesmo caminho da produção. Com `VITE_API_BASE_URL=http://localhost:3000`, a Web chama o gateway direto. |
| **Vercel (produção ou preview)** | `VITE_API_BASE_URL` vazia: a Web chama `/api/*` no próprio domínio e o `vercel.json` repassa para `https://feedback-analytics-api-gateway.vercel.app/api/*`, mantendo o cookie de sessão no domínio do site. |

`VITE_PUBLIC_API_BASE_URL` vale só para as rotas públicas que contam por IP (reenvio da confirmação e envio do formulário público de feedback): elas vão direto ao gateway, com `credentials: 'omit'`, porque atrás do repasse da Vercel todos os pedidos poderiam chegar com o mesmo IP. Sem a variável, usa a mesma base de `VITE_API_BASE_URL`.

---

## Veja Também

- [Visão Geral — Mapa de Rotas](./visao-geral.md)
- [Arquitetura e Estrutura](./arquitetura-estrutura.md)
- [System Design](./system-design.md)

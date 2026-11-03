# Configuração de IA: catálogo dinâmico

A tela `/user/edit/ia-settings` consulta modelos pelo API Gateway. O navegador não chama a API do OpenRouter diretamente e não recebe a chave armazenada; a única ida ao OpenRouter é a tela de autorização do "Conectar com OpenRouter".

## Comportamento

- Sem chave salva: mostra o selo "Configuração obrigatória", o botão **Conectar com OpenRouter** e, recolhido em **"Já tenho uma chave"**, o campo do token (tipo senha, com botão de exibir) e o link para pegar a chave no OpenRouter. O seletor de modelo fica desabilitado ("Informe a chave primeiro") até um token ser digitado; depois mostra o catálogo público compatível.
- Com chave salva: mostra o selo "Chave configurada", o resumo (modelo ativo e final da chave `sk-or-…xxxx`), o botão **Remover chave** e o seletor com os modelos permitidos para a conta. Token e botão de exibição ficam ocultos. "Salvar modelo" só fica habilitado para uma escolha diferente e disponível.
- A busca do seletor filtra por nome/identificador sem trocar a seleção atual. Não há lista fixa nem campo de modelo livre.
- **Só gratuitos por padrão:** a lista começa com as variantes gratuitas (`:free`) e `openrouter/free`, somente se já estiverem no catálogo compatível do Gateway. A exceção é quem já usa um modelo pago: aí a lista abre com os pagos, para não esconder a escolha atual. A caixinha **Mostrar também modelos pagos** inclui os demais, mantendo a busca.
- O roteamento automático (`openrouter/auto`) só é pré-selecionado se vier no catálogo e os pagos estiverem visíveis, porque ele não é gratuito; sem pré-seleção, o usuário escolhe um modelo.
- Uma seleção paga com o filtro de gratuitos é preservada como opção desabilitada, marcada "seleção atual (modelo pago)"; salvar fica bloqueado até escolher uma opção gratuita ou marcar a caixinha. Trocar o filtro não salva nem troca a configuração, e ele não é enviado no payload.
- Um modelo salvo ausente do catálogo continua visível como opção desabilitada ("modelo atual indisponível"), com aviso. Nenhuma troca é feita automaticamente.
- Falha, carregamento e catálogo vazio bloqueiam gravação e permitem **Atualizar modelos**. Catálogo `stale` exibe aviso; uma escolha ainda pode ser enviada porque o Gateway exige catálogo atualizado ao gravar.
- A remoção pede confirmação ("Tem certeza de que deseja remover a chave OpenRouter?"). Confirmada pelo servidor, a tela volta ao estado sem chave, com o token vazio. Falhas não apagam a configuração nem o token digitado.
- Falha ao ler a configuração não é interpretada como ausência de chave: a tela bloqueia o formulário e oferece **Recarregar configuração**.
- Respostas atrasadas são abortadas/ignoradas quando a configuração muda. Se o catálogo indicar outra configuração (ou o servidor responder `ia_config_changed`/`ia_config_required`), é necessário recarregá-la antes de salvar.
- Com chave salva, a caixinha **Avisar quando a IA demorar** liga ou desliga o aviso que, depois de 40 segundos sem resposta, recomenda trocar de modelo. A escolha fica no `localStorage` do navegador; o padrão é ligado.

## Conectar com OpenRouter (OAuth PKCE)

Evita copiar e colar a chave: a pessoa entra (ou cria a conta) no OpenRouter, autoriza e volta conectada.

1. `ConnectOpenRouterButton` gera o par PKCE (verificador aleatório e desafio S256) e guarda no `sessionStorage` o verificador, a tela de volta (`returnTo`) e o modelo já escolhido, se houver.
2. O navegador vai para `https://openrouter.ai/auth` com `callback_url=<origem>/user/openrouter/callback` e o `code_challenge`.
3. O OpenRouter volta para `/user/openrouter/callback?code=…`. A tela lê e apaga o pedido guardado (uso único, vale 15 minutos) e envia `{ code, codeVerifier, model }` ao Gateway, que troca o código pela chave e a salva. A chave nunca passa pelo navegador.
4. Com sucesso, mostra o toast "OpenRouter conectado!" e volta para `returnTo` com `?openrouter=connected` (a navegação recarrega os loaders). Sem `code`, sem pedido guardado ou com pedido vencido, ou se o Gateway recusar, mostra "Não deu para conectar" e o botão "Voltar e tentar de novo".

O mesmo botão aparece na etapa de IA do onboarding (`AIContextDialog`), que guarda o contexto digitado antes de sair e o devolve na volta, já na etapa da IA. Sem modelo escolhido, o Gateway decide qual salvar (regra no `endpoints.md` dele).

## Geração automática das perguntas da empresa

Com a IA configurada e o contexto da empresa completo, o Gateway enfileira a geração das 3 perguntas do formulário geral (ao salvar a chave, conectar, trocar o modelo ou salvar o contexto). A Web só acompanha:

- `CompanyQuestionsGenerationProvider` (no layout `/user`, ativo só com chave salva) consulta o pedido mais recente a cada revalidação do layout e faz polling de 5 em 5 segundos enquanto ele está ativo.
- **No onboarding:** depois de salvar contexto e IA, a tela **"Preparando sua conta"** (`InitialSetupProgressDialog`) espera a geração. Depois de 40 segundos mostra "A IA está demorando" com a troca rápida de modelo (`IaModelQuickSwitch`). Na falha, mostra o motivo, **Tentar de novo** e a troca de modelo; se o erro é da conta, **Revisar chave** leva à Configuração de IA. **Continuar com as perguntas padrão** aparece na falha ou depois de 3 minutos. Ao concluir, leva ao Dashboard.
- **Fora do onboarding:** o fim da geração vira toast ("Perguntas personalizadas!" ou o aviso de falha, com atalho para a Configuração de IA quando o motivo pede).
- **Aviso persistente de falha** (`CompanyQuestionsFailureBanner`, no topo do layout): aparece quando o último pedido falhou, as perguntas ainda são as padrão e o aviso não foi dispensado. Como vem do servidor, sobrevive a recarregar e trocar de aparelho. Oferece **Tentar de novo**, **Trocar modelo** (ou **Revisar chave**, se o erro é da conta) e **Manter perguntas padrão**, que dispensa o aviso.
- Depois de "Tentar de novo" ou de trocar o modelo, quando não sai um pedido novo, a tela mostra o motivo: perguntas já editadas, tempo de espera ("Aguarde N minutos para tentar de novo."), chave ausente ou contexto incompleto.

## IA não configurada em outras telas

- **Perfil:** o card "Contexto e LLM da empresa" mostra "Configurado" só com contexto completo e modelo salvo; senão, "Incompleto" e "Chave e modelo não configurados". "Editar contexto e LLM" abre o mesmo `AIContextDialog` do onboarding.
- **Dashboard:** o diagnóstico do escopo mostra "Configure a IA para receber o diagnóstico." com o link "Configurar a IA".
- **Análises:** o erro `ia_config_required` vira "Configure sua chave OpenRouter em Editar > Configuração de IA antes de iniciar uma análise."

## Contrato HTTP

| Operação | Endpoint | Payload |
|---|---|---|
| Consultar estado | `GET /api/protected/user/ia-config` | — |
| Consultar modelos | `GET /api/protected/user/ia-models` | — |
| Cadastrar chave/modelo | `PUT /api/protected/user/ia-config` | `{ provider: "openrouter", model, apiKey }` |
| Conectar com OpenRouter | `POST /api/protected/user/ia-config/openrouter/connect` | `{ code, codeVerifier, model? }` |
| Trocar modelo | `PATCH /api/protected/user/ia-config/model` | **Somente** `{ model }` |
| Remover chave/configuração | `DELETE /api/protected/user/ia-config` | — |

A geração das perguntas usa `GET /api/protected/ia-analyze/jobs/company-questions/latest`, `POST …/retry` e `POST …/dismiss`. Corpos, respostas e erros de todas essas rotas estão no `docs/endpoints.md` do repositório `feedback-analytics-api-gateway`.

Todas as chamadas usam o cliente HTTP da aplicação, com cookie de sessão. O catálogo não é armazenado em localStorage/sessionStorage. A leitura pública não valida as permissões da chave digitada: isso acontece no PUT. O PATCH utiliza exclusivamente a chave já armazenada no Gateway. A troca de modelo vai pela action da rota `/user/edit/ia-settings`, também quando feita pela troca rápida em outras telas.

Erros de chave inválida, modelo indisponível, restrições da conta, falha temporária, conflito de configuração e conexão recusada pelo OpenRouter têm mensagens específicas. HTTP 401 indica sessão expirada, não chave OpenRouter inválida. Conflitos exigem revalidação; mensagens brutas do servidor não são exibidas.

O filtro reconhece apenas identificadores explicitamente gratuitos; não classifica modelos pelo nome ou por preços incompletos. `openrouter/auto` não é considerado gratuito: a cobrança depende do modelo escolhido pelo roteador. Modelos gratuitos também têm limites de uso/disponibilidade. Referências: [variantes de modelos](https://openrouter.ai/docs/guides/overview/models), [roteador gratuito](https://openrouter.ai/docs/guides/routing/routers/free-router) e [preço do Auto Router](https://openrouter.ai/docs/guides/routing/routers/auto-router#pricing).

## Validação local

1. Iniciar Gateway e frontend (`npm run dev` em cada repositório), autenticar e abrir a configuração de IA.
2. Confirmar que o catálogo carrega e que a busca encontra opções por nome e ID.
3. Com chave salva, escolher outro modelo: no Network, o PATCH deve conter apenas `model`, e o resumo só deve mudar após sucesso.
4. Confirmar que o token não reaparece ao trocar modelo. Ao remover a chave, o campo deve reaparecer vazio.
5. Simular falha/catálogo vazio/modelo removido com os testes automatizados, sem alterar credenciais reais.

Os testes de componente cobrem os estados de interface; os de fluxo usam o React Router real com serviços simulados; os de serviço verificam método, sessão e payload HTTP.

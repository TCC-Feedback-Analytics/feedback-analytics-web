# Configuração de IA: catálogo dinâmico

A tela `/user/edit/ia-settings` consulta modelos pelo API Gateway. O navegador não chama o OpenRouter diretamente e não recebe a chave armazenada.

## Comportamento

- Sem chave salva: mostra cadastro do token e catálogo público compatível. O roteamento automático só é pré-selecionado se vier no catálogo; caso contrário, o usuário deve escolher um modelo.
- Com chave salva: mantém token e botão de exibição ocultos; mostra resumo, remoção e seletor com os modelos permitidos para a conta. “Salvar modelo” só fica habilitado para uma escolha diferente e disponível.
- A busca filtra por nome/identificador sem trocar a seleção atual. Não há lista fixa nem campo de modelo livre.
- A caixinha **Buscar modelos gratuitos**, abaixo da busca, combina o texto com as variantes gratuitas (`:free`) e `openrouter/free`, somente se já estiverem no catálogo compatível do Gateway. Desmarcá-la restaura as outras opções, mantendo a busca.
- Uma seleção não gratuita é preservada como opção desabilitada e identificada como fora do filtro; nesse caso, salvar fica bloqueado até escolher uma opção gratuita ou desmarcar a caixinha. Marcar o filtro não salva nem troca a configuração, e ele não é enviado no payload.
- Um modelo salvo ausente do catálogo continua visível como opção desabilitada, com aviso. Nenhuma troca é feita automaticamente.
- Falha, carregamento e catálogo vazio bloqueiam gravação e permitem atualizar a lista. Catálogo `stale` exibe aviso; uma escolha ainda pode ser enviada porque o Gateway exige catálogo atualizado ao gravar.
- Na remoção confirmada pelo servidor, o cadastro reaparece vazio e com campo do tipo senha. Falhas não apagam a configuração nem o token digitado.
- Falha ao ler a configuração não é interpretada como ausência de chave: a tela bloqueia o formulário e oferece recarga.
- Respostas atrasadas são abortadas/ignoradas quando a configuração muda. Se o catálogo indicar outra configuração, é necessário recarregá-la antes de salvar.

## Contrato HTTP

| Operação | Endpoint | Payload |
|---|---|---|
| Consultar estado | `GET /api/protected/user/ia-config` | — |
| Consultar modelos | `GET /api/protected/user/ia-models` | — |
| Cadastrar chave/modelo | `PUT /api/protected/user/ia-config` | `{ provider: "openrouter", model, apiKey }` |
| Trocar modelo | `PATCH /api/protected/user/ia-config/model` | **Somente** `{ model }` |
| Remover chave/configuração | `DELETE /api/protected/user/ia-config` | — |

Todas as chamadas usam o cliente HTTP da aplicação, com cookie de sessão. O catálogo não é armazenado em localStorage/sessionStorage. A leitura pública não valida as permissões da chave digitada: isso acontece no PUT. O PATCH utiliza exclusivamente a chave já armazenada no Gateway.

Erros de chave inválida, modelo indisponível, restrições da conta, falha temporária e conflito de configuração têm mensagens específicas. HTTP 401 indica sessão expirada, não chave OpenRouter inválida. Conflitos exigem revalidação; mensagens brutas do servidor não são exibidas.

O filtro reconhece apenas identificadores explicitamente gratuitos; não classifica modelos pelo nome ou por preços incompletos. `openrouter/auto` não é considerado gratuito: a cobrança depende do modelo escolhido pelo roteador. Modelos gratuitos também têm limites de uso/disponibilidade. Referências: [variantes de modelos](https://openrouter.ai/docs/guides/overview/models), [roteador gratuito](https://openrouter.ai/docs/guides/routing/routers/free-router) e [preço do Auto Router](https://openrouter.ai/docs/guides/routing/routers/auto-router#pricing).

## Validação local

1. Iniciar Gateway e frontend (`npm run dev` em cada repositório), autenticar e abrir a configuração de IA.
2. Confirmar que o catálogo carrega e que a busca encontra opções por nome e ID.
3. Com chave salva, escolher outro modelo: no Network, o PATCH deve conter apenas `model`, e o resumo só deve mudar após sucesso.
4. Confirmar que o token não reaparece ao trocar modelo. Ao remover a chave, o campo deve reaparecer vazio.
5. Simular falha/catálogo vazio/modelo removido com os testes automatizados, sem alterar credenciais reais.

Os testes de componente cobrem os estados de interface; os de fluxo usam o React Router real com serviços simulados; os de serviço verificam método, sessão e payload HTTP. Esta etapa exige os novos endpoints do Gateway, sem migration ou variáveis de ambiente adicionais.

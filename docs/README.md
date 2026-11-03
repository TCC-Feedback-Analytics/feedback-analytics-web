# Documentação — Frontend (web)

- [Visão geral](visao-geral.md) — o que a Web é, tecnologias, mapa de rotas (públicas, da área `/user` e as antigas que redirecionam) e padrão de data fetching.
- [Arquitetura e estrutura](arquitetura-estrutura.md) — caminho dos dados (tela → loader/action ou hook → serviço → gateway), camadas e onde fica cada arquivo.
- [System design](system-design.md) — organização dos componentes, tokens e temas visuais e fronteiras de erro.
- [Fluxo de autenticação](fluxo-autenticacao.md) — guarda das rotas, sessão por cookie, login (também com Google), completar cadastro, logout, cadastro, recuperação de senha, troca de e-mail e exclusão de conta.
- [Configuração de IA](configuracao-ia.md) — tela `/user/edit/ia-settings`: chave OpenRouter, "Conectar com OpenRouter", catálogo de modelos, geração automática das perguntas e contrato HTTP com o gateway.
- [Interface e performance](interface-performance.md) — carregamento, skeletons, estados da tela e componentes focados em conversão.
- [Testes de páginas](../pages/tests/README.md) — como os testes das páginas (Vitest + React Testing Library) estão organizados e como rodá-los.

Concepção, decisões e produto vivem no [repo central de docs](https://github.com/TCC-Feedback-Analytics/feedback-analytics).

/**
 * Explicações em linguagem simples das métricas que costumam confundir o gestor.
 * Centralizadas aqui para reuso pelo componente MetricHelp (ícone "?") em qualquer
 * tela. A matemática vive no backend; aqui só traduzimos o significado.
 */

export type MetricTermKey =
  | 'aspects'
  | 'ratingAverage'
  | 'ratingShares'
  | 'ratingMovement'
  | 'commentTone';

export type MetricExplanation = {
  title: string;
  paragraphs: string[];
  /** Exemplo prático opcional, destacado no modal. */
  example?: string;
};

export const METRIC_EXPLANATIONS: Record<MetricTermKey, MetricExplanation> = {
  aspects: {
    title: 'Assuntos que mais impactam',
    paragraphs: [
      'São os temas citados DENTRO dos comentários (ex.: atendimento, preço, entrega), cada um com seu saldo de sentimento — o quanto os clientes falam bem ou mal daquele assunto.',
      'A ordem é por impacto (quantas vezes foi citado × intensidade). Os de saldo negativo são as principais reclamações para priorizar.',
    ],
    example: '"Entrega" com saldo −40 = o assunto que mais incomoda.',
  },
  ratingAverage: {
    title: 'Média das estrelas',
    paragraphs: [
      'A média das estrelas (de 1 a 5) que os clientes deram, no escopo escolhido. Vale só para a nota: comentários e perguntas têm métricas próprias.',
      'A palavra ao lado usa a mesma escala do formulário: 4,5 a 5,0 Ótima · 3,5 a 4,4 Boa · 2,5 a 3,4 Mediana · 1,5 a 2,4 Ruim · 1,0 a 1,4 Péssima.',
    ],
    example: '4,2 /5 Boa · 128 avaliações.',
  },
  ratingShares: {
    title: 'Avaliações positivas e críticas',
    paragraphs: [
      'Positivas são as avaliações com 4 ou 5 estrelas; críticas, com 1 ou 2. As de 3 estrelas são neutras e aparecem na página de todas as métricas de estrelas.',
      'O percentual mostra quantas, de cada 100 avaliações, foram positivas ou críticas.',
    ],
    example: '82 · 64% = 82 avaliações positivas, 64 de cada 100.',
  },
  ratingMovement: {
    title: 'Movimento das avaliações',
    paragraphs: [
      'As barras mostram quantas avaliações chegaram em cada dia, semana ou mês. A linha embaixo mostra a média das estrelas nesse mesmo intervalo.',
      'Assim dá para ver se as avaliações estão aumentando ou diminuindo e se a nota vem subindo ou caindo. O intervalo muda com o período: dia para 7 e 30 dias, semana para 3 e 6 meses.',
      'Uma bolinha vazada quer dizer que o intervalo teve menos de 5 avaliações: a média ali ainda é pouco confiável.',
    ],
    example: 'Barras subindo e linha caindo = mais clientes avaliando, mas mais insatisfeitos.',
  },
  commentTone: {
    title: 'Tom dos comentários',
    paragraphs: [
      'A IA lê cada comentário escrito e classifica o tom como positivo, neutro ou negativo. A barra mostra a proporção de cada um.',
      'O resumo é o percentual de positivos menos o de negativos (de −100 a +100), dito também em palavras: Positivo, Neutro (entre −5 e +5) ou Atenção.',
    ],
    example: '60% positivos e 15% negativos → +45 · Positivo.',
  },
};

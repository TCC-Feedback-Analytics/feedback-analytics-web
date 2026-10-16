/**
 * Explicações em linguagem simples das métricas que costumam confundir o gestor.
 * Centralizadas aqui para reuso pelo componente MetricHelp (ícone "?") em qualquer
 * tela. A matemática vive no backend; aqui só traduzimos o significado.
 */

export type MetricTermKey =
  | 'netSatisfaction'
  | 'csat'
  | 'netSentiment'
  | 'confidenceInterval'
  | 'climate'
  | 'themes'
  | 'emotionalMoments'
  | 'emotionalThermometer'
  | 'sentimentDistribution'
  | 'aspects'
  | 'ratingAverage'
  | 'ratingShares'
  | 'precision'
  | 'commentTone';

export type MetricExplanation = {
  title: string;
  paragraphs: string[];
  /** Exemplo prático opcional, destacado no modal. */
  example?: string;
};

export const METRIC_EXPLANATIONS: Record<MetricTermKey, MetricExplanation> = {
  netSatisfaction: {
    title: 'Saldo de satisfação',
    paragraphs: [
      'Mostra, com base nas ESTRELAS, se há mais gente satisfeita do que insatisfeita.',
      'Pega o % de notas boas (4 e 5) e subtrai o % de notas ruins (1 e 2). Varia de −100 a +100 — positivo = mais satisfeitos do que insatisfeitos; quanto maior, melhor.',
    ],
    example: '70% deram nota boa e 10% nota ruim → saldo +60.',
  },
  csat: {
    title: 'Clientes satisfeitos',
    paragraphs: [
      'É o percentual de respostas com nota boa — 4 ou 5 estrelas ("Boa" ou "Ótima").',
      'Responde, de forma direta: "de cada 100 avaliações, quantas foram satisfeitas?".',
    ],
    example: '82% = 82 de cada 100 avaliações foram boas.',
  },
  netSentiment: {
    title: 'Saldo de sentimento',
    paragraphs: [
      'Parecido com o saldo de satisfação, mas olha o TOM dos comentários (o texto), não as estrelas. A IA lê cada comentário e classifica como positivo, neutro ou negativo.',
      'É o % de comentários positivos menos o % de negativos. Varia de −100 a +100 — positivo indica um clima geral bom.',
    ],
    example: '60% dos comentários positivos e 20% negativos → saldo +40.',
  },
  confidenceInterval: {
    title: 'Faixa provável',
    paragraphs: [
      'A nota é uma estimativa feita a partir das respostas recebidas. A faixa provável é o intervalo onde a nota real provavelmente está.',
      'Quanto mais respostas, mais estreita (mais precisa) fica a faixa. Uma faixa larga indica que ainda há bastante incerteza.',
    ],
    example: 'Nota 4,2 com faixa 3,8–4,6 — a real deve estar nesse intervalo.',
  },
  climate: {
    title: 'Clima emocional',
    paragraphs: [
      'Um resumo do tom geral dos comentários, a partir da análise de sentimento da IA.',
      'Pode ser Positivo (predominam elogios), Neutro (elogios e críticas equilibrados) ou de Atenção (predominam reclamações — pede ação).',
    ],
  },
  themes: {
    title: 'Categorias e palavras-chave',
    paragraphs: [
      'A IA lê os comentários e os agrupa em categorias/temas (ex.: atendimento, preço, entrega) e destaca as palavras que mais se repetem.',
      'Ajuda a enxergar SOBRE O QUE os clientes mais falam. A ordem considera quantidade e consistência das menções — não só o número bruto.',
    ],
    example: '"Atendimento" 24x · 30% = citado em 30% dos feedbacks.',
  },
  emotionalMoments: {
    title: 'Momentos emocionais',
    paragraphs: [
      'Agrupa os feedbacks pelo tipo de emoção: momentos que encantam (elogios fortes), pontos de dor (reclamações fortes), neutros/ambivalentes e divergências (quando a nota e o texto não combinam).',
      'Mostra exemplos reais de cada grupo, para você entender rápido o que mais desperta emoção nos clientes.',
    ],
  },
  emotionalThermometer: {
    title: 'Termômetro emocional',
    paragraphs: [
      'É a "temperatura" do humor dos clientes: a proporção de comentários positivos, neutros e negativos, lida pela IA a partir dos textos.',
      'Quanto mais positivos, melhor o clima; muitos negativos indicam pontos que pedem atenção.',
    ],
  },
  sentimentDistribution: {
    title: 'Distribuição de sentimentos',
    paragraphs: [
      'Mostra como os comentários se dividem entre positivos, neutros e negativos. A IA lê cada texto e classifica o tom de cada um.',
      'Os três percentuais somam 100% e revelam a proporção geral do que os clientes sentem — se predominam elogios, críticas ou indiferença.',
    ],
    example: '30% positivos · 45% neutros · 25% negativos.',
  },
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
  precision: {
    title: 'Precisão',
    paragraphs: [
      'Diz o quanto o número é firme com as respostas recebidas: alta, média ou baixa. Considera a quantidade de respostas e o quanto elas variam entre si.',
      'Com menos de 10 respostas, a precisão é sempre baixa. A precisão não garante que quem respondeu represente todos os seus clientes.',
    ],
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

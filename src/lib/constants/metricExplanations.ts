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
  | 'ratingWeight'
  | 'peakTimes'
  | 'returningCustomers'
  | 'commentTone'
  | 'scopeDiagnosis'
  | 'commentParticipation';

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
  ratingWeight: {
    title: 'O que mais pesa na nota',
    paragraphs: [
      'Compara a nota de cada pergunta com as estrelas que o mesmo cliente deu. Se, quando a pergunta vai bem, as estrelas também sobem, ela pesa muito na nota geral.',
      '"Pesa muito", "Pesa" e "Pesa pouco" vêm dessa comparação. Com menos de 30 respostas ainda não dá para saber.',
      '"Melhore primeiro" aponta, entre as perguntas que pesam, a de nota mais baixa: é onde uma melhora tende a mexer mais na avaliação geral.',
      'Mostra o que anda junto com a nota, não prova que uma coisa causa a outra.',
    ],
    example: 'Tempo de espera · Pesa muito na nota · 3,1 /5 = melhorar a espera tende a subir as estrelas.',
  },
  peakTimes: {
    title: 'Dias e horários de pico',
    paragraphs: [
      'Mostra em que dia da semana e em que parte do dia os clientes mais avaliam. Quanto mais forte a cor, mais avaliações chegaram ali.',
      'O número em cada quadrado é a média das estrelas naquela faixa. Quadrados apagados tiveram menos de 5 avaliações: a média ali ainda é pouco confiável.',
      'Horários com média baixa costumam ser os de mais movimento ou com equipe menor. Vale olhar a escala e o atendimento nessas faixas.',
    ],
    example: 'Sexta à tarde · média 3,4 = a nota cai nas tardes de sexta.',
  },
  returningCustomers: {
    title: 'Clientes que voltam',
    paragraphs: [
      'Mostra quantas avaliações vieram de quem já tinha avaliado a empresa antes, em qualquer produto, serviço ou departamento. Cliente que volta é sinal de fidelidade.',
      'Também compara a nota de quem volta com a de quem avalia pela primeira vez. Se quem volta dá nota maior, a experiência se sustenta; se dá menor, algo piora com o tempo.',
      'O sistema reconhece o cliente pelo aparelho usado para avaliar, sem dados pessoais. Por isso o número é aproximado: a mesma pessoa em outro celular conta como outro cliente.',
    ],
    example: '20% das avaliações vêm de quem volta · Quem volta dá 4,8; primeira vez, 3,8.',
  },
  commentTone: {
    title: 'Tom dos comentários',
    paragraphs: [
      'A IA lê cada comentário escrito e classifica o tom como positivo, neutro ou negativo. A barra mostra a proporção de cada um.',
      'O resumo é o percentual de positivos menos o de negativos (de −100 a +100), dito também em palavras: Positivo, Neutro (entre −5 e +5) ou Atenção.',
    ],
    example: '60% positivos e 15% negativos → +45 · Positivo.',
  },
  commentParticipation: {
    title: 'Quem escreve comentário',
    paragraphs: [
      'O comentário é opcional: o cliente pode só dar as estrelas e responder às perguntas. Este número mostra quantas avaliações trazem um comentário escrito.',
      'Ele diz o quanto o tom dos comentários e o resumo da IA representam os clientes. Se poucos escrevem, esses resultados falam de uma parte pequena; as estrelas e as perguntas continuam contando todo mundo.',
      'Também compara a nota de quem comenta com a de quem não comenta. Se quem comenta dá nota bem menor, os comentários vêm mais de quem está insatisfeito, e o contrário também vale.',
    ],
    example: '25% escreveram um comentário · Quem comenta dá 3,1; quem só dá as estrelas, 4,5.',
  },
  scopeDiagnosis: {
    title: 'Diagnóstico do escopo',
    paragraphs: [
      'A IA lê, de uma vez, todos os números do escopo no período escolhido: estrelas, perguntas do formulário, tom dos comentários, movimento, horários de pico e clientes que voltam. Depois diz o que vai bem, o que preocupa e o que fazer primeiro.',
      'Com um período escolhido, ela compara com o período anterior do mesmo tamanho e conta o que melhorou ou piorou. Cada ponto traz o número que o sustenta, para você conferir.',
      'Os números são calculados pelo sistema; a IA só interpreta. Com poucas avaliações, ela avisa onde os dados ainda não bastam para concluir.',
    ],
    example: '1. Corrigir: rever o tempo de espera · a pergunta sobre espera caiu de 4,1 para 3,4.',
  },
};

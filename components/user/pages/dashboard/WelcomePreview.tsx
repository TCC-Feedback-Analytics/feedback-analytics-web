import { FaArrowUp, FaStar } from 'react-icons/fa6';
import type { WelcomePreviewCardProps, WelcomePreviewProps } from './ui.types';

function PreviewCard({ title, description, example = false, tourId, className = '', children }: WelcomePreviewCardProps) {
  return (
    <section
      data-tour={tourId}
      className={`flex min-w-0 flex-col gap-4 rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-5 ${className}`}
    >
      <header className="flex items-start justify-between gap-3">
        <h3 className="font-montserrat text-base font-semibold text-(--text-primary)">{title}</h3>
        {example && (
          <span className="shrink-0 rounded-full border border-(--quaternary-color)/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-(--text-tertiary)">
            Exemplo
          </span>
        )}
      </header>
      {children}
      <p className="mt-auto text-xs text-(--text-secondary)">{description}</p>
    </section>
  );
}

/**
 * "O que vai aparecer aqui": as cinco seções do Dashboard em prévia enquanto a
 * conta não tem feedbacks. Diagnóstico, estrelas, movimento e comentários usam dados de exemplo
 * (apagados e com selo); as perguntas são as reais do formulário. Mantém as
 * âncoras do guia, que passa por estas seções logo após o cadastro.
 */
export default function WelcomePreview({ questions }: WelcomePreviewProps) {
  return (
    <section aria-labelledby="welcome-preview-title" className="font-work-sans space-y-3">
      <h2 id="welcome-preview-title" className="font-montserrat text-lg font-semibold text-(--text-primary)">
        O que vai aparecer aqui
      </h2>

      {/* grid-cols-1 no celular: sem colunas definidas, a coluna crescia até o conteúdo e cortava os cards. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* No topo, como no Dashboard com feedbacks: a visão do conjunto vem primeiro. */}
        <PreviewCard
          title={<>Diagnóstico do escopo <span className="text-sm font-medium text-(--primary-color)">✨ IA</span></>}
          description="A IA junta todos os números do período, compara com o período anterior e diz o que fazer primeiro, com o número de cada ponto. Começa com 10 avaliações no período."
          tourId="tour-dashboard-diagnosis"
          className="md:col-span-2 xl:col-span-4"
          example
        >
          <div className="welcome-ghost space-y-2" aria-hidden>
            <p className="text-sm text-(--text-primary)">
              O atendimento vai bem, mas a espera puxa a nota para baixo nas tardes de sexta.
            </p>
            <ol className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--primary-color) text-[10px] font-bold text-(--bg-primary)">1</span>
                <span className="rounded-full bg-(--negative)/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-(--negative)">Corrigir</span>
                <span className="truncate text-(--text-secondary)">Reforçar a equipe na sexta à tarde · média 3,4</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--primary-color) text-[10px] font-bold text-(--bg-primary)">2</span>
                <span className="rounded-full bg-(--positive)/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-(--positive)">Manter</span>
                <span className="truncate text-(--text-secondary)">O atendimento cordial · nota 4,6</span>
              </li>
            </ol>
          </div>
        </PreviewCard>

        <PreviewCard
          title="Avaliação por estrelas"
          description="A média das estrelas e quantas avaliações foram positivas e críticas, no período que você escolher e comparadas com o período anterior."
          example
          tourId="tour-star-ratings"
        >
          <div className="welcome-ghost grid grid-cols-3 gap-2" aria-hidden>
            <div className="rounded-lg bg-(--seventh-color) p-2.5">
              <p className="text-[10px] text-(--text-tertiary)">Média</p>
              <p className="flex items-center gap-1 text-base font-semibold text-(--text-primary)">
                4,2 <FaStar className="text-xs text-yellow-400" />
              </p>
              <p className="text-[10px] text-(--positive)">Boa</p>
            </div>
            <div className="rounded-lg bg-(--seventh-color) p-2.5">
              <p className="text-[10px] text-(--text-tertiary)">Positivas</p>
              <p className="text-base font-semibold text-(--positive)">64%</p>
              <p className="text-[10px] text-(--text-tertiary)">4–5★</p>
            </div>
            <div className="rounded-lg bg-(--seventh-color) p-2.5">
              <p className="text-[10px] text-(--text-tertiary)">Críticas</p>
              <p className="text-base font-semibold text-(--negative)">8%</p>
              <p className="text-[10px] text-(--text-tertiary)">1–2★</p>
            </div>
            <p className="col-span-3 inline-flex items-center gap-1 text-[11px] font-semibold text-(--positive)">
              <FaArrowUp className="text-[0.6rem]" /> +0,3 vs. 30 dias anteriores
            </p>
          </div>
        </PreviewCard>

        <PreviewCard
          title="Movimento das avaliações"
          description="Quantas avaliações chegam por dia ou semana e se a nota vem subindo ou caindo."
          example
          tourId="tour-movement"
        >
          <div className="welcome-ghost space-y-1.5" aria-hidden>
            <div className="flex h-14 items-end gap-1">
              {[3, 5, 4, 7, 6, 9, 8].map((height, index) => (
                <div key={index} className="flex-1 rounded-sm bg-(--primary-color)/55" style={{ height: `${height * 10}%` }} />
              ))}
            </div>
            <svg viewBox="0 0 70 16" className="block h-4 w-full" preserveAspectRatio="none">
              <polyline points="5,11 15,10 25,11 35,7 45,8 55,5 65,4" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
            <p className="text-[11px] text-(--text-tertiary)">Mais avaliações e média subindo</p>
          </div>
        </PreviewCard>

        <PreviewCard
          title="Perguntas do formulário"
          description="A nota e o % de satisfeitos de cada pergunta do seu formulário."
          tourId="tour-form-questions"
        >
          {questions.length > 0 ? (
            <ol className="space-y-2">
              {questions.map((question) => (
                <li key={question.id} className="rounded-lg bg-(--seventh-color) px-3 py-2">
                  <p className="truncate text-sm text-(--text-primary)" title={question.text}>
                    {question.order}. {question.text}
                  </p>
                  <p className="text-[11px] text-(--text-tertiary)">Aguardando respostas</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-(--text-tertiary)">O formulário geral não tem perguntas ativas.</p>
          )}
        </PreviewCard>

        <PreviewCard
          title={<>Análise dos comentários <span className="text-sm font-medium text-(--primary-color)">✨ IA</span></>}
          description="A IA lê o que os clientes escreveram e mostra o tom, os assuntos que mais pesam e recomendações. Começa com 10 feedbacks."
          tourId="tour-dashboard-comments"
          example
        >
          <div className="welcome-ghost space-y-2" aria-hidden>
            <p className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-(--positive)">+45</span>
              <span className="text-sm font-semibold text-(--positive)">Positivo</span>
            </p>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-(--seventh-color)">
              <div className="h-full bg-(--positive)/70" style={{ width: '60%' }} />
              <div className="h-full bg-(--neutral)/70" style={{ width: '25%' }} />
              <div className="h-full bg-(--negative)/70" style={{ width: '15%' }} />
            </div>
            <p className="text-[11px] text-(--text-tertiary)">60% positivos · 25% neutros · 15% negativos</p>
          </div>
        </PreviewCard>
      </div>
    </section>
  );
}

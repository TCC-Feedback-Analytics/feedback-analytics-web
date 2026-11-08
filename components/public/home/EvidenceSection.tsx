import { Link } from 'react-router-dom';
import { LuArrowRight, LuArrowUpRight, LuBadgeInfo } from 'react-icons/lu';

export default function EvidenceSection() {
  return (
    <section id="analise" className="fn-evidence">
      <div className="fn-container fn-evidence-grid items-start">
        <div className="fn-evidence-copy flex-col">
          <p className="fn-eyebrow font-medium tracking-[.09em]">UMA PAREDE DE EVIDÊNCIAS, NÃO DE ACHISMOS</p>
          <h2>Veja a história por trás da média.</h2>
          <p className="fn-evidence-description max-w-[440px] text-[#91aaa9] text-[16px] leading-[1.6]">Estrelas mostram o resultado. Comentários explicam o motivo. A IA conecta os dois e destaca o que merece prioridade.</p>
          <div className="fn-signal-list text-[#a9bfbd] text-[12px] flex-col">
            <span><i className="fn-signal-positive" />Sinal positivo</span>
            <span><i className="fn-signal-mixed" />Sinal misto</span>
            <span><i className="fn-signal-negative" />Ponto de atenção</span>
          </div>
          <div className="fn-evidence-action bg-[#0a2c31] rounded-[16px]">
            <div className="fn-evidence-action-header justify-between items-center gap-[12px]">
              <p className="fn-eyebrow font-medium tracking-[.09em]">PRÓXIMO PASSO</p>
              <span>
                <LuArrowUpRight aria-hidden="true" />
              </span>
            </div>
            <h3>Troque uma hipótese por uma resposta real.</h3>
            <p>Crie seu primeiro ponto de coleta e descubra quais padrões começam a aparecer.</p>
            <div>
              <Link to="/register" className="fn-button fn-button-accent inline-flex items-center justify-center font-semibold whitespace-nowrap text-[#082a2d]">Experimentar grátis <LuArrowRight aria-hidden="true" /></Link>
              <span>4 meses de teste</span>
            </div>
          </div>
        </div>
        <div className="fn-evidence-board relative" aria-label="Exemplo de análise de feedbacks">
          <div className="fn-board-top flex items-center gap-[17px] text-[#8daaaa] tracking-[.05em]">PAINEL · PRODUTO · PIZZA · ÚLTIMOS 30 DIAS</div>
          <div className="fn-board-content">
            <div className="fn-mean-card overflow-hidden">
              <span className="fn-card-label text-[10px] font-medium tracking-[.07em]">AVALIAÇÃO POR ESTRELAS</span>
              <div>
                <strong>4,6</strong>
                <span>/ 5</span>
              </div>
              <small>128 avaliações · Precisão alta</small>
              <div className="fn-mean-rule h-[4px] bg-[#35d0c3] rounded-[2px]" />
            </div>
            <div className="fn-quote-card">
              <div className="fn-quote-top flex items-center justify-between gap-[8px]">
                <span className="fn-card-label text-[10px] font-medium tracking-[.07em]">COMENTÁRIO RECENTE</span>
                <strong>MISTO</strong>
              </div>
              <blockquote>“A pizza estava excelente, mas esperamos quase quarenta minutos.”</blockquote>
            </div>
            <div className="fn-impact-card">
              <div className="fn-impact-heading flex justify-between gap-[10px]">
                <span className="fn-card-label text-[10px] font-medium tracking-[.07em]">ASSUNTOS POR IMPACTO</span>
                <small>VOL × |NSS|</small>
              </div>
              {[['Qualidade', '+84', 'positive'], ['Espera', '−67', 'negative'], ['Atendimento', '+42', 'neutral']].map(([name, value, tone]) => <div className="fn-impact-line font-bold" key={name}>
                <div>
                  <span>
                    {name}
                  </span>
                  <strong className={tone}>
                    {value}
                  </strong>
                </div>
                <div className="fn-impact-track">
                  <i className={`fn-impact-bar ${tone}`} />
                </div>
              </div>)}
            </div>
            <div className="fn-recommendation">
              <span className="fn-recommendation-pin block w-[16px] h-[16px] bg-[#35d0c3]" />
              <span className="fn-card-label text-[10px] font-medium tracking-[.07em]">PRÓXIMA AÇÃO</span>
              <h3>Reduza a espera nos horários de pico.</h3>
              <p>Reforce a operação sem alterar o produto, hoje seu maior diferencial positivo.</p>
              <Link to="/register">Ver análise completa <LuArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
          <p className="fn-board-footnote text-[12px] leading-[1.4] min-h-[78px] flex items-center gap-[12px] rounded-[10px] bg-[#0a2d32]">
            <LuBadgeInfo aria-hidden="true" />
            <span>A nota mede satisfação. O comentário revela o motivo. Juntos, formam uma leitura mais completa.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

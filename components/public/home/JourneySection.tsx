import { LuArrowRight, LuBriefcaseBusiness, LuCpu, LuUserRound } from 'react-icons/lu';
import { SectionIntro } from './shared';

const flow = [{
  label: 'CLIENTE',
  icon: LuUserRound,
  steps: ['Acessa por QR, Link ou NFC', 'Avalia em menos de 1 min', 'Segue o dia', 'Percebe a melhoria']
}, {
  label: 'PLATAFORMA',
  icon: LuCpu,
  steps: ['Valida o ponto', 'Registra com contexto', 'Classifica e agrega', 'Gera recomendação']
}, {
  label: 'GESTOR',
  icon: LuBriefcaseBusiness,
  steps: ['Configura a coleta', 'Acompanha o volume', 'Entende o impacto', 'Prioriza a mudança']
}];

export default function JourneySection() {
  return (
    <section id="coleta" className="fn-blueprint fn-light-section">
      <div className="fn-container">
        <SectionIntro eyebrow="A JORNADA DE UMA RESPOSTA" title="O cliente faz pouco. O sistema faz o trabalho pesado." description="Um serviço desenhado para ser invisível na coleta e explícito na decisão." />
        <div className="fn-blueprint-board rounded-[18px]">
          <div className="fn-blueprint-grid fn-blueprint-heading grid min-h-[70px] bg-[#e1efed]">
            <span>CAMADA</span>
            {['Acesso', 'Resposta', 'Inteligência', 'Ação'].map((name, i) => <div key={name}>
              <small>0{i + 1}</small>
              <strong>
                {name}
              </strong>
            </div>)}
          </div>
          {flow.map(row => <div className="fn-blueprint-grid fn-blueprint-row grid min-h-[176px]" key={row.label}>
            <div className="fn-blueprint-lane flex items-center text-[#365c5b] text-[10px] tracking-[.08em]">
              <span className="fn-lane-icon grid rounded-[10px] text-[#087e75]">
                <row.icon aria-hidden="true" />
              </span>
              {row.label}
            </div>
            {row.steps.map((step, i) => <div className="fn-blueprint-cell leading-[1.4] font-semibold" key={step}>
              <div className="fn-blueprint-cell-top justify-between items-center min-h-[13px]">
                <span className={`fn-step-dot fn-step-dot-${i + 1} w-[7px] h-[7px] bg-[#35d0c3]`} />
                {i < 3 && <LuArrowRight aria-hidden="true" />}
              </div>
              <span>
                {step}
              </span>
            </div>)}
          </div>)}
        </div>
        <div className="fn-blueprint-note justify-between gap-[15px]">
          <span>A coleta é pública. A análise e o painel são protegidos por autenticação.</span>
          <strong>MOBILE-FIRST · MULTI-ESCOPO · SERVERLESS</strong>
        </div>
      </div>
    </section>
  );
}

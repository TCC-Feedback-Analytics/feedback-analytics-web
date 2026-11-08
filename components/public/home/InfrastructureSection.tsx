import { LuBot, LuCloudCog, LuScanLine, LuShieldCheck } from 'react-icons/lu';
import { SectionIntro } from './shared';

const safeguards = [{
  title: 'Isolamento',
  detail: 'RLS separa os dados de cada empresa.',
  icon: LuShieldCheck
}, {
  title: 'Anti-spam',
  detail: 'Um envio por dispositivo e ponto ao dia.',
  icon: LuScanLine
}, {
  title: 'Resiliência',
  detail: 'Fallback local mantém a análise útil.',
  icon: LuBot
}, {
  title: 'Escala',
  detail: 'Serviços independentes em cloud serverless.',
  icon: LuCloudCog
}];

export default function InfrastructureSection() {
  return (
    <section className="fn-infrastructure bg-[#061d22]">
      <div className="fn-container">
        <SectionIntro eyebrow="O QUE O CLIENTE NÃO VÊ — MAS PROTEGE CADA RESPOSTA" title="Confiança construída por baixo da experiência." description="Segurança, resiliência e qualidade de dados não aparecem no formulário — mas sustentam tudo o que vem depois." dark />
        <div className="fn-safeguards grid gap-[12px]">
          {safeguards.map((item, i) => <article key={item.title}>
            <div className="fn-safeguard-top justify-between">
              <span>0{i + 1}</span>
              <div>
                <item.icon aria-hidden="true" />
              </div>
            </div>
            <h3>
              {item.title}
            </h3>
            <p>
              {item.detail}
            </p>
          </article>)}
        </div>
      </div>
    </section>
  );
}

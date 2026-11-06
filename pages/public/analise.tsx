import { Link } from 'react-router-dom';
import {
  LuArrowRight,
  LuFileCheck,
  LuInbox,
  LuInfo,
  LuListChecks,
  LuMessageCircleHeart,
  LuScanSearch,
  LuSparkles,
} from 'react-icons/lu';
import ProductNavigation from 'components/public/product/ProductNavigation';
import HomeFooter from 'components/public/home/HomeFooter';

const steps = [
  {
    icon: LuInbox,
    title: 'Reúne os comentários',
    body: 'Busca apenas textos ainda não analisados, sempre dentro do escopo selecionado.',
    mobile: 'Busca textos ainda não analisados no escopo.',
    tag: 'LOTES DE ATÉ 20',
  },
  {
    icon: LuSparkles,
    title: 'Interpreta cada voz',
    body: 'Classifica tom, intensidade, confiança, categorias e aspectos presentes no comentário.',
    mobile: 'Classifica tom, confiança, categorias e aspectos.',
    tag: 'SEM POLUIR COM O FORMULÁRIO',
  },
  {
    icon: LuFileCheck,
    title: 'Sintetiza o padrão',
    body: 'Consolida tudo em um resumo situacional e recomendações que servem de ponto de partida.',
    mobile: 'Gera resumo situacional e recomendações.',
    tag: 'RELATÓRIO SALVO',
  },
];
const outputs = [
  {
    icon: LuMessageCircleHeart,
    title: 'Tom dos comentários',
    body: 'Distribuição positivo, neutro e negativo com saldo de sentimento e indicador de precisão.',
    mobile: 'Distribuição e saldo de sentimento.',
    tag: '+45 · POSITIVO',
  },
  {
    icon: LuScanSearch,
    title: 'Assuntos que impactam',
    body: 'Aspectos com no mínimo 3 menções, ordenados por volume × intensidade.',
    mobile: 'Aspectos ordenados por volume × intensidade.',
    tag: 'ESPERA · −66',
  },
  {
    icon: LuListChecks,
    title: 'Resumo e recomendações',
    body: 'Síntese contextualizada ao negócio e próximos passos baseados nos padrões encontrados.',
    mobile: 'Próximos passos baseados nos padrões.',
    tag: '3 AÇÕES PRIORITÁRIAS',
  },
];
function Copy({ desktop, mobile }: { desktop: string; mobile?: string }) {
  return (
    <>
      <span className="co-desktop-copy max-[900px]:hidden">{desktop}</span>
      <span className="co-mobile-copy hidden max-[900px]:inline">{mobile ?? desktop}</span>
    </>
  );
}
function EvidenceBoard() {
  return (
    <div
      className="an-evidence flex-[0_0_470px] rounded-[20px] border border-[#285158] bg-[#092429] p-5 shadow-[0_22px_44px_#0006] max-[900px]:mt-[100px] max-[900px]:rounded-[15px] max-[900px]:p-[15px]"
      aria-label="Exemplo de análise do tom dos comentários"
    >
      <div className="an-evidence-heading flex items-center justify-between gap-2.5 [&_h2]:!text-lg [&_h2]:tracking-normal [&>span]:rounded-full [&>span]:bg-[#12383c] [&>span]:px-[9px] [&>span]:py-1.5 [&>span]:font-[Geist_Mono,monospace] [&>span]:text-[9px] [&>span]:font-bold [&>span]:text-[#68d7cd] max-[900px]:[&_h2]:!text-base max-[900px]:[&>span]:text-[8px]">
        <h2>Tom dos comentários</h2>
        <span>PRECISÃO ALTA</span>
      </div>
      <strong className="an-score mt-4 block font-[Space_Grotesk,sans-serif] text-[38px] font-[650] max-[900px]:mt-2.5 max-[900px]:text-[30px]">
        +45 · Positivo
      </strong>
      <div
        className="an-bar mt-4 flex h-[14px] gap-1 [&_span]:flex-[68] [&_span]:rounded-[7px] [&_span]:bg-[#35d0c3] [&_span:nth-child(2)]:flex-[19] [&_span:nth-child(2)]:bg-[#789392] [&_span:nth-child(3)]:flex-[13] [&_span:nth-child(3)]:bg-[#e98d78] max-[900px]:mt-[11px] max-[900px]:h-[11px]"
        aria-hidden="true"
      >
        <span />
        <span />
        <span />
      </div>
      <div className="an-legend mt-4 flex justify-between [&_strong]:block [&_strong]:font-[Space_Grotesk,sans-serif] [&_strong]:text-lg [&_strong]:font-[650] [&_strong]:text-[#35d0c3] [&>div:nth-child(2)_strong]:text-[#a9bebc] [&>div:nth-child(3)_strong]:text-[#e98d78] [&_small]:block [&_small]:text-[11px] [&_small]:text-[#789392] max-[900px]:mt-[11px] max-[900px]:[&_strong]:text-base max-[900px]:[&_small]:text-[9px]">
        {[
          ['68%', 'Positivos'],
          ['19%', 'Neutros'],
          ['13%', 'Negativos'],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <small>{label}</small>
          </div>
        ))}
      </div>
      <div className="an-insight mt-4 border-t border-[#214247] pt-4 [&>p]:font-[Geist_Mono,monospace] [&>p]:text-[9px] [&>p]:font-bold [&>p]:tracking-[.07em] [&>p]:text-[#789392] [&>div]:mt-4 [&>div]:flex [&>div]:items-center [&>div]:justify-between [&_strong]:block [&_strong]:font-[Space_Grotesk,sans-serif] [&_strong]:text-xl [&_strong]:font-[650] [&_small]:block [&_small]:text-[11px] [&_small]:text-[#789392] [&_b]:font-[Geist_Mono,monospace] [&_b]:text-[28px] [&_b]:font-bold [&_b]:text-[#e98d78] max-[900px]:hidden">
        <p>ASSUNTO QUE MAIS IMPACTA</p>
        <div>
          <span>
            <strong>Tempo de espera</strong>
            <small>12 menções • alta prioridade</small>
          </span>
          <b>−66</b>
        </div>
      </div>
    </div>
  );
}
export default function Analise() {
  return (
    <div className="field-notes coleta-page analise-page [--co-body:#526c6c] [--co-pale:#e6f1ef] [--co-teal:#087e75]">
      <section
        className="co-hero bg-[#03171b] [&_h1]:!my-[22px] [&_h1]:text-[clamp(42px,4.05vw,58px)] [&_h1]:leading-[1.06] [&_h1]:tracking-[-1px] [&_h1]:font-[650] max-[900px]:[&_h1]:!my-[17px] max-[900px]:[&_h1]:text-[42px] max-[900px]:[&_h1]:tracking-[-.7px] max-[360px]:[&_h1]:text-[37px]"
        id="analise-hero"
      >
        <div className="co-hero-inner mx-auto w-[min(calc(100%_-_128px),1312px)] pt-7 pb-16 max-[900px]:w-[calc(100%_-_32px)] max-[900px]:pt-[18px] max-[900px]:pb-[68px]">
          <div className="relative left-1/2 w-[min(calc(100vw_-_152px),1288px)] -translate-x-1/2 max-[850px]:w-[calc(100vw_-_40px)] max-[380px]:w-[calc(100vw_-_24px)]">
            <ProductNavigation />
          </div>
          <div className="co-hero-content an-hero-content flex min-h-[498px] items-center justify-between gap-[50px] pt-[70px] max-[900px]:block max-[900px]:min-h-0 max-[900px]:px-1.5 max-[900px]:pt-[46px] min-h-[508px] max-[900px]:pt-[46px] [&_.co-hero-copy]:max-w-[650px]">
            <div className="co-hero-copy max-w-[670px] [&_.fn-eyebrow]:text-xs [&_.fn-eyebrow]:font-bold [&_.fn-eyebrow]:tracking-[.1em] max-[900px]:max-w-none max-[900px]:[&_.fn-eyebrow]:text-[10px]">
              <p className="fn-eyebrow">ANÁLISE DOS COMENTÁRIOS ✦ IA</p>
              <h1>Centenas de comentários. Uma leitura que orienta.</h1>
              <p className="co-hero-description max-w-[570px] text-lg leading-[1.55] text-[#b3c7c5] max-[900px]:text-[15px] max-[900px]:leading-normal">
                <Copy
                  desktop="A IA organiza o texto livre em tom, assuntos e recomendações — sem misturar o que o cliente marcou com o que ele escreveu."
                  mobile="A IA organiza o texto livre em tom, assuntos e recomendações — sem misturar estrelas com sentimento."
                />
              </p>
              <div className="co-hero-actions mt-[22px] flex items-center gap-3 [&_.co-button]:text-[#042327] [&>span]:text-xs [&>span]:text-[#789392] max-[900px]:mt-[17px] max-[900px]:[&_.co-button]:min-h-[52px] max-[900px]:[&_.co-button]:w-full max-[900px]:[&>span]:hidden">
                <a
                  className="fn-button fn-button-accent co-button inline-flex items-center justify-center gap-2.5 rounded-xl text-sm font-bold"
                  href="#do-texto-a-decisao"
                >
                  Conhecer a análise <LuArrowRight aria-hidden="true" />
                </a>
              </div>
            </div>
            <EvidenceBoard />
          </div>
        </div>
      </section>
      <section
        className="an-strip bg-[#08282d] py-9 [&_.fn-eyebrow]:font-bold [&_.fn-eyebrow]:tracking-[1px] max-[900px]:bg-[#061d22] max-[900px]:py-[34px] max-[900px]:[&_.fn-eyebrow]:text-[10px]"
        aria-label="O que a análise entrega"
      >
        <div className="co-container an-strip-inner mx-auto w-[min(calc(100%_-_152px),1288px)] max-[900px]:w-[min(calc(100%_-_40px),700px)] flex items-center justify-between gap-6 [&>div]:flex [&>div]:items-center [&>div]:gap-2.5 [&>div]:text-[13px] [&>div_span]:font-[Geist_Mono,monospace] [&>div_span]:text-[11px] [&>div_span]:font-bold [&>div_span]:text-[#4f7776] max-[900px]:grid max-[900px]:gap-5 max-[900px]:[&>div]:gap-[13px] max-[900px]:[&>div]:text-sm max-[900px]:[&>div_span]:grid max-[900px]:[&>div_span]:h-[42px] max-[900px]:[&>div_span]:w-[42px] max-[900px]:[&>div_span]:place-items-center max-[900px]:[&>div_span]:rounded-[11px] max-[900px]:[&>div_span]:bg-[#0d3035] max-[900px]:[&>div_span]:text-[#35d0c3]">
          <p className="fn-eyebrow">A IA LÊ O TEXTO. A MATEMÁTICA MEDE A BASE.</p>
          {['Sentimento graduado', 'Aspectos e categorias', 'Resumo e recomendações'].map(
            (label, index) => (
              <div key={label}>
                <span>0{index + 1}</span>
                <strong>{label}</strong>
              </div>
            ),
          )}
        </div>
      </section>
      <section
        className="an-section an-workflow py-[84px] [&_.fn-eyebrow]:font-bold [&_.fn-eyebrow]:tracking-[1px] [&_.co-section-header>p]:text-[#526c6c] max-[900px]:py-[54px] bg-[#f5faf9] text-[#082327] [&_.fn-eyebrow]:!text-[#087e75]"
        id="do-texto-a-decisao"
      >
        <div className="co-container mx-auto w-[min(calc(100%_-_152px),1288px)] max-[900px]:w-[min(calc(100%_-_40px),700px)]">
          <div className="co-section-header mb-11 flex items-end justify-between gap-[50px] [&_h2]:!mt-[14px] [&_h2]:max-w-[760px] [&>p]:w-[410px] [&>p]:shrink-0 [&>p]:text-[15px] [&>p]:leading-[1.55] max-[900px]:mb-[22px] max-[900px]:block max-[900px]:[&_h2]:!mt-[22px] max-[900px]:[&_h2]:!text-[34px] max-[900px]:[&_h2]:!leading-[1.1] max-[900px]:[&>p]:!mt-[22px] max-[900px]:[&>p]:w-auto max-[900px]:[&>p]:leading-normal">
            <div>
              <p className="fn-eyebrow">DO TEXTO À DECISÃO</p>
              <h2>
                <Copy
                  desktop="Uma leitura em duas etapas, com rastreabilidade do começo ao fim."
                  mobile="Uma leitura em duas etapas, com rastreabilidade."
                />
              </h2>
            </div>
            <p>
              O pedido entra numa fila, processa em segundo plano e continua mesmo se você fechar a
              página.
            </p>
          </div>
          <div className="an-grid grid grid-cols-3 gap-[14px] max-[900px]:grid-cols-1 max-[900px]:gap-[22px]">
            {steps.map(({ icon: Icon, title, body, mobile, tag }, index) => (
              <article
                className="an-step rounded-2xl bg-[#e6f1ef] p-6 [&:nth-child(2)]:bg-[#08282d] [&:nth-child(2)]:text-[#f2faf9] [&_h3]:!mt-4 [&_h3]:text-2xl [&_h3]:font-[650] [&_p]:!mt-4 [&_p]:text-sm [&_p]:leading-normal [&_p]:text-[#526c6c] [&:nth-child(2)_p]:text-[#a9bebc] [&:nth-child(2)_.an-step-top]:text-[#35d0c3] max-[900px]:[&:nth-child(2)_.an-step-top]:bg-[#103d42] [&_small]:mt-4 [&_small]:block [&_small]:font-[Geist_Mono,monospace] [&_small]:text-[9px] [&_small]:font-bold [&_small]:tracking-[.07em] [&_small]:text-[#087e75] [&:nth-child(2)_small]:text-[#35d0c3] max-[900px]:flex max-[900px]:items-start max-[900px]:gap-[14px] max-[900px]:rounded-[14px] max-[900px]:p-4 max-[900px]:[&_h3]:!mt-0 max-[900px]:[&_h3]:text-lg max-[900px]:[&_p]:!mt-1 max-[900px]:[&_p]:text-xs max-[900px]:[&_p]:leading-[1.4] max-[900px]:[&_small]:hidden"
                key={title}
              >
                <div className="an-step-top flex items-center justify-between text-[26px] text-[#087e75] [&_span]:font-[Geist_Mono,monospace] [&_span]:text-[11px] [&_span]:font-bold [&_span]:text-[#668080] max-[900px]:grid max-[900px]:h-11 max-[900px]:flex-[0_0_44px] max-[900px]:place-items-center max-[900px]:rounded-[11px] max-[900px]:bg-[#d1e7e3] max-[900px]:text-xl max-[900px]:[&_span]:hidden">
                  <Icon aria-hidden="true" />
                  <span>0{index + 1}</span>
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>
                    <Copy desktop={body} mobile={mobile} />
                  </p>
                  <small>{tag}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section
        className="an-section an-outputs py-[84px] [&_.fn-eyebrow]:font-bold [&_.fn-eyebrow]:tracking-[1px] [&_.co-section-header>p]:text-[#526c6c] max-[900px]:py-[54px] bg-[#03171b] [&_.co-section-header>p]:text-[#a9bebc]"
        id="resultados-da-analise"
      >
        <div className="co-container mx-auto w-[min(calc(100%_-_152px),1288px)] max-[900px]:w-[min(calc(100%_-_40px),700px)]">
          <div className="co-section-header mb-11 flex items-end justify-between gap-[50px] [&_h2]:!mt-[14px] [&_h2]:max-w-[760px] [&>p]:w-[410px] [&>p]:shrink-0 [&>p]:text-[15px] [&>p]:leading-[1.55] max-[900px]:mb-[22px] max-[900px]:block max-[900px]:[&_h2]:!mt-[22px] max-[900px]:[&_h2]:!text-[34px] max-[900px]:[&_h2]:!leading-[1.1] max-[900px]:[&>p]:!mt-[22px] max-[900px]:[&>p]:w-auto max-[900px]:[&>p]:leading-normal">
            <div>
              <p className="fn-eyebrow">O QUE VOLTA PARA VOCÊ</p>
              <h2>
                <Copy
                  desktop="Mais que sentimento: evidência, contexto e prioridade."
                  mobile="Mais que sentimento: evidência e prioridade."
                />
              </h2>
            </div>
            <p>
              <Copy
                desktop="Cada leitura separa volume de impacto e mostra quando a amostra ainda pede cautela."
                mobile="Cada leitura separa volume de impacto e mostra quando a amostra pede cautela."
              />
            </p>
          </div>
          <div className="an-grid grid grid-cols-3 gap-[14px] max-[900px]:grid-cols-1 max-[900px]:gap-[22px]">
            {outputs.map(({ icon: Icon, title, body, mobile, tag }) => (
              <article
                className="an-output rounded-2xl border border-[#1d4449] bg-[#08272c] p-6 [&>svg]:text-[28px] [&>svg]:text-[#35d0c3] [&_h3]:!mt-[17px] [&_h3]:text-[25px] [&_h3]:font-[650] [&_p]:!mt-[17px] [&_p]:min-h-[42px] [&_p]:text-sm [&_p]:leading-normal [&_p]:text-[#a9bebc] [&>div]:mt-[17px] [&>div]:rounded-[10px] [&>div]:bg-[#0d3439] [&>div]:p-[14px] [&>div]:font-[Geist_Mono,monospace] [&>div]:text-[11px] [&>div]:font-bold [&>div]:tracking-[.06em] [&>div]:text-[#68d7cd] max-[900px]:rounded-[14px] max-[900px]:p-[18px] max-[900px]:[&>svg]:text-[22px] max-[900px]:[&_h3]:!mt-[14px] max-[900px]:[&_h3]:text-xl max-[900px]:[&_p]:!mt-3 max-[900px]:[&_p]:min-h-0 max-[900px]:[&_p]:text-[13px] max-[900px]:[&>div]:mt-3 max-[900px]:[&>div]:px-[11px] max-[900px]:[&>div]:py-[9px] max-[900px]:[&>div]:text-[9px]"
                key={title}
              >
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>
                  <Copy desktop={body} mobile={mobile} />
                </p>
                <div>{tag}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section
        className="an-section an-reliability py-[84px] [&_.fn-eyebrow]:font-bold [&_.fn-eyebrow]:tracking-[1px] [&_.co-section-header>p]:text-[#526c6c] max-[900px]:py-[54px] bg-[#f5faf9] py-[76px] text-[#082327] [&_.fn-eyebrow]:!text-[#087e75] [&_h2]:!mt-[15px] [&_h2]:!text-[42px] [&_h2]:!leading-[1.08] [&_h2+p]:!mt-[15px] [&_h2+p]:max-w-[600px] [&_h2+p]:text-[15px] [&_h2+p]:leading-[1.55] [&_h2+p]:text-[#526c6c] max-[900px]:py-[54px] max-[900px]:[&_h2]:!mt-[22px] max-[900px]:[&_h2]:!text-[33px] max-[900px]:[&_h2]:!leading-[1.1] max-[900px]:[&_h2+p]:!mt-[22px] max-[900px]:[&_h2+p]:leading-[1.4]"
        id="precisao"
      >
        <div className="co-container an-reliability-inner mx-auto w-[min(calc(100%_-_152px),1288px)] max-[900px]:w-[min(calc(100%_-_40px),700px)] flex items-center justify-between gap-[60px] [&>div:first-child]:max-w-[650px] max-[900px]:block">
          <div>
            <p className="fn-eyebrow">LEITURA HONESTA</p>
            <h2>
              <Copy
                desktop="A interface também mostra o quanto dá para confiar."
                mobile="A interface mostra o quanto dá para confiar."
              />
            </h2>
            <p>
              <Copy
                desktop="Precisão alta, média ou baixa combina tamanho da amostra e faixa provável. Com menos de 10 respostas, a leitura sempre pede cautela."
                mobile="Precisão combina tamanho da amostra e faixa provável. Com menos de 10 respostas, a leitura sempre pede cautela."
              />
            </p>
          </div>
          <div className="an-precision grid flex-[0_0_430px] gap-2.5 [&>div]:flex [&>div]:items-center [&>div]:justify-between [&>div]:rounded-xl [&>div]:bg-[#ddf4ef] [&>div]:px-[18px] [&>div]:py-[15px] [&>div]:font-[Geist_Mono,monospace] [&>div]:text-[11px] [&>div]:font-bold [&>div]:text-[#087e75] [&>div:nth-child(2)]:bg-[#fff0d6] [&>div:nth-child(2)]:text-[#9a6400] [&>div:nth-child(3)]:bg-[#fbe2dc] [&>div:nth-child(3)]:text-[#a74635] [&_svg]:text-base max-[900px]:mt-[22px] max-[900px]:gap-[22px] max-[900px]:[&>div]:px-4 max-[900px]:[&>div]:py-[14px] max-[900px]:[&>div]:text-[10px]">
            {['ALTA', 'MÉDIA', 'BAIXA'].map((level) => (
              <div key={level}>
                PRECISÃO {level}
                <LuInfo aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        className="co-final bg-[#ddeeeb] py-[70px] text-center text-[#082327] [&_.fn-eyebrow]:font-bold [&_.fn-eyebrow]:tracking-[1px] [&_.fn-eyebrow]:!text-[#087e75] [&_h2]:mx-auto [&_h2]:!my-[22px] [&_h2]:max-w-[900px] [&_p:not(.fn-eyebrow)]:text-base [&_p:not(.fn-eyebrow)]:text-[#526c6c] [&_.co-button]:mt-[22px] [&_.co-button]:text-[#f2faf9] [&_.co-button_svg]:text-[#35d0c3] max-[900px]:py-14 max-[900px]:[&_h2]:!my-5 max-[900px]:[&_h2]:!text-[34px] max-[900px]:[&_h2]:!leading-[1.1] max-[900px]:[&_p:not(.fn-eyebrow)]:text-[15px] max-[900px]:[&_.co-button]:mt-5 max-[900px]:[&_.co-button]:min-h-[52px] max-[900px]:[&_.co-button]:w-full"
        id="da-voz-a-acao"
      >
        <div className="co-container mx-auto w-[min(calc(100%_-_152px),1288px)] max-[900px]:w-[min(calc(100%_-_40px),700px)]">
          <p className="fn-eyebrow">DA VOZ À AÇÃO</p>
          <h2>Pare de procurar padrões no escuro.</h2>
          <p>Deixe a IA organizar os comentários. Mantenha a decisão nas suas mãos.</p>
          <Link
            className="fn-button fn-button-dark co-button inline-flex items-center justify-center gap-2.5 rounded-xl text-sm font-bold"
            to="/register"
          >
            Começar análise <LuArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
      <HomeFooter />
    </div>
  );
}

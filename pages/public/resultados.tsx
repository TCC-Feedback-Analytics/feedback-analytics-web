import ProductSection from 'components/public/product/ProductSection';
import { publicNavigationWidth } from 'components/public/product/layoutClasses';
import { Link } from 'react-router-dom';
import {
  LuArrowRight,
  LuCalendarDays,
  LuCalendarRange,
  LuChartColumnIncreasing,
  LuCircleCheck,
  LuGitCompareArrows,
  LuLayers,
  LuMessageSquareText,
  LuSparkles,
  LuStar,
  LuTrendingUp,
  LuTriangleAlert,
} from 'react-icons/lu';
import HomeFooter from 'components/public/home/HomeFooter';
import ProductNavigation from 'components/public/product/ProductNavigation';

const container = 'mx-auto w-[min(calc(100%_-_152px),1288px)] max-[900px]:w-[calc(100%_-_40px)]';
const eyebrow =
  'font-[Geist_Mono,monospace] text-[11px] font-bold tracking-[1px] max-[900px]:text-[10px]';
const title =
  '!mt-[14px] max-w-[760px] !text-[44px] !leading-[1.1] !font-[650] max-[900px]:!mt-[22px] max-[900px]:!text-[34px]';
const grid = 'grid grid-cols-3 gap-[14px] max-[900px]:grid-cols-1 max-[900px]:gap-[22px]';
const body = 'text-[15px] leading-[1.55]';

const lenses = [
  {
    icon: LuStar,
    tag: 'O QUE MARCARAM',
    title: 'Avaliação por estrelas',
    description: 'Média, positivas, críticas, distribuição e precisão da amostra.',
    mobile: 'Média, positivas, críticas e precisão.',
    stat: '4,2 /5 · BOA',
  },
  {
    icon: LuMessageSquareText,
    tag: 'O QUE ESCREVERAM',
    title: 'Análise dos comentários',
    description: 'Tom, assuntos, resumo e recomendações geradas pela IA.',
    mobile: 'Tom, assuntos, resumo e recomendações.',
    stat: '+45 · POSITIVO',
  },
  {
    icon: LuChartColumnIncreasing,
    tag: 'QUANDO E COMO VOLTAM',
    title: 'Movimento e recorrência',
    description: 'Volume no tempo, dias e horários de pico e clientes que voltam.',
    mobile: 'Volume, horários de pico e recorrência.',
    stat: '↑ 18% EM 30 DIAS',
  },
];

const contexts = [
  {
    icon: LuLayers,
    title: 'Escopo',
    description:
      'Avaliação geral, todos os itens de um tipo ou um produto, serviço ou departamento específico.',
    mobile: 'Empresa, tipo ou item específico.',
    tag: 'PRODUTO · PIZZA',
  },
  {
    icon: LuCalendarRange,
    title: 'Período',
    description: 'Todo o histórico, janelas móveis ou datas personalizadas no fuso do gestor.',
    mobile: 'Histórico, janelas ou datas próprias.',
    tag: 'ÚLTIMOS 30 DIAS',
  },
  {
    icon: LuGitCompareArrows,
    title: 'Comparação',
    description:
      'Período anterior de mesmo tamanho ou dois itens do mesmo tipo, com diferença incerta quando necessário.',
    mobile: 'Período anterior ou dois itens.',
    tag: 'A × B · MESMO PERÍODO',
    mobileTag: 'A × B',
  },
];

const precision = [
  { level: 'ALTA', description: 'Amostra sólida e faixa estreita.', color: 'bg-[#ddf4ef]' },
  { level: 'MÉDIA', description: 'Boa direção, ainda com margem.', color: 'bg-[#fff0d6]' },
  { level: 'BAIXA', description: 'Poucas respostas ou alta variação.', color: 'bg-[#fbe2dc]' },
];

function ResponsiveCopy({ desktop, mobile }: { desktop: string; mobile: string }) {
  return (
    <>
      <span className="max-[900px]:hidden">{desktop}</span>
      <span className="hidden max-[900px]:inline">{mobile}</span>
    </>
  );
}

function SectionHeader({
  label,
  heading,
  mobileHeading,
  description,
  mobileDescription,
  dark = false,
}: {
  label: string;
  heading: string;
  mobileHeading?: string;
  description: string;
  mobileDescription?: string;
  dark?: boolean;
}) {
  return (
    <div className="mb-11 flex items-end justify-between gap-12 max-[900px]:mb-[22px] max-[900px]:block">
      <div>
        <p className={`${eyebrow} ${dark ? 'text-[#35d0c3]' : 'text-[#087e75]'}`}>{label}</p>
        <h2 className={title}>
          <ResponsiveCopy desktop={heading} mobile={mobileHeading ?? heading} />
        </h2>
      </div>
      <p
        className={`${body} w-[390px] shrink-0 ${dark ? 'text-[#a9bebc]' : 'text-[#526c6c]'} max-[900px]:!mt-[22px] max-[900px]:w-auto`}
      >
        <ResponsiveCopy desktop={description} mobile={mobileDescription ?? description} />
      </p>
    </div>
  );
}

function DashboardPreview() {
  const metrics = [
    {
      label: 'MÉDIA',
      value: '4,2',
      desktopSuffix: ' /5',
      detail: 'Boa · 128 avaliações',
      mobile: '/5 · Boa',
      color: 'bg-[#08282d] text-[#f2faf9]',
    },
    {
      label: 'POSITIVAS',
      value: '64%',
      detail: '82 avaliações',
      mobile: 'avaliações',
      color: 'bg-[#ddf4ef] text-[#082327]',
    },
    {
      label: 'CRÍTICAS',
      value: '8%',
      detail: '10 avaliações',
      mobile: 'avaliações',
      color: 'bg-[#fbe2dc] text-[#082327]',
    },
  ];
  const bars = [32, 54, 46, 72, 60, 88, 78, 98, 82, 108];

  return (
    <div
      data-product-reveal
      className="w-full max-w-[520px] rounded-[20px] bg-[#f3faf9] p-5 text-[#082327] shadow-[0_22px_44px_#0006] max-[900px]:mt-[110px] max-[900px]:rounded-[15px] max-[900px]:p-[15px]"
      aria-label="Exemplo ilustrativo de um painel de avaliações"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="!text-lg !font-[650] !tracking-normal max-[900px]:!text-base">
            Avaliação por estrelas
          </h2>
          <p className="!mt-1 text-[10px] font-semibold text-[#668080] max-[900px]:text-[9px]">
            <ResponsiveCopy
              desktop="Avaliação geral · Últimos 30 dias"
              mobile="Geral · Últimos 30 dias"
            />
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-lg bg-[#e6f1ef] px-[9px] py-[7px] font-[Geist_Mono,monospace] text-[9px] font-bold text-[#087e75] max-[900px]:bg-transparent max-[900px]:p-0 max-[900px]:text-[8px]">
          <LuCalendarDays className="text-[13px] max-[900px]:hidden" aria-hidden="true" /> 30 DIAS
        </span>
      </div>
      <div className="mt-[14px] grid grid-cols-3 gap-2.5 max-[900px]:mt-2.5 max-[900px]:gap-[7px]">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`${metric.color} min-w-0 rounded-xl p-[13px] max-[900px]:rounded-[10px] max-[900px]:p-2.5`}
          >
            <p className="font-[Geist_Mono,monospace] text-[8px] font-bold tracking-[.05em] opacity-70 max-[900px]:text-[7px]">
              {metric.label}
            </p>
            <p className="!mt-[7px] font-['Space_Grotesk'] text-2xl leading-tight font-[650] max-[900px]:!mt-1 max-[900px]:text-[22px]">
              {metric.value}
              <span className="max-[900px]:hidden">{metric.desktopSuffix}</span>
            </p>
            <p className="!mt-[7px] text-[9px] opacity-70 max-[900px]:!mt-1 max-[900px]:text-[8px]">
              <ResponsiveCopy desktop={metric.detail} mobile={metric.mobile} />
            </p>
          </div>
        ))}
      </div>
      <h3 className="!mt-[14px] text-sm font-[650] max-[900px]:hidden">Movimento das avaliações</h3>
      <div
        className="mt-[14px] flex h-[120px] items-end gap-[11px] overflow-hidden rounded-xl bg-[#eaf3f1] px-4 pt-4 pb-3 max-[900px]:mt-2.5 max-[900px]:h-[70px] max-[900px]:gap-[7px] max-[900px]:rounded-[9px] max-[900px]:px-2.5 max-[900px]:pt-2.5 max-[900px]:pb-2"
        aria-hidden="true"
      >
        {bars.map((height, index) => (
          <span
            key={index}
            className="w-full rounded-t bg-[#087e75]"
            style={{ height: `${(height / 108) * 100}%`, opacity: 0.5 + index * 0.05 }}
          />
        ))}
      </div>
      <div className="mt-[14px] flex justify-between text-[10px] font-semibold text-[#087e75] max-[900px]:hidden">
        <span className="font-[Geist_Mono,monospace] text-[9px]">PRECISÃO ALTA</span>
        <span>↑ 0,3 vs. período anterior</span>
      </div>
    </div>
  );
}

function DiagnosisNote() {
  const items = [
    {
      icon: LuCircleCheck,
      desktop: 'Ponto forte · Qualidade percebida',
      mobile: 'Ponto forte · Qualidade',
    },
    {
      icon: LuTriangleAlert,
      desktop: 'Atenção · Tempo de espera à noite',
      mobile: 'Atenção · Espera à noite',
    },
    {
      icon: LuTrendingUp,
      desktop: 'Mudança · +12% de avaliações positivas',
      mobile: 'Mudança · +12% positivas',
    },
  ];

  return (
    <div className="w-full max-w-[470px] rounded-[18px] bg-[#e6f1ef] p-[22px] max-[900px]:mt-[22px] max-[900px]:p-[17px]">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xl font-[650] max-[900px]:text-lg">Diagnóstico atualizado</h3>
        <LuSparkles className="text-[21px] text-[#087e75]" aria-hidden="true" />
      </div>
      <div className="mt-4 grid gap-4 max-[900px]:mt-3 max-[900px]:gap-2.5">
        {items.map(({ icon: Icon, desktop, mobile }) => (
          <div
      data-product-reveal
            key={desktop}
            className="flex items-center gap-2.5 rounded-[10px] bg-[#f7fbfa] px-[13px] py-3 text-xs font-semibold text-[#284749] max-[900px]:text-[11px]"
          >
            <Icon className="shrink-0 text-base text-[#087e75]" aria-hidden="true" />
            <ResponsiveCopy desktop={desktop} mobile={mobile} />
          </div>
        ))}
      </div>
      <p className="!mt-4 text-[11px] text-[#668080] max-[900px]:hidden">
        Cada recomendação inclui a evidência usada.
      </p>
    </div>
  );
}

export default function Resultados() {
  return (
    <div className="field-notes">
      <ProductSection hero id="resultados-hero" className="bg-[#03171b]">
        <div className="mx-auto w-[min(calc(100%_-_128px),1312px)] pt-7 pb-[62px] max-[900px]:w-[calc(100%_-_32px)] max-[900px]:pt-[18px] max-[900px]:pb-[35px]">
          <div className={publicNavigationWidth}>
            <ProductNavigation />
          </div>
          <div className="flex min-h-[518px] items-center justify-between gap-12 pt-[68px] max-[900px]:block max-[900px]:min-h-0 max-[900px]:px-1.5 max-[900px]:pt-[46px]">
            <div className="max-w-[625px]">
              <p className={`${eyebrow} text-[#35d0c3]`}>
                <ResponsiveCopy
                  desktop="RESULTADOS QUE EXPLICAM O QUE MUDOU"
                  mobile="RESULTADOS COM CONTEXTO"
                />
              </p>
              <h1 className="!my-[22px] text-[clamp(42px,3.9vw,56px)] leading-[1.06] font-[650] tracking-[-1px] max-[900px]:!my-[17px] max-[900px]:text-[42px] max-[360px]:text-[37px]">
                Veja o sinal. Entenda o contexto. Decida o próximo passo.
              </h1>
              <p className="max-w-[560px] text-lg leading-[1.55] text-[#b3c7c5] max-[900px]:text-[15px] max-[900px]:leading-normal">
                <ResponsiveCopy
                  desktop="Métricas por escopo, período e canal mostram onde a experiência melhora — e onde a operação precisa agir primeiro."
                  mobile="Métricas por escopo, período e canal mostram onde a experiência melhora — e onde agir primeiro."
                />
              </p>
              <a
                href="#tres-lentes"
                className="fn-button fn-button-accent !mt-[22px] inline-flex items-center justify-center gap-2.5 rounded-xl text-sm font-bold !text-[#042327] max-[900px]:!mt-[17px] max-[900px]:min-h-[52px] max-[900px]:w-full"
              >
                Ver como funciona <LuArrowRight aria-hidden="true" />
              </a>
            </div>
            <DashboardPreview />
          </div>
        </div>
      </ProductSection>

      <ProductSection
        aria-label="Princípios dos resultados"
        className="bg-[#08282d] py-9 max-[900px]:bg-[#061d22] max-[900px]:py-[34px]"
      >
        <div
          className={`${container} flex items-center justify-between gap-6 max-[900px]:grid max-[900px]:gap-5`}
        >
          <p className={`${eyebrow} text-[#35d0c3]`}>NÚMERO SEM CONTEXTO É SÓ UM NÚMERO.</p>
          {['Escolha o escopo', 'Recorte o período', 'Compare com honestidade'].map(
            (item, index) => (
              <div
                key={item}
                className="flex items-center gap-2.5 text-[13px] font-semibold max-[900px]:gap-[13px] max-[900px]:text-sm"
              >
                <span className="font-[Geist_Mono,monospace] text-[11px] font-bold text-[#4f7776] max-[900px]:grid max-[900px]:h-[42px] max-[900px]:w-[42px] max-[900px]:place-items-center max-[900px]:rounded-[11px] max-[900px]:bg-[#0d3035] max-[900px]:text-[#35d0c3]">
                  0{index + 1}
                </span>
                {item}
              </div>
            ),
          )}
        </div>
      </ProductSection>

      <ProductSection
        id="tres-lentes"
        className="bg-[#f5faf9] py-[84px] text-[#082327] max-[900px]:py-[54px]"
      >
        <div className={container}>
          <SectionHeader
            label="TRÊS LENTES, UMA EXPERIÊNCIA"
            heading="O que marcaram, o que escreveram e quando aconteceu."
            mobileHeading="O que marcaram, escreveram e quando aconteceu."
            description="Cada seção responde uma pergunta diferente, sem confundir estrelas com sentimento da IA."
            mobileDescription="Cada seção responde uma pergunta diferente, sem confundir estrelas com sentimento."
          />
          <div className={grid}>
            {lenses.map(({ icon: Icon, tag, title: name, description, mobile, stat }, index) => (
              <article
                key={name}
                className={`rounded-2xl p-6 max-[900px]:flex max-[900px]:items-center max-[900px]:gap-[14px] max-[900px]:rounded-[14px] max-[900px]:p-4 ${index === 0 ? 'bg-[#08282d] text-[#f2faf9]' : 'bg-[#e6f1ef] text-[#082327]'}`}
              >
                <div
                  className={`text-[28px] max-[900px]:grid max-[900px]:h-12 max-[900px]:w-12 max-[900px]:shrink-0 max-[900px]:place-items-center max-[900px]:rounded-xl max-[900px]:text-[22px] ${index === 0 ? 'text-[#35d0c3] max-[900px]:bg-[#103d42]' : 'text-[#087e75] max-[900px]:bg-[#d1e7e3]'}`}
                >
                  <Icon aria-hidden="true" />
                </div>
                <div>
                  <p className="!mt-4 font-[Geist_Mono,monospace] text-[9px] font-bold tracking-[.07em] text-[#668080] max-[900px]:!mt-0 max-[900px]:text-[8px]">
                    {tag}
                  </p>
                  <h3 className="!mt-4 text-[25px] font-[650] max-[900px]:!mt-1 max-[900px]:text-lg">
                    {name}
                  </h3>
                  <p
                    className={`!mt-4 text-sm leading-normal max-[900px]:!mt-1 max-[900px]:text-xs max-[900px]:leading-[1.4] ${index === 0 ? 'text-[#a9bebc]' : 'text-[#526c6c]'}`}
                  >
                    <ResponsiveCopy desktop={description} mobile={mobile} />
                  </p>
                  <p
                    className={`!mt-4 font-[Geist_Mono,monospace] text-xs font-bold max-[900px]:hidden ${index === 0 ? 'text-[#35d0c3]' : 'text-[#087e75]'}`}
                  >
                    {stat}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </ProductSection>

      <ProductSection id="contexto" className="bg-[#03171b] py-[82px] max-[900px]:py-[54px]">
        <div className={container}>
          <SectionHeader
            dark
            label="RECORTE CERTO, LEITURA CERTA"
            heading="Compare sem perder o contexto que deu origem ao dado."
            mobileHeading="Compare sem perder o contexto do dado."
            description="O mesmo Dashboard muda com o escopo, período e comparação selecionados no cabeçalho."
            mobileDescription="O mesmo Dashboard muda com o escopo, período e comparação selecionados."
          />
          <div className={grid}>
            {contexts.map(({ icon: Icon, title: name, description, mobile, tag, mobileTag }) => (
              <article
                key={name}
                className="rounded-2xl border border-[#1d4449] bg-[#08272c] p-6 max-[900px]:rounded-[14px] max-[900px]:p-[17px]"
              >
                <Icon
                  className="text-[27px] text-[#35d0c3] max-[900px]:text-[20px]"
                  aria-hidden="true"
                />
                <h3 className="!mt-4 text-[25px] font-[650] max-[900px]:!mt-3 max-[900px]:text-xl">
                  {name}
                </h3>
                <p className="!mt-4 min-h-[42px] text-sm leading-normal text-[#a9bebc] max-[900px]:!mt-3 max-[900px]:min-h-0 max-[900px]:text-[13px]">
                  <ResponsiveCopy desktop={description} mobile={mobile} />
                </p>
                <span className="mt-4 inline-block rounded-lg bg-[#0d3439] px-[11px] py-[9px] font-[Geist_Mono,monospace] text-[10px] font-bold tracking-[.06em] text-[#68d7cd] max-[900px]:mt-3 max-[900px]:text-[9px]">
                  <ResponsiveCopy desktop={tag} mobile={mobileTag ?? tag} />
                </span>
              </article>
            ))}
          </div>
        </div>
      </ProductSection>

      <ProductSection id="diagnostico" className="bg-[#f5faf9] py-20 text-[#082327] max-[900px]:py-[54px]">
        <div className={`${container} flex items-center justify-between gap-16 max-[900px]:block`}>
          <div className="max-w-[640px]">
            <p className={`${eyebrow} text-[#087e75]`}>DIAGNÓSTICO DO ESCOPO ✦ IA</p>
            <h2 className={`${title} !text-[42px] max-[900px]:!text-[33px]`}>
              <ResponsiveCopy
                desktop="Quando os números contam uma história, a IA ajuda a conectá-la."
                mobile="A IA conecta a história por trás dos números."
              />
            </h2>
            <p
              className={`${body} !mt-4 max-w-[600px] text-[#526c6c] max-[900px]:!mt-[22px] max-[900px]:leading-[1.4]`}
            >
              <ResponsiveCopy
                desktop="O diagnóstico reúne estrelas, perguntas, canais, horários, recorrência e comentários do período. Ele devolve o que vai bem, o que preocupa, o que mudou e de 3 a 5 recomendações com evidências."
                mobile="Estrelas, perguntas, canais, horários e comentários viram pontos fortes, alertas e recomendações com evidências."
              />
            </p>
          </div>
          <DiagnosisNote />
        </div>
      </ProductSection>

      <ProductSection
        id="precisao-resultados"
        className="bg-[#ddeeeb] py-[72px] text-[#082327] max-[900px]:py-[50px]"
      >
        <div className={container}>
          <div className="max-[900px]:[&>div>p]:hidden">
            <SectionHeader
              label="SEM FALSA CERTEZA"
              heading="Confiança também faz parte do resultado."
              description="Faixa provável e tamanho da amostra viram um indicador simples: precisão alta, média ou baixa."
            />
          </div>
          <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-1 max-[900px]:gap-5">
            {precision.map(({ level, description, color }) => (
              <article
                key={level}
                className={`${color} rounded-[14px] p-[18px] max-[900px]:p-[15px]`}
              >
                <h3 className="font-[Geist_Mono,monospace] text-[10px] font-bold tracking-[.06em] text-[#284749]">
                  PRECISÃO {level}
                </h3>
                <p className="!mt-2 text-[13px] font-semibold text-[#526c6c] max-[900px]:!mt-1 max-[900px]:text-xs">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </ProductSection>

      <ProductSection className="bg-[#f5faf9] py-[70px] text-center text-[#082327] max-[900px]:py-14">
        <div className={container}>
          <p className={`${eyebrow} text-[#087e75]`}>CLAREZA PARA A PRÓXIMA DECISÃO</p>
          <h2 className="!mx-auto !my-[22px] max-w-[900px] !text-[44px] !leading-[1.12] !font-[650] max-[900px]:!my-5 max-[900px]:!text-[34px]">
            Descubra o que merece atenção agora.
          </h2>
          <p className="text-base text-[#526c6c] max-[900px]:text-[15px]">
            Comece a coletar hoje e acompanhe a experiência com contexto.
          </p>
          <Link
            className="fn-button fn-button-dark !mt-[22px] inline-flex items-center justify-center gap-2.5 rounded-xl text-sm font-bold !text-[#f2faf9] max-[900px]:!mt-5 max-[900px]:min-h-[52px] max-[900px]:w-full"
            to="/register"
          >
            Criar minha conta <LuArrowRight className="text-[#35d0c3]" aria-hidden="true" />
          </Link>
        </div>
      </ProductSection>
      <HomeFooter />
    </div>
  );
}

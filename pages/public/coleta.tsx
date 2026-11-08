import ProductSection from 'components/public/product/ProductSection';
import { publicNavigationWidth, productContainer } from 'components/public/product/layoutClasses';
import { Link } from 'react-router-dom';
import {
  LuArrowRight,
  LuBuilding2,
  LuFlaskConical,
  LuHandPlatter,
  LuLink2,
  LuNfc,
  LuPackage,
  LuQrCode,
  LuShieldCheck,
  LuToggleRight,
  LuUsers,
} from 'react-icons/lu';
import ProductNavigation from 'components/public/product/ProductNavigation';
import HomeFooter from 'components/public/home/HomeFooter';

const channels = [
  {
    title: 'QR Code',
    icon: LuQrCode,
    body: 'Baixe em PNG, imprima e leve a pesquisa ao balcão, mesa, embalagem ou recibo.',
    mobile: 'Baixe em PNG e leve a pesquisa ao balcão, mesa ou recibo.',
    tag: 'APONTAR A CÂMERA',
  },
  {
    title: 'Link',
    icon: LuLink2,
    body: 'Compartilhe por mensagem, e-mail ou redes sociais — com um clique, sem digitação.',
    mobile: 'Compartilhe por mensagem, e-mail ou redes sociais.',
    tag: 'ABRIR E RESPONDER',
  },
  {
    title: 'Etiqueta NFC',
    icon: LuNfc,
    body: 'Um toque aproxima o celular da experiência. Ideal para pontos físicos recorrentes.',
    mobile: 'Um toque aproxima o celular da experiência.',
    tag: 'ENCOSTAR O CELULAR',
  },
];
const scopes = [
  { title: 'Empresa', icon: LuBuilding2, example: 'Como foi sua visita?' },
  {
    title: 'Produto',
    icon: LuPackage,
    example: 'Como foi o hambúrguer artesanal?',
    mobile: 'Como foi o produto?',
  },
  { title: 'Serviço', icon: LuHandPlatter, example: 'Como foi a entrega?' },
  { title: 'Departamento', icon: LuUsers, example: 'Como foi o atendimento?' },
];
const trust = [
  {
    title: 'Anti-spam por dispositivo',
    icon: LuShieldCheck,
    body: 'Uma resposta por aparelho, ponto de coleta e dia protege a leitura sem exigir login.',
    mobile: 'Uma resposta por aparelho, escopo e dia.',
  },
  {
    title: 'Pausa instantânea',
    icon: LuToggleRight,
    body: 'Desative um escopo e todos os seus canais param de receber respostas.',
    mobile: 'Todos os canais param juntos.',
  },
  {
    title: 'Teste sem contaminar',
    icon: LuFlaskConical,
    body: 'Respostas de teste ficam visíveis, mas fora das métricas e da análise da IA.',
    mobile: 'Testes ficam fora das métricas e da IA.',
  },
];
function ResponsiveCopy({ desktop, mobile }: { desktop: string; mobile?: string }) {
  return (
    <>
      <span className="co-desktop-copy max-[900px]:hidden">{desktop}</span>
      <span className="co-mobile-copy hidden max-[900px]:inline">{mobile ?? desktop}</span>
    </>
  );
}
function Artifact() {
  return (
    <div
      data-product-reveal
      className="co-artifact flex-[0_0_430px] rounded-[20px] bg-[#f3faf9] p-[22px] text-[#082327] shadow-[0_22px_40px_#0005] [&_i]:h-[7px] [&_i]:w-[7px] [&_i]:rounded-full [&_i]:bg-[#16a394] max-[900px]:mt-[60px] max-[900px]:flex max-[900px]:items-center max-[900px]:gap-[14px] max-[900px]:rounded-[15px] max-[900px]:p-[15px]"
      aria-label="Exemplo de coleta ativa por QR Code, link e NFC"
    >
      <div className="co-artifact-header mb-4 flex items-center justify-between font-[Geist_Mono,monospace] text-[10px] font-bold tracking-[.08em] text-[#087e75] max-[900px]:hidden [&_b]:inline-flex [&_b]:items-center [&_b]:gap-1.5 [&_b]:rounded-full [&_b]:bg-[#ddf4ef] [&_b]:px-[9px] [&_b]:py-1.5 [&_b]:text-[9px] [&_b]:tracking-normal">
        <span>AVALIAÇÃO DA EMPRESA</span>
        <b>
          <i /> COLETA ATIVA
        </b>
      </div>
      <div className="co-artifact-qr grid h-[190px] place-items-center rounded-[14px] bg-[#e6f1ef] [&_svg]:h-32 [&_svg]:w-32 max-[900px]:h-32 max-[900px]:flex-[0_0_128px] max-[900px]:rounded-xl max-[900px]:[&_svg]:h-[88px] max-[900px]:[&_svg]:w-[88px] max-[360px]:h-[110px] max-[360px]:basis-[100px]">
        <LuQrCode aria-hidden="true" />
      </div>
      <div className="co-artifact-copy [&_h2]:!my-4 [&_h2]:!text-[22px] [&_h2]:tracking-normal [&_small]:hidden max-[900px]:[&_h2]:!my-[9px] max-[900px]:[&_h2]:!text-xl max-[900px]:[&_h2]:!leading-[1.12] max-[900px]:[&_small]:block max-[900px]:[&_small]:font-[Geist_Mono,monospace] max-[900px]:[&_small]:text-[9px] max-[900px]:[&_small]:font-bold max-[900px]:[&_small]:text-[#668080] max-[360px]:[&_h2]:!text-lg">
        <b className="co-mobile-live hidden items-center gap-1.5 rounded-full bg-[#ddf4ef] px-[9px] py-1.5 font-[Geist_Mono,monospace] text-[8px] font-bold text-[#087e75] max-[900px]:inline-flex">
          <i /> COLETA ATIVA
        </b>
        <h2>Uma pergunta. Três caminhos.</h2>
        <div className="co-artifact-channels flex gap-2 max-[900px]:hidden [&_span]:flex [&_span]:flex-1 [&_span]:items-center [&_span]:gap-[7px] [&_span]:rounded-[9px] [&_span]:bg-white [&_span]:px-2.5 [&_span]:py-[9px] [&_span]:text-[11px] [&_span]:font-[650] [&_span]:text-[#284749] [&_svg]:text-sm [&_svg]:text-[#087e75]">
          {channels.map(({ title, icon: Icon }) => (
            <span key={title}>
              <Icon aria-hidden="true" /> {title === 'Etiqueta NFC' ? 'NFC' : title}
            </span>
          ))}
        </div>
        <small>QR Code • Link • NFC</small>
      </div>
    </div>
  );
}
export default function Coleta() {
  return (
    <div className="field-notes coleta-page [--co-body:#526c6c] [--co-pale:#e6f1ef] [--co-teal:#087e75]">
      <ProductSection hero
        className="co-hero bg-[#03171b] [&_h1]:!my-[22px] [&_h1]:text-[clamp(42px,4.05vw,58px)] [&_h1]:leading-[1.06] [&_h1]:tracking-[-1px] [&_h1]:font-[650] max-[900px]:[&_h1]:!my-[17px] max-[900px]:[&_h1]:text-[42px] max-[900px]:[&_h1]:tracking-[-.7px] max-[360px]:[&_h1]:text-[37px]"
        id="coleta-hero"
      >
        <div className="co-hero-inner mx-auto w-[min(calc(100%_-_128px),1312px)] pt-7 pb-16 max-[900px]:w-[calc(100%_-_32px)] max-[900px]:pt-[18px] max-[900px]:pb-[68px]">
          <div className={publicNavigationWidth}>
            <ProductNavigation />
          </div>
          <div className="co-hero-content flex min-h-[498px] items-center justify-between gap-[50px] pt-[70px] max-[900px]:block max-[900px]:min-h-0 max-[900px]:px-1.5 max-[900px]:pt-[46px]">
            <div className="co-hero-copy max-w-[670px] [&_.fn-eyebrow]:text-xs [&_.fn-eyebrow]:font-bold [&_.fn-eyebrow]:tracking-[.1em] max-[900px]:max-w-none max-[900px]:[&_.fn-eyebrow]:text-[10px]">
              <p className="fn-eyebrow">COLETA DE BAIXO ATRITO</p>
              <h1>Ouça no momento em que a experiência acontece.</h1>
              <p className="co-hero-description max-w-[570px] text-lg leading-[1.55] text-[#b3c7c5] max-[900px]:text-[15px] max-[900px]:leading-normal">
                <ResponsiveCopy
                  desktop="QR Code, link ou etiqueta NFC levam ao mesmo formulário público — sem conta, sem app e com perguntas próprias para cada ponto de contato."
                  mobile="QR Code, link ou NFC levam ao mesmo formulário — sem conta, sem app e com perguntas próprias para cada ponto de contato."
                />
              </p>
              <div className="co-hero-actions mt-[22px] flex items-center gap-3 [&_.co-button]:text-[#042327] [&>span]:text-xs [&>span]:text-[#789392] max-[900px]:mt-[17px] max-[900px]:[&_.co-button]:min-h-[52px] max-[900px]:[&_.co-button]:w-full max-[900px]:[&>span]:hidden">
                <Link
                  className="fn-button fn-button-accent co-button inline-flex items-center justify-center gap-2.5 rounded-xl text-sm font-bold"
                  to="/register"
                >
                  Criar ponto de escuta <LuArrowRight aria-hidden="true" />
                </Link>
                <span>4 meses de teste • configuração rápida</span>
              </div>
            </div>
            <Artifact />
          </div>
        </div>
      </ProductSection>
      <ProductSection
        className="co-principles bg-[#08282d] py-9 max-[900px]:bg-[#061d22] max-[900px]:py-[34px] [&_.fn-eyebrow]:text-xs [&_.fn-eyebrow]:font-bold [&_.fn-eyebrow]:tracking-[1px] max-[900px]:[&_.fn-eyebrow]:text-[10px]"
        aria-label="Princípios da coleta"
      >
        <div className={`co-container co-principles-inner ${productContainer} flex items-center justify-between gap-6 max-[900px]:grid max-[900px]:gap-5`}>
          <p className="fn-eyebrow">UM SCAN. UM TOQUE. UMA RESPOSTA.</p>
          {[
            ['Sem cadastro', 'O cliente entra direto.'],
            ['Sem instalação', 'Tudo funciona no navegador.'],
            ['Contexto preservado', 'Canal e escopo acompanham a resposta.'],
          ].map(([title, body], index) => (
            <div
              className="co-principle flex items-center gap-3 [&>span]:font-[Geist_Mono,monospace] [&>span]:text-xs [&>span]:font-bold [&>span]:text-[#4f7776] [&_strong]:block [&_strong]:text-sm [&_small]:mt-[3px] [&_small]:block [&_small]:text-[11px] [&_small]:text-[#789392] max-[900px]:[&>span]:grid max-[900px]:[&>span]:h-[42px] max-[900px]:[&>span]:w-[42px] max-[900px]:[&>span]:place-items-center max-[900px]:[&>span]:rounded-[11px] max-[900px]:[&>span]:bg-[#0d3035] max-[900px]:[&>span]:text-[11px] max-[900px]:[&>span]:text-[#35d0c3]"
              key={title}
            >
              <span>0{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <small>{body}</small>
              </div>
            </div>
          ))}
        </div>
      </ProductSection>
      <ProductSection
        className="co-section co-channels py-[86px] max-[900px]:py-[54px] [&_.fn-eyebrow]:font-bold [&_.fn-eyebrow]:tracking-[1px] bg-[#f5faf9] text-[#082327] [&_.fn-eyebrow]:!text-[#087e75] [&_.co-section-header>p]:text-[#526c6c]"
        id="canais-de-coleta"
      >
        <div className={`co-container ${productContainer}`}>
          <div className="co-section-header mb-11 flex items-end justify-between gap-[50px] [&_h2]:!mt-[14px] [&_h2]:max-w-[760px] [&>p]:w-[410px] [&>p]:shrink-0 [&>p]:text-[15px] [&>p]:leading-[1.55] max-[900px]:mb-[22px] max-[900px]:block max-[900px]:[&_h2]:!mt-[22px] max-[900px]:[&_h2]:!text-[34px] max-[900px]:[&_h2]:!leading-[1.1] max-[900px]:[&>p]:!mt-[22px] max-[900px]:[&>p]:w-auto max-[900px]:[&>p]:leading-normal">
            <div>
              <p className="fn-eyebrow">CANAIS DE COLETA</p>
              <h2>Esteja onde seu cliente já está.</h2>
            </div>
            <p>
              <ResponsiveCopy
                desktop="Os três canais apontam para o mesmo ponto de coleta. A marca de origem vira contexto no Dashboard — nunca uma etapa extra para quem responde."
                mobile="Os três canais apontam para o mesmo ponto de coleta e aparecem juntos no Dashboard."
              />
            </p>
          </div>
          <div className="co-channel-grid grid grid-cols-3 gap-[14px] max-[900px]:grid-cols-1 max-[900px]:gap-3">
            {channels.map(({ title, icon: Icon, body, mobile, tag }, index) => (
              <article
                className="co-channel relative min-h-[235px] rounded-2xl bg-[#e6f1ef] p-6 first:bg-[#08282d] first:text-[#f2faf9] [&_.co-icon]:text-[25px] [&_.co-icon]:text-[#087e75] first:[&_.co-icon]:text-[#35d0c3] [&_h3]:!mt-[18px] [&_h3]:text-[26px] [&_h3]:font-[650] [&_p]:!mt-[18px] [&_p]:text-sm [&_p]:leading-normal [&_p]:text-[#526c6c] first:[&_p]:text-[#a9bebc] [&_small]:mt-[18px] [&_small]:block [&_small]:font-[Geist_Mono,monospace] [&_small]:text-[10px] [&_small]:font-bold [&_small]:tracking-[.07em] [&_small]:text-[#087e75] first:[&_small]:text-[#35d0c3] max-[900px]:flex max-[900px]:min-h-0 max-[900px]:items-center max-[900px]:gap-[14px] max-[900px]:rounded-[14px] max-[900px]:p-4 max-[900px]:[&_.co-icon]:grid max-[900px]:[&_.co-icon]:h-12 max-[900px]:[&_.co-icon]:w-12 max-[900px]:[&_.co-icon]:flex-[0_0_48px] max-[900px]:[&_.co-icon]:place-items-center max-[900px]:[&_.co-icon]:rounded-xl max-[900px]:[&_.co-icon]:bg-[#d1e7e3] max-[900px]:[&_.co-icon]:text-[22px] max-[900px]:first:[&_.co-icon]:bg-[#103d42] max-[900px]:[&_h3]:!mt-0 max-[900px]:[&_h3]:text-lg max-[900px]:[&_p]:!mt-1 max-[900px]:[&_p]:text-xs max-[900px]:[&_p]:leading-[1.4] max-[900px]:[&_small]:hidden"
                key={title}
              >
                <div className="co-icon">
                  <Icon aria-hidden="true" />
                </div>
                <span className="co-card-number absolute top-6 right-6 font-[Geist_Mono,monospace] text-[11px] font-bold text-[#88a5a2] max-[900px]:hidden">
                  0{index + 1}
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>
                    <ResponsiveCopy desktop={body} mobile={mobile} />
                  </p>
                  <small>{tag}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </ProductSection>
      <ProductSection
        className="co-section co-scopes py-[86px] max-[900px]:py-[54px] [&_.fn-eyebrow]:font-bold [&_.fn-eyebrow]:tracking-[1px] bg-[#03171b] [&_.co-section-header>p]:w-[390px] [&_.co-section-header>p]:text-[#a9bebc] max-[900px]:[&_.co-section-header>p]:w-auto"
        id="formularios-por-escopo"
      >
        <div className={`co-container ${productContainer}`}>
          <div className="co-section-header mb-11 flex items-end justify-between gap-[50px] [&_h2]:!mt-[14px] [&_h2]:max-w-[760px] [&>p]:w-[410px] [&>p]:shrink-0 [&>p]:text-[15px] [&>p]:leading-[1.55] max-[900px]:mb-[22px] max-[900px]:block max-[900px]:[&_h2]:!mt-[22px] max-[900px]:[&_h2]:!text-[34px] max-[900px]:[&_h2]:!leading-[1.1] max-[900px]:[&>p]:!mt-[22px] max-[900px]:[&>p]:w-auto max-[900px]:[&>p]:leading-normal">
            <div>
              <p className="fn-eyebrow">UM FORMULÁRIO POR ESCOPO</p>
              <h2>Pergunte o que faz sentido. Descubra onde agir.</h2>
            </div>
            <p>
              <ResponsiveCopy
                desktop="Empresa, produto, serviço e departamento mantêm perguntas, comentário e métricas próprios."
                mobile="Empresa, produto, serviço e departamento mantêm perguntas e métricas próprias."
              />
            </p>
          </div>
          <div className="co-scope-grid grid grid-cols-4 gap-3 max-[900px]:grid-cols-1">
            {scopes.map(({ title, icon: Icon, example, mobile }) => (
              <article
                className="co-scope rounded-[14px] border border-[#1d4449] bg-[#08272c] p-5 [&_.co-icon]:text-[23px] [&_.co-icon]:text-[#35d0c3] [&_h3]:!mt-[14px] [&_h3]:text-[21px] [&_h3]:font-[650] [&_p]:!mt-[14px] [&_p]:text-[13px] [&_p]:leading-[1.45] [&_p]:text-[#8fa8a6] [&_small]:mt-[18px] [&_small]:block [&_small]:font-[Geist_Mono,monospace] [&_small]:text-[9px] [&_small]:leading-[1.35] [&_small]:font-bold [&_small]:tracking-[.07em] [&_small]:text-[#4f7776] max-[900px]:flex max-[900px]:items-center max-[900px]:gap-[14px] max-[900px]:rounded-[13px] max-[900px]:p-4 max-[900px]:[&_.co-icon]:grid max-[900px]:[&_.co-icon]:h-11 max-[900px]:[&_.co-icon]:w-11 max-[900px]:[&_.co-icon]:flex-[0_0_44px] max-[900px]:[&_.co-icon]:place-items-center max-[900px]:[&_.co-icon]:rounded-[11px] max-[900px]:[&_.co-icon]:bg-[#10363b] max-[900px]:[&_.co-icon]:text-xl max-[900px]:[&_h3]:!mt-0 max-[900px]:[&_h3]:text-[17px] max-[900px]:[&_p]:!mt-1 max-[900px]:[&_p]:text-[11px] max-[900px]:[&_small]:hidden"
                key={title}
              >
                <div className="co-icon">
                  <Icon aria-hidden="true" />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>
                    “<ResponsiveCopy desktop={example} mobile={mobile} />”
                  </p>
                  <small>0–3 PERGUNTAS • COMENTÁRIO CONFIGURÁVEL</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </ProductSection>
      <ProductSection
        className="co-section co-trust py-[86px] max-[900px]:py-[54px] [&_.fn-eyebrow]:font-bold [&_.fn-eyebrow]:tracking-[1px] bg-[#f5faf9] text-[#082327] [&_.fn-eyebrow]:!text-[#087e75] [&>div>h2]:!mt-3 [&>div>h2]:max-w-[900px] [&>div>h2]:!text-[42px] [&_.co-icon]:text-[26px] [&_.co-icon]:text-[#087e75] [&_h3]:!mt-3 [&_h3]:text-xl [&_h3]:font-[650] max-[900px]:[&>div>h2]:!mt-[22px] max-[900px]:[&>div>h2]:!text-[34px] max-[900px]:[&>div>h2]:!leading-[1.1] max-[900px]:[&_.co-icon]:grid max-[900px]:[&_.co-icon]:h-11 max-[900px]:[&_.co-icon]:w-11 max-[900px]:[&_.co-icon]:flex-[0_0_44px] max-[900px]:[&_.co-icon]:place-items-center max-[900px]:[&_.co-icon]:rounded-[11px] max-[900px]:[&_.co-icon]:bg-[#ddeeeb] max-[900px]:[&_.co-icon]:text-xl max-[900px]:[&_h3]:!mt-0 max-[900px]:[&_h3]:text-[17px]"
        id="coleta-confiavel"
      >
        <div className={`co-container ${productContainer}`}>
          <p className="fn-eyebrow">COLETA CONFIÁVEL</p>
          <h2>
            <ResponsiveCopy
              desktop="Menos atrito para o cliente. Mais integridade para o dado."
              mobile="Menos atrito. Mais integridade para o dado."
            />
          </h2>
          <div className="co-trust-grid mt-[34px] grid grid-cols-3 gap-[34px] max-[900px]:mt-[22px] max-[900px]:grid-cols-1 max-[900px]:gap-[22px]">
            {trust.map(({ title, icon: Icon, body, mobile }) => (
              <article
                className="co-trust-item [&_p]:!mt-3 [&_p]:text-sm [&_p]:leading-[1.55] [&_p]:text-[#526c6c] max-[900px]:flex max-[900px]:items-center max-[900px]:gap-[14px] max-[900px]:[&_p]:!mt-1 max-[900px]:[&_p]:text-xs max-[900px]:[&_p]:leading-[1.4]"
                key={title}
              >
                <div className="co-icon">
                  <Icon aria-hidden="true" />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>
                    <ResponsiveCopy desktop={body} mobile={mobile} />
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </ProductSection>
      <ProductSection
        className="co-final bg-[#ddeeeb] py-[70px] text-center text-[#082327] [&_.fn-eyebrow]:font-bold [&_.fn-eyebrow]:tracking-[1px] [&_.fn-eyebrow]:!text-[#087e75] [&_h2]:mx-auto [&_h2]:!my-[22px] [&_h2]:max-w-[900px] [&_p:not(.fn-eyebrow)]:text-base [&_p:not(.fn-eyebrow)]:text-[#526c6c] [&_.co-button]:mt-[22px] [&_.co-button]:text-[#f2faf9] [&_.co-button_svg]:text-[#35d0c3] max-[900px]:py-14 max-[900px]:[&_h2]:!my-5 max-[900px]:[&_h2]:!text-[34px] max-[900px]:[&_h2]:!leading-[1.1] max-[900px]:[&_p:not(.fn-eyebrow)]:text-[15px] max-[900px]:[&_.co-button]:mt-5 max-[900px]:[&_.co-button]:min-h-[52px] max-[900px]:[&_.co-button]:w-full"
        id="proximo-ponto-de-escuta"
      >
        <div className={`co-container ${productContainer}`}>
          <p className="fn-eyebrow">SEU PRÓXIMO PONTO DE ESCUTA</p>
          <h2>
            <ResponsiveCopy
              desktop="Transforme cada ponto de contato em uma chance de aprender."
              mobile="Transforme cada contato em uma chance de aprender."
            />
          </h2>
          <p>Ative QR Code, link e NFC em poucos minutos.</p>
          <Link
            className="fn-button fn-button-dark co-button inline-flex items-center justify-center gap-2.5 rounded-xl text-sm font-bold"
            to="/register"
          >
            Começar coleta <LuArrowRight aria-hidden="true" />
          </Link>
        </div>
      </ProductSection>
      <HomeFooter />
    </div>
  );
}

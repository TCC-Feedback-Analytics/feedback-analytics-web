import { Children, isValidElement } from 'react';
import { Link } from 'react-router-dom';
import { LuChevronDown, LuFileText, LuMail, LuShieldCheck } from 'react-icons/lu';
import HomeFooter from 'components/public/home/HomeFooter';
import ProductNavigation from 'components/public/product/ProductNavigation';
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_UPDATED_AT,
  LEGAL_VERSION,
  PRIVACY_PATH,
  TERMS_PATH,
} from 'src/lib/constants/legal';
import type { LegalPageProps, LegalSectionProps } from './ui.types';

const eyebrow = 'font-[Geist_Mono,monospace] text-[10px] font-bold tracking-[.08em]';

function parseSectionTitle(title: string) {
  const match = title.match(/^(\d+)\.\s*(.+)$/);
  return {
    number: match?.[1] ?? '',
    name: match?.[2] ?? title,
    id: `legal-secao-${match?.[1] ?? title}`,
  };
}

export default function LegalPage({ title, intro, related, children }: LegalPageProps) {
  const isPrivacy = related.to === TERMS_PATH;
  const sections = Children.toArray(children)
    .filter(isValidElement<LegalSectionProps>)
    .map((section) => parseSectionTitle(section.props.title));
  const contentsLabel = isPrivacy ? 'NESTA POLÍTICA' : 'NESTES TERMOS';
  const tabs = [
    {
      to: PRIVACY_PATH,
      label: 'Política de Privacidade',
      mobile: 'Privacidade',
      icon: LuShieldCheck,
    },
    { to: TERMS_PATH, label: 'Termos de Serviço', mobile: 'Termos', icon: LuFileText },
  ];

  return (
    <div className="field-notes">
      <header className="bg-[#03171b]">
        <div className="mx-auto w-[min(calc(100%_-_128px),1312px)] pt-7 pb-[62px] max-[900px]:w-[calc(100%_-_32px)] max-[900px]:pt-[18px] max-[900px]:pb-[54px]">
          <div className="relative left-1/2 w-[min(calc(100vw_-_152px),1288px)] -translate-x-1/2 max-[850px]:w-[calc(100vw_-_40px)] max-[380px]:w-[calc(100vw_-_24px)]">
            <ProductNavigation />
          </div>
          <div className="mt-14 max-[900px]:mt-12 max-[900px]:px-1.5">
            <p className={`${eyebrow} text-[#35d0c3]`}>LEGAL · LGPD</p>
            <p className="!mt-4 max-w-[860px] font-['Space_Grotesk'] text-[56px] leading-[1.1] font-[650] tracking-[-.04em] text-[#f2faf9] max-[900px]:text-[42px] max-[360px]:text-[37px]">
              Termos claros. Privacidade explicada.
            </p>
            <p className="!mt-4 max-w-[720px] text-lg leading-[1.5] text-[#b3c7c5] max-[900px]:text-[15px]">
              <span className="max-[900px]:hidden">
                Entenda como o Feedback Analytics funciona, quais dados são tratados e como exercer
                seus direitos.
              </span>
              <span className="hidden max-[900px]:inline">
                Entenda como o serviço funciona, quais dados são tratados e como exercer seus
                direitos.
              </span>
            </p>
            <nav aria-label="Documentos legais" className="mt-14 flex gap-2.5 max-[900px]:mt-5">
              {tabs.map(({ to, label, mobile, icon: Icon }) => {
                const active = (to === PRIVACY_PATH) === isPrivacy;
                return (
                  <Link
                    key={to}
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    aria-label={label}
                    className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[10px] border px-4 text-[13px] font-bold max-[900px]:flex-1 max-[900px]:px-2 max-[900px]:text-xs ${active ? 'border-[#35d0c3] bg-[#35d0c3] text-[#042327]' : 'border-[#285158] bg-[#0d3035] text-[#d6e3e1]'}`}
                  >
                    <Icon className="text-base" aria-hidden="true" />
                    <span className="max-[900px]:hidden">{label}</span>
                    <span className="hidden max-[900px]:inline">{mobile}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <div className="bg-[#f5faf9] py-[70px] text-[#082327] max-[900px]:py-8">
        <div className="mx-auto grid w-[min(calc(100%_-_152px),1288px)] grid-cols-[280px_minmax(0,1fr)] items-start gap-[54px] max-[900px]:w-[calc(100%_-_32px)] max-[900px]:grid-cols-1 max-[900px]:gap-5">
          <aside
            className="rounded-2xl bg-[#e6f1ef] p-5 max-[900px]:hidden"
            aria-label="Índice do documento"
          >
            <p className={`${eyebrow} text-[#087e75]`}>{contentsLabel}</p>
            <nav className="mt-2 grid gap-1">
              {sections.map(({ id, number, name }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="flex gap-2.5 rounded-lg px-2.5 py-[9px] text-xs font-medium text-[#526c6c] transition-colors hover:bg-[#d1e7e3] hover:text-[#082327] focus-visible:bg-[#d1e7e3] focus-visible:text-[#082327] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087e75]"
                >
                  <span className="font-[Geist_Mono,monospace] text-[9px] font-bold text-[#087e75]">
                    {number.padStart(2, '0')}
                  </span>
                  {name}
                </a>
              ))}
            </nav>
            <div className="mt-2 rounded-xl bg-[#08282d] p-[14px] text-[#f2faf9]">
              <LuMail className="text-lg text-[#35d0c3]" aria-hidden="true" />
              <p className="!mt-2 text-xs font-bold">Dúvidas ou pedidos?</p>
              <a
                className="!mt-2 block break-all text-[10px] text-[#a9bebc]"
                href={`mailto:${LEGAL_CONTACT_EMAIL}`}
              >
                {LEGAL_CONTACT_EMAIL}
              </a>
            </div>
          </aside>

          <details className="group hidden rounded-xl bg-[#e6f1ef] text-[#082327] max-[900px]:block">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
              <span>
                <span className={`${eyebrow} block text-[8px] text-[#087e75]`}>
                  {contentsLabel}
                </span>
                <span className="mt-[3px] block text-xs font-bold">Ir para uma seção</span>
              </span>
              <LuChevronDown
                className="text-lg text-[#668080] transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <nav aria-label="Índice do documento" className="grid gap-1 px-4 pb-4">
              {sections.map(({ id, number, name }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="rounded-lg px-2 py-1.5 text-xs text-[#526c6c] hover:bg-[#d1e7e3] focus-visible:bg-[#d1e7e3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087e75]"
                >
                  {number.padStart(2, '0')} · {name}
                </a>
              ))}
            </nav>
          </details>

          <article className="min-w-0 rounded-[20px] border border-[#d4e5e2] bg-white px-[42px] py-[38px] max-[900px]:rounded-2xl max-[900px]:px-[18px] max-[900px]:py-6">
            <div className="flex items-center justify-between gap-4 max-[900px]:block">
              <h1 className="font-['Space_Grotesk'] text-[34px] leading-[1.1] font-[650] tracking-[-.03em] max-[900px]:text-[29px]">
                {title}
              </h1>
              <p
                className={`${eyebrow} shrink-0 rounded-full bg-[#ddf4ef] px-2.5 py-[7px] text-[#087e75] max-[900px]:!mt-2.5 max-[900px]:bg-transparent max-[900px]:p-0 max-[900px]:text-[9px]`}
              >
                Versão {LEGAL_VERSION}, atualizada em {LEGAL_UPDATED_AT}.
              </p>
            </div>
            <div className="!mt-3 border-b border-[#d4e5e2] pb-[30px] text-[15px] leading-[1.55] text-[#526c6c] max-[900px]:pb-6 max-[900px]:text-[13px] [&_a]:font-semibold [&_a]:text-[#087e75] [&_a]:underline">
              {intro}
            </div>
            <div>{children}</div>
            <div className="mt-[30px] rounded-xl bg-[#e6f1ef] p-4 text-sm text-[#284749] max-[900px]:bg-[#08282d] max-[900px]:text-[#f2faf9]">
              <div className="flex items-start gap-3">
                <LuShieldCheck
                  className="mt-0.5 shrink-0 text-xl text-[#087e75] max-[900px]:text-[#35d0c3]"
                  aria-hidden="true"
                />
                <p>
                  Dúvidas ou pedidos:{' '}
                  <a
                    className="break-all font-semibold text-[#087e75] underline max-[900px]:text-[#68d7cd]"
                    href={`mailto:${LEGAL_CONTACT_EMAIL}`}
                  >
                    {LEGAL_CONTACT_EMAIL}
                  </a>
                </p>
              </div>
              <Link
                to={related.to}
                className="!mt-3 inline-block font-semibold text-[#087e75] underline max-[900px]:text-[#68d7cd]"
              >
                {related.label}
              </Link>
            </div>
          </article>
        </div>
      </div>
      <HomeFooter />
    </div>
  );
}

export function LegalSection({ title, children }: LegalSectionProps) {
  const { id, number, name } = parseSectionTitle(title);
  return (
    <section
      id={id}
      className="group grid scroll-mt-6 grid-cols-[38px_minmax(0,1fr)] gap-x-[18px] border-b border-[#e3ecea] py-[30px] max-[900px]:grid-cols-[34px_minmax(0,1fr)] max-[900px]:gap-x-2.5 max-[900px]:py-6"
    >
      <span
        aria-hidden="true"
        className="grid h-[38px] w-[38px] place-items-center rounded-[10px] bg-[#e6f1ef] font-[Geist_Mono,monospace] text-[10px] font-bold text-[#087e75] transition-colors group-hover:bg-[#08282d] group-hover:text-[#35d0c3] group-focus-within:bg-[#08282d] group-focus-within:text-[#35d0c3] max-[900px]:h-[34px] max-[900px]:w-[34px] max-[900px]:rounded-[9px]"
      >
        {number.padStart(2, '0')}
      </span>
      <h2
        aria-label={title}
        className="self-center !text-[19px] !leading-[1.25] !font-[650] !tracking-normal max-[900px]:!text-lg"
      >
        <span className="sr-only">{number}. </span>
        {name}
      </h2>
      <div className="col-start-2 !mt-2 space-y-3 text-[13px] leading-[1.55] text-[#526c6c] max-[900px]:col-span-2 max-[900px]:col-start-1 max-[900px]:!mt-2.5 max-[900px]:text-xs max-[900px]:leading-normal [&>p+p]:!mt-3 [&>p+ul]:!mt-3 [&>ul+p]:!mt-3 [&_a]:break-all [&_a]:font-semibold [&_a]:text-[#087e75] [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

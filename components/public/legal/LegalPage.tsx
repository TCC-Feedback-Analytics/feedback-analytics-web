import { Link } from 'react-router-dom';
import { LEGAL_CONTACT_EMAIL, LEGAL_UPDATED_AT, LEGAL_VERSION } from 'src/lib/constants/legal';
import type { LegalPageProps, LegalSectionProps } from './ui.types';

/** Moldura da Política de Privacidade e dos Termos: título, data da versão, seções e contato. */
export default function LegalPage({ title, intro, related, children }: LegalPageProps) {
  return (
    <div className="bg-(--bg-primary) px-4 py-10 sm:py-16">
      <article className="mx-auto w-full max-w-3xl rounded-3xl bg-white p-6 shadow-md sm:p-10 dark:bg-linear-to-br dark:from-(--sixth-color) dark:to-(--seventh-color)">
        <header className="mb-8 border-b border-(--quaternary-color)/15 pb-6">
          <h1 className="font-poppins text-2xl font-semibold text-(--text-primary) sm:text-3xl">{title}</h1>
          <p className="font-work-sans mt-2 text-sm text-(--text-tertiary)">
            Versão {LEGAL_VERSION}, atualizada em {LEGAL_UPDATED_AT}.
          </p>
          <div className="font-work-sans mt-4 space-y-3 text-(--text-secondary) [&_a]:font-medium [&_a]:text-(--secondary-color)">{intro}</div>
        </header>

        <div className="space-y-8">{children}</div>

        <footer className="font-work-sans mt-10 flex flex-col gap-3 border-t border-(--quaternary-color)/15 pt-6 text-sm text-(--text-secondary) sm:flex-row sm:items-center sm:justify-between">
          <p>
            Dúvidas ou pedidos:{' '}
            <a
              href={`mailto:${LEGAL_CONTACT_EMAIL}`}
              className="font-medium text-(--secondary-color) hover:opacity-80">
              {LEGAL_CONTACT_EMAIL}
            </a>
          </p>
          <Link
            to={related.to}
            className="font-medium text-(--secondary-color) hover:opacity-80">
            {related.label}
          </Link>
        </footer>
      </article>
    </div>
  );
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section>
      <h2 className="font-poppins mb-3 text-lg font-semibold text-(--text-primary)">{title}</h2>
      <div className="font-work-sans space-y-3 leading-relaxed text-(--text-secondary) [&_a]:font-medium [&_a]:text-(--secondary-color) [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

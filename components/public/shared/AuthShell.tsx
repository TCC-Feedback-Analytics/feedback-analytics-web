import { FaCommentDots, FaShieldHalved } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import type { AuthShellProps } from './ui.types';

export default function AuthShell({
  title,
  description,
  icon,
  children,
  footer,
  wide = false,
  eyebrow = 'ACESSO SEGURO',
}: AuthShellProps) {
  return (
    <div className="login-experience relative isolate min-h-[100dvh] overflow-hidden bg-(--bg-primary) px-4 py-5 font-inter text-(--text-primary) sm:px-6 sm:py-8 lg:flex lg:items-center lg:px-10 lg:py-12">
      <div className="pointer-events-none absolute -left-40 -top-44 h-[28rem] w-[28rem] rounded-full bg-(--primary-color)/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-(--primary-color)/10 blur-3xl" />

      <main className={`relative mx-auto grid w-full items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,0.8fr)] lg:gap-16 ${wide ? 'max-w-7xl' : 'max-w-6xl'}`}>
        <section className="hidden min-h-[31.5rem] flex-col justify-between py-4 lg:flex">
          <div className="space-y-16">
            <Link to="/" className="inline-flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-(--primary-color) text-(--on-primary)">
                <FaCommentDots className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <span className="font-montserrat text-base font-bold tracking-tight">Feedback</span>
            </Link>

            <div className="max-w-md space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-(--primary-color)/25 bg-(--primary-color)/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-(--primary-color)">
                <span className="h-1.5 w-1.5 rounded-full bg-(--primary-color)" />
                FEEDBACK ANALYTICS
              </span>
              <div className="space-y-4">
                <h1 className="max-w-sm font-montserrat text-4xl font-bold leading-[1.08] tracking-[-0.055em] text-(--text-primary)">
                  Ouça melhor.<br />
                  Decida com clareza.
                </h1>
                <p className="max-w-xs text-sm leading-6 text-(--text-tertiary)">
                  Uma experiência simples e segura para cuidar da sua conta.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-(--text-tertiary)">
            <span className="flex -space-x-2" aria-hidden>
              <span className="h-7 w-7 rounded-full border-2 border-(--bg-primary) bg-(--primary-color)" />
              <span className="h-7 w-7 rounded-full border-2 border-(--bg-primary) bg-amber-300" />
              <span className="h-7 w-7 rounded-full border-2 border-(--bg-primary) bg-blue-400" />
            </span>
            <span>+2.400 equipes escutando melhor</span>
          </div>
        </section>

        <section className={`w-full justify-self-center rounded-3xl border border-(--primary-color)/20 bg-(--bg-secondary)/95 p-5 shadow-[0_18px_44px_rgba(0,0,0,0.32)] backdrop-blur sm:p-8 ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
          <Link to="/" className="mb-7 inline-flex items-center gap-2.5 rounded-lg lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-(--primary-color) text-(--on-primary)">
              <FaCommentDots className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="font-montserrat text-base font-bold tracking-tight">Feedback</span>
          </Link>

          <header className="space-y-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary-color)/15 text-(--primary-color)">
              {icon}
            </span>
            <p className="text-[10px] font-bold tracking-[0.12em] text-(--primary-color)">{eyebrow}</p>
            <h2 className="font-montserrat text-2xl font-bold tracking-[-0.03em] text-(--text-primary)">{title}</h2>
            <p className="text-sm leading-relaxed text-(--text-tertiary)">{description}</p>
          </header>

          <div className="mt-6">{children}</div>

          {footer && <footer className="mt-6 border-t border-(--primary-color)/10 pt-5">{footer}</footer>}

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-(--text-tertiary)">
            <FaShieldHalved className="h-3 w-3 shrink-0 text-(--primary-color)/80" aria-hidden />
            Seus dados são protegidos e usados com segurança.
          </p>
        </section>
      </main>
    </div>
  );
}

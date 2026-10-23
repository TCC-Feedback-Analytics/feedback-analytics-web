import FormLogin from 'components/public/forms/formLogin';
import { FaCommentDots, FaLock, FaShieldHalved } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="login-experience grid min-h-[100dvh] overflow-hidden bg-(--bg-primary) font-inter text-(--text-primary) lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.82fr)]">
      <aside className="relative hidden overflow-hidden border-r border-(--primary-color)/15 bg-(--bg-secondary)/35 lg:col-start-1 lg:flex lg:min-h-[100dvh] lg:flex-col lg:px-[clamp(3rem,8vw,9rem)] lg:py-[clamp(3rem,7vh,6rem)]">
        <div className="pointer-events-none absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-(--primary-color)/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-(--secondary-color)/15 blur-3xl" />

        <div className="relative z-10 flex h-full max-w-[34rem] flex-col justify-between">
          <div className="space-y-[clamp(3.5rem,9vh,7rem)]">
            <Link to="/" className="inline-flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-(--primary-color) text-(--on-primary)">
                <FaCommentDots className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <span className="font-montserrat text-[clamp(1rem,1.15vw,1.25rem)] font-bold tracking-tight">Feedback Analytics</span>
            </Link>

            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-(--primary-color)/25 bg-(--primary-color)/10 px-3 py-1.5 text-[clamp(0.625rem,0.7vw,0.75rem)] font-bold tracking-[0.12em] text-(--primary-color)">
                <span className="h-1.5 w-1.5 rounded-full bg-(--primary-color)" />
                FEEDBACK ANALYTICS
              </span>
              <div className="space-y-4">
                <h1 className="max-w-[34rem] font-montserrat text-[clamp(2.25rem,3.35vw,4rem)] font-bold leading-[1.02] tracking-[-0.055em] text-(--text-primary)">
                  Ouça melhor.<br />
                  Decida com clareza.
                </h1>
                <p className="max-w-md text-[clamp(1rem,1.2vw,1.25rem)] leading-[1.7] text-(--text-tertiary)">
                  Transforme cada opinião em decisões mais inteligentes para o seu negócio.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[clamp(0.75rem,0.85vw,0.875rem)] text-(--text-tertiary)">
            <span className="flex -space-x-2" aria-hidden>
              <span className="h-7 w-7 rounded-full border-2 border-(--bg-primary) bg-(--primary-color)" />
              <span className="h-7 w-7 rounded-full border-2 border-(--bg-primary) bg-(--positive)" />
              <span className="h-7 w-7 rounded-full border-2 border-(--bg-primary) bg-(--secondary-color)" />
            </span>
            <span>+2.400 equipes escutando melhor</span>
          </div>
        </div>
      </aside>

      <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-5 sm:px-6 sm:py-8 lg:col-start-2 lg:px-[clamp(2.5rem,6vw,7rem)] lg:py-12">
        <div className="pointer-events-none absolute -right-32 -top-28 h-80 w-80 rounded-full bg-(--primary-color)/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-(--secondary-color)/10 blur-3xl" />

        <div className="relative z-10 w-full max-w-md">
        <section className="w-full max-w-md justify-self-center rounded-3xl border border-(--primary-color)/20 bg-(--bg-secondary)/95 p-5 shadow-[0_18px_44px_rgba(0,0,0,0.32)] backdrop-blur sm:p-8">
          <Link to="/" className="mb-7 inline-flex items-center gap-2.5 rounded-lg lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-(--primary-color) text-(--on-primary)">
              <FaCommentDots className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="font-montserrat text-base font-bold tracking-tight">Feedback Analytics</span>
          </Link>

          <header className="space-y-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary-color)/15 text-(--primary-color)">
              <FaLock className="h-4 w-4" aria-hidden />
            </span>
            <h2 className="font-montserrat text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.03em] text-(--text-primary)">
              Bem-vindo de volta
            </h2>
            <p className="text-[clamp(0.875rem,1.1vw,1rem)] text-(--text-tertiary)">Entre na sua conta para continuar.</p>
          </header>

          <div className="mt-6">
            <FormLogin />
          </div>

          <footer className="mt-6 border-t border-(--primary-color)/10 pt-5 text-center">
            <p className="text-sm text-(--text-tertiary)">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-semibold text-(--primary-color) transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)">
                Cadastre-se
              </Link>
            </p>
            <p className="mt-3 flex w-full items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-(--text-tertiary)">
              <FaShieldHalved className="h-3 w-3 shrink-0 text-(--primary-color)/80" aria-hidden />
              Seus dados são protegidos e usados com segurança.
            </p>
          </footer>
        </section>
        </div>
      </main>
    </div>
  );
}

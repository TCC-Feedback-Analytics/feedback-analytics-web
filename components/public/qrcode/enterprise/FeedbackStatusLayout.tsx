import { FaCommentDots, FaShieldHalved } from 'react-icons/fa6';
import type { FeedbackStatusLayoutProps, FeedbackStatusTone } from './ui.types';

const TONE_STYLES: Record<FeedbackStatusTone, { icon: string; eyebrow: string }> = {
  success: {
    icon: 'border-(--positive)/35 bg-(--positive)/12 text-(--positive)',
    eyebrow: 'text-(--positive)',
  },
  notice: {
    icon: 'border-(--neutral)/35 bg-(--neutral)/12 text-(--neutral)',
    eyebrow: 'text-(--neutral)',
  },
  error: {
    icon: 'border-(--negative)/35 bg-(--negative)/12 text-(--negative)',
    eyebrow: 'text-(--negative)',
  },
};

export default function FeedbackStatusLayout({
  tone,
  eyebrow,
  title,
  description,
  icon,
  children,
}: FeedbackStatusLayoutProps) {
  const styles = TONE_STYLES[tone];

  return (
    <div className="feedback-form-experience flex min-h-[100dvh] bg-(--bg-primary) px-4 py-5 font-work-sans text-(--text-primary) sm:px-6 sm:py-8">
      <main className="mx-auto flex w-full max-w-md flex-col justify-center">
        <header className="mb-10 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-(--primary-color) text-(--on-primary)">
              <FaCommentDots className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="truncate font-montserrat text-[15px] font-bold tracking-tight">Feedback Analytics</span>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--primary-color)/20 bg-(--primary-color)/10 text-(--primary-color)">
            <FaShieldHalved className="h-[18px] w-[18px]" aria-hidden />
            <span className="sr-only">Formulário seguro</span>
          </span>
        </header>

        <section className="rounded-[24px] border border-(--quaternary-color)/16 bg-(--bg-secondary) p-5 shadow-[0_18px_44px_rgba(0,0,0,0.22)] sm:p-7">
          <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border ${styles.icon}`}>
            {icon}
          </div>
          <p className={`mb-2 text-[10px] font-bold tracking-[0.12em] ${styles.eyebrow}`}>{eyebrow}</p>
          <h1 className="font-montserrat text-[26px] font-bold tracking-[-0.035em] text-(--text-primary)">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-(--text-secondary)">{description}</p>
          <div className="mt-6">{children}</div>
        </section>

        <footer className="mt-5 flex items-start gap-2 px-1 text-xs leading-5 text-(--text-tertiary)">
          <FaShieldHalved className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--primary-color)" aria-hidden />
          <p>Suas respostas são protegidas e tratadas com privacidade.</p>
        </footer>
      </main>
    </div>
  );
}

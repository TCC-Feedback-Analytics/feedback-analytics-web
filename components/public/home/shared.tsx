import { Link } from 'react-router-dom';
import type { SectionIntroProps } from './ui.types';

export function Brand() {
  return (
    <Link to="/" className="fn-brand items-center overflow-hidden" aria-label="Feedback Analytics, página inicial">
      <img src="/field-notes/logo-dark.png" alt="Feedback Analytics" />
    </Link>
  );
}

export function SectionIntro({ eyebrow, title, description, dark = false }: SectionIntroProps) {
  return (
    <div className={`fn-section-intro ${dark ? 'fn-section-intro-dark' : ''} justify-between items-end gap-[54px]`}>
      <div>
        <p className="fn-eyebrow font-medium tracking-[.09em]">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <p className="fn-section-description pb-[5px] text-[16px] leading-[1.5]">{description}</p>
    </div>
  );
}

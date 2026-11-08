import { useEffect, useRef } from 'react';

export function useHomeReveal() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!page || reducedMotion || !('IntersectionObserver' in window)) return;

    const selectors = [
      '.fn-section-intro', '.fn-receipt-step', '.fn-blueprint-row',
      '.fn-evidence-copy > .fn-eyebrow', '.fn-evidence-copy > h2',
      '.fn-evidence-description', '.fn-signal-list', '.fn-evidence-action',
      '.fn-evidence-board', '.fn-channel', '.fn-scope',
      '.fn-safeguards article', '.fn-final-inner',
    ];
    const elements = page.querySelectorAll<HTMLElement>(selectors.join(', '));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fn-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

    elements.forEach((element) => {
      element.classList.add('fn-reveal');
      observer.observe(element);
    });
    return () => {
      observer.disconnect();
      elements.forEach((element) => element.classList.remove('fn-reveal', 'fn-revealed'));
    };
  }, []);

  return pageRef;
}

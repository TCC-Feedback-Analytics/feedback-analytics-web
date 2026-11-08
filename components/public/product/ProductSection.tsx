import { animate, inView } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { ProductSectionProps } from './ui.types';

export default function ProductSection({ hero = false, children, ...props }: ProductSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (
      !section ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) return;

    // Animate content independently, keeping section backgrounds in place.
    const elements = Array.from(section.querySelectorAll<HTMLElement>('h1, h2, p, article, [data-product-reveal]'))
      .filter((element) => !element.parentElement?.closest('article, [data-product-reveal]'));
    const animations: ReturnType<typeof animate>[] = [];
    const stops = elements.map((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(18px)';
      return inView(element, () => {
        animations.push(animate(element, { opacity: 1, y: 0 }, {
          duration: 0.65,
          delay: hero ? Math.min(index * 0.08, 0.24) : (index % 3) * 0.07,
          ease: [0.22, 1, 0.36, 1],
        }));
      }, { amount: 0.08, margin: '0px 0px -24px 0px' });
    });

    return () => {
      stops.forEach((stop) => stop());
      animations.forEach((animation) => animation.stop());
      elements.forEach((element) => {
        element.style.removeProperty('opacity');
        element.style.removeProperty('transform');
      });
    };
  }, [hero]);

  return <section ref={sectionRef} {...props}>{children}</section>;
}

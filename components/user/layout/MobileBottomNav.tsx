import { NavLink, useLocation } from 'react-router-dom';
import {
  FaChartPie,
  FaWandMagicSparkles,
  FaCommentDots,
  FaBars,
} from 'react-icons/fa6';
import { isMatch } from 'src/lib/utils/navMatch';
import type { MobileBottomNavProps } from './ui.types';

export default function MobileBottomNav({
  isDrawerOpen,
  onOpenDrawer,
  pendingPathname = '',
}: MobileBottomNavProps) {
  const { pathname } = useLocation();

  const navItems = [
    {
      label: 'Visão geral',
      to: '/user/dashboard',
      icon: FaChartPie,
      tourAttr: 'mobile-nav-dashboard',
    },
    {
      label: 'Comentários',
      to: '/user/insights/comments',
      icon: FaCommentDots,
      tourAttr: 'mobile-nav-comments',
    },
    {
      isCentralButton: true,
    },
    {
      label: 'Avaliação',
      to: '/user/edit/feedback-general',
      icon: FaCommentDots,
      tourAttr: 'mobile-nav-feedback',
    },
    {
      label: 'Diagnósticos',
      to: '/user/insights/overview',
      icon: FaWandMagicSparkles,
      tourAttr: 'mobile-nav-insights',
    },
  ];

  return (
    <nav
      aria-label="Barra de navegação móvel"
      className="fixed bottom-0 left-0 right-0 z-40 block max-w-full overflow-visible rounded-t-2xl border-t border-(--quaternary-color)/15 bg-(--bg-secondary)/95 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.35)] backdrop-blur-md md:hidden"
    >
      <div className="grid grid-cols-5 items-end overflow-visible">
        {navItems.map((item) => {
          if (item.isCentralButton) {
            return (
              <div key="central-button" className="relative z-50 flex w-full flex-col items-center overflow-visible">
                <button
                  type="button"
                  onClick={onOpenDrawer}
                  data-tour="mobile-nav-menu"
                  aria-label="Abrir menu de navegação completo"
                  aria-expanded={isDrawerOpen}
                  aria-controls="mobile-navigation-drawer"
                  aria-haspopup="dialog"
                  title="Abrir menu completo"
                  className="group relative -top-7 flex h-15 w-15 items-center justify-center rounded-full bg-linear-to-tr from-(--primary-color) to-cyan-400 text-white shadow-[0_5px_24px_rgba(62,217,227,0.48)] ring-4 ring-(--bg-secondary) transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-(--primary-color)/35"
                >
                  <FaBars className="h-6 w-6 transition-transform group-hover:scale-110" />
                </button>
                <span className="-mt-5 text-[11px] font-semibold leading-none text-(--text-tertiary)">Menu</span>
              </div>
            );
          }

          const targetRoute = item.to || '#';
          const isActive = isMatch(targetRoute, pathname);
          const isPendingActive = isMatch(targetRoute, pendingPathname);
          const Icon = item.icon!;

          return (
            <NavLink
              key={item.label}
              to={targetRoute}
              data-tour={item.tourAttr}
              aria-current={isActive ? 'page' : undefined}
              data-pending-current={isPendingActive ? 'true' : undefined}
              className={`flex min-h-16 min-w-0 w-full flex-col items-center justify-center gap-1.5 text-center transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-(--primary-color) font-bold scale-105'
                  : 'text-(--text-tertiary) hover:text-(--text-primary)'
              }`}
            >
              <div className="flex min-h-8 flex-col items-center justify-start">
                <Icon className="h-[22px] w-[22px]" />
                {isActive && (
                  <span className="mt-1.5 h-1 w-4 rounded-full bg-(--primary-color) transition-all duration-300" />
                )}
              </div>
              <span className="text-[11px] tracking-tight leading-none font-medium">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

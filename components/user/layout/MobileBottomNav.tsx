import { NavLink, useLocation } from 'react-router-dom';
import {
  FaChartPie,
  FaWandMagicSparkles,
  FaCommentDots,
  FaBoxesStacked,
  FaEllipsis,
} from 'react-icons/fa6';
import { isMatch } from 'src/lib/utils/navMatch';
import type { MobileBottomNavProps } from './ui.types';

export default function MobileBottomNav({
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
      label: 'Insights',
      to: '/user/insights/reports',
      icon: FaWandMagicSparkles,
      tourAttr: 'mobile-nav-insights',
    },
    {
      isCentralButton: true,
    },
    {
      label: 'Feedback',
      to: '/user/edit/feedback-general',
      icon: FaCommentDots,
      tourAttr: 'mobile-nav-feedback',
    },
    {
      label: 'Catálogo',
      to: '/user/edit/types-feedback',
      icon: FaBoxesStacked,
      tourAttr: 'mobile-nav-catalog',
    },
  ];

  return (
    <nav
      aria-label="Barra de navegação móvel"
      className="fixed bottom-0 left-0 right-0 z-40 block border-t border-(--quaternary-color)/15 bg-(--bg-secondary)/95 px-3 pt-1.5 pb-2.5 shadow-[0_-4px_24px_rgba(0,0,0,0.35)] backdrop-blur-md md:hidden rounded-t-2xl max-w-full overflow-visible"
    >
      <div className="flex items-center justify-around overflow-visible">
        {navItems.map((item) => {
          if (item.isCentralButton) {
            return (
              <div key="central-button" className="relative flex flex-col items-center overflow-visible z-50">
                <button
                  type="button"
                  onClick={onOpenDrawer}
                  data-tour="mobile-nav-menu"
                  aria-label="Abrir menu de navegação completo"
                  title="Abrir menu completo"
                  className="group relative -top-6 flex h-13 w-13 items-center justify-center rounded-full bg-linear-to-tr from-(--primary-color) to-cyan-400 text-white shadow-[0_4px_20px_rgba(62,217,227,0.45)] ring-4 ring-(--bg-secondary) transition-all duration-200 hover:scale-110 active:scale-90"
                >
                  <FaEllipsis className="h-6 w-6 transition-transform group-hover:scale-110" />
                </button>
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
              className={`flex flex-col items-center gap-1 text-center transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-(--primary-color) font-bold scale-105'
                  : 'text-(--text-tertiary) hover:text-(--text-primary)'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className="h-5 w-5" />
                {isActive && (
                  <span className="absolute -bottom-1.5 h-1 w-4 rounded-full bg-(--primary-color) transition-all duration-300" />
                )}
              </div>
              <span className="text-[10px] tracking-tight leading-none font-medium">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

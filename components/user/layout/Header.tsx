import type { HeaderProps } from './ui.types';
import { FaBars, FaCompass } from 'react-icons/fa6';
import AccountMenu from './AccountMenu';
import HeaderNav from './HeaderNav';
import { useOnboarding } from 'src/lib/context/onboardingContext';

export default function Header({
  isSidebarOpen,
  onToggleSidebar,
  enterprise,
  onSignOut,
  isSigningOut,
}: HeaderProps) {
  const { startTour } = useOnboarding();

  return (
    <div className="flex h-full items-center gap-3 px-4">
      <button
        type="button"
        aria-label={isSidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
        title={isSidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
        className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-(--quaternary-color)/14 bg-(--seventh-color) text-(--text-primary) transition-colors hover:border-(--quaternary-color)/22 hover:bg-(--bg-tertiary)"
        onClick={onToggleSidebar}>
        <FaBars className="h-4 w-4" />
      </button>

      <HeaderNav className="hidden min-w-0 flex-1 sm:block" />

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={startTour}
          data-tour="header-tour-btn"
          title="Abrir Guia do Sistema"
          aria-label="Abrir Guia do Sistema"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 text-xs font-medium text-(--text-secondary) transition-colors hover:border-(--primary-color)/30 hover:bg-(--bg-tertiary) hover:text-(--text-primary)"
        >
          <FaCompass className="h-3.5 w-3.5 text-(--primary-color)" />
          <span className="hidden md:inline">Guia Rápido</span>
        </button>

        <AccountMenu
          enterprise={enterprise}
          onSignOut={onSignOut}
          isSigningOut={isSigningOut}
        />
      </div>
    </div>
  );
}

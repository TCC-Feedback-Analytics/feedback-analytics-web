import { Link } from 'react-router-dom';
import type { HeaderProps } from './ui.types';
import { FaBars, FaChartSimple } from 'react-icons/fa6';
import AccountMenu from './AccountMenu';
import HeaderNav from './HeaderNav';
import HeaderNotifications from './HeaderNotifications';

export default function Header({
  isSidebarOpen,
  onToggleSidebar,
  enterprise,
  onSignOut,
  isSigningOut,
}: HeaderProps) {
  return (
    <div className="flex h-full items-center gap-3 px-4">
      <button
        type="button"
        aria-label={isSidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
        title={isSidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
        className="h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-(--quaternary-color)/14 bg-(--seventh-color) text-(--text-primary) transition-colors hover:border-(--quaternary-color)/22 hover:bg-(--bg-tertiary) hidden md:inline-flex"
        onClick={onToggleSidebar}>
        <FaBars className="h-4 w-4" />
      </button>

      <HeaderNav className="hidden min-w-0 flex-1 sm:block" />

      {/* Celular: sem o menu de páginas, o cabeçalho mostra de quem é a conta e leva à Visão geral. */}
      <Link
        to="/user/dashboard"
        aria-label="Ir para a Visão geral"
        className="flex min-w-0 flex-1 items-center gap-2.5 sm:hidden"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-(--primary-color) to-(--tertiary-color) text-(--on-primary) shadow-sm">
          <FaChartSimple className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-montserrat text-sm font-semibold text-(--text-primary)">
            {enterprise.full_name || 'Minha empresa'}
          </span>
          <span className="block truncate text-[11px] text-(--text-tertiary)">Feedback Analytics</span>
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <HeaderNotifications />
        <AccountMenu
          enterprise={enterprise}
          onSignOut={onSignOut}
          isSigningOut={isSigningOut}
        />
      </div>
    </div>
  );
}

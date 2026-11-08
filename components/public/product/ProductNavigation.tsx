import { Link, NavLink, useLocation } from 'react-router-dom';
import { LuArrowUpRight } from 'react-icons/lu';
import { Brand } from 'components/public/home/shared';

export default function ProductNavigation() {
  const { pathname } = useLocation();
  const pages = [
    { to: '/produto/coleta', label: 'Coleta' },
    { to: '/produto/analise', label: 'Análise' },
    { to: '/produto/resultados', label: 'Resultados' },
  ];
  const currentPage = pages.find(({ to }) => pathname === to);

  return (
    <nav
      className="fn-nav relative flex items-center justify-between rounded-[16px] bg-[#04191dc7]"
      aria-label="Navegação principal"
    >
      <Brand />
      <div className="fn-nav-links [&_a]:rounded-sm [&_a]:transition-colors motion-reduce:[&_a]:transition-none">
        {pages.map(({ to, label }) => (
          <NavLink key={to} to={to} end>{label}</NavLink>
        ))}
      </div>
      {currentPage && (
        <span aria-hidden="true" className="absolute top-[calc(100%+8px)] left-2 hidden text-xs font-semibold text-[#68d7cd] max-[760px]:block">
          {currentPage.label}
        </span>
      )}
      <div className="fn-nav-actions">
        <Link to="/login" className="fn-login rounded-sm transition-colors motion-reduce:transition-none">
          Entrar
        </Link>
        <Link
          to="/register"
          className="fn-button fn-button-accent fn-nav-cta inline-flex items-center justify-center font-semibold whitespace-nowrap text-[#082a2d]"
        >
          Começar grátis <LuArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}

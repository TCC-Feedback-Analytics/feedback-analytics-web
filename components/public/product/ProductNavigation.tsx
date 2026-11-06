import { Link } from 'react-router-dom';
import { LuArrowUpRight } from 'react-icons/lu';
import { Brand } from 'components/public/home/shared';

export default function ProductNavigation() {
  return (
    <nav
      className="fn-nav flex items-center justify-between rounded-[16px] bg-[#04191dc7]"
      aria-label="Navegação principal"
    >
      <Brand />
      <div className="fn-nav-links">
        <Link to="/produto/coleta">Coleta</Link>
        <Link to="/produto/analise">Análise</Link>
        <Link to="/produto/resultados">Resultados</Link>
      </div>
      <div className="fn-nav-actions">
        <Link to="/login" className="fn-login">
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

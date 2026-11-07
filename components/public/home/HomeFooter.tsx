import { Link } from 'react-router-dom';
import { PRIVACY_PATH, TERMS_PATH } from 'src/lib/constants/legal';
import { Brand } from './shared';

export default function HomeFooter() {
  return (
    <footer className="fn-footer bg-[#021216]">
      <div className="fn-container">
        <div className="fn-footer-main justify-between gap-[30px]">
          <div className="fn-footer-brand">
            <Brand />
            <p>A voz dos seus clientes ajudando a decidir — com apoio de IA.</p>
          </div>
          <div className="fn-footer-links [&_a]:rounded-sm [&_a]:transition-colors motion-reduce:[&_a]:transition-none">
            <div>
              <strong>Produto</strong>
              <Link to="/produto/coleta">Coleta</Link>
              <Link to="/produto/analise">Análise</Link>
              <Link to="/produto/resultados">Resultados</Link>
            </div>
            <div>
              <strong>Conta</strong>
              <Link to="/login">Entrar</Link>
              <Link to="/register">Criar conta</Link>
            </div>
            <div>
              <strong>Legal</strong>
              <Link to={PRIVACY_PATH}>Privacidade</Link>
              <Link to={TERMS_PATH}>Termos</Link>
              <Link to={PRIVACY_PATH}>LGPD</Link>
            </div>
          </div>
        </div>
        <div className="fn-footer-bottom justify-between gap-[15px] pt-[18px] text-[#587574] text-[11px]">
          <span>© Feedback Analytics. Todos os direitos reservados.</span>
          <span>Versão: {__APP_VERSION__}</span>
        </div>
      </div>
    </footer>
  );
}

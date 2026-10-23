import Header from 'components/public/layout/header';
import { Outlet, useLocation } from 'react-router-dom';
import { isEmbeddedForm } from 'src/lib/utils/embeddedForm';

export default function Public() {
  const { pathname } = useLocation();
  // O formulário de coleta é uma experiência focada no cliente, sem navegação
  // da área pública. A mesma regra também cobre o preview dentro do Dashboard.
  const embedded = isEmbeddedForm();
  const isFeedbackCollection = pathname === '/feedback/qrcode';
  return (
    <div className="public-theme min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {!embedded && !isFeedbackCollection && (
        <header className="relative z-10">
          <Header />
        </header>
      )}
      <main className="relative z-0">
        <Outlet />
      </main>
    </div>
  );
}

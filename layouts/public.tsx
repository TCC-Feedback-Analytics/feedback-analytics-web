import Header from 'components/public/layout/header';
import { Outlet, useLocation } from 'react-router-dom';
import { isEmbeddedForm } from 'src/lib/utils/embeddedForm';

export default function Public() {
  const { pathname } = useLocation();
  // As experiências focadas em uma única tarefa não exibem a navegação pública.
  // A regra também cobre o preview do formulário dentro do Dashboard.
  const embedded = isEmbeddedForm();
  const isHeaderlessPage = ['/feedback/qrcode', '/login'].includes(pathname);
  return (
    <div className="public-theme min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {!embedded && !isHeaderlessPage && (
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

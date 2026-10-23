import Header from 'components/public/layout/header';
import { Outlet, useLocation } from 'react-router-dom';
import { isEmbeddedForm } from 'src/lib/utils/embeddedForm';

const HEADERLESS_PUBLIC_PATHS = new Set([
  '/feedback/qrcode',
  '/login',
  '/register',
  '/forgot-password',
  '/resend-confirmation',
  '/auth/reset-password',
  '/auth/success',
  '/auth/link-expired',
  '/auth/complete-signup',
]);

export default function Public() {
  const { pathname } = useLocation();
  // As experiências focadas em uma única tarefa não exibem a navegação pública.
  // A regra também cobre o preview do formulário dentro do Dashboard.
  const embedded = isEmbeddedForm();
  const isHeaderlessPage = HEADERLESS_PUBLIC_PATHS.has(pathname);
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

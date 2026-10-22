import Header from 'components/public/layout/header';
import { Outlet } from 'react-router-dom';
import { isEmbeddedForm } from 'src/lib/utils/embeddedForm';

export default function Public() {
  // Formulário aberto dentro do Dashboard ("Testar o formulário"): sem o cabeçalho do site.
  const embedded = isEmbeddedForm();
  return (
    <div className="public-theme min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {!embedded && (
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

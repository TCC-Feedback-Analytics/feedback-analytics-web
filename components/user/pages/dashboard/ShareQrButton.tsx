import { Link } from 'react-router-dom';
import QrGlyph from './QrGlyph';

/**
 * Atalho pequeno da barra de escopo, na Visão geral: leva ao formulário/QR do escopo
 * selecionado. O destino (`to`) é calculado no dashboard e varia conforme o escopo.
 * No celular fica só o ícone; o nome acessível diz o que ele faz.
 */
export default function ShareQrButton({ to }: { to: string }) {
  return (
    <Link
      to={to}
      aria-label="Compartilhar o formulário de feedback pelo QR Code"
      className="font-poppins inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-(--primary-color)/25 bg-(--primary-color)/8 px-3 text-xs font-semibold text-(--text-primary) transition-colors hover:border-(--primary-color)/50 hover:bg-(--primary-color)/12 sm:min-h-9"
    >
      <QrGlyph className="h-4 w-4" />
      <span className="hidden sm:inline">QR Code</span>
    </Link>
  );
}

import type { QrGlyphProps } from './ui.types';

// Módulos de dados do QR ilustrativo (posições em viewBox 100x100, fora dos
// três "olhos" de canto). Sem valor escaneável — só estética.
const QR_MODULES: ReadonlyArray<readonly [number, number]> = [
  [40, 10], [51, 10], [40, 21],
  [40, 40], [51, 51], [62, 40], [40, 62], [51, 40], [62, 62],
  [70, 40], [81, 51], [70, 62],
  [40, 70], [51, 81], [62, 70],
  [70, 70], [81, 81], [70, 81], [81, 70],
];

const QR_EYES: ReadonlyArray<readonly [number, number]> = [[8, 8], [70, 8], [8, 70]];

/**
 * QR Code decorativo (sem valor escaneável), na cor do texto atual. Usado no
 * atalho de compartilhamento e na animação do bloco de boas-vindas do Dashboard.
 */
export default function QrGlyph({ className = '' }: QrGlyphProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      {QR_EYES.map(([x, y]) => (
        <g key={`eye-${x}-${y}`}>
          <rect x={x} y={y} width={22} height={22} rx={5} fill="none" stroke="currentColor" strokeWidth={4} />
          <rect x={x + 7} y={y + 7} width={8} height={8} rx={2} fill="currentColor" />
        </g>
      ))}
      {QR_MODULES.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={8} height={8} rx={2} fill="currentColor" />
      ))}
    </svg>
  );
}

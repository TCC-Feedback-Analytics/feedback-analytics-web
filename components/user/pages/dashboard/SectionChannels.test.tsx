import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import type { FeedbackStats } from 'lib/interfaces/domain/feedback.domain';

vi.mock('src/lib/context/insightsControls', () => ({
  useInsightsControls: () => ({ scope: 'COMPANY', catalogItemId: '', catalogItemOptions: [], period: { preset: 'ALL' } }),
}));
vi.mock('components/user/shared/ScopeTag', () => ({ default: () => null }));

import SectionChannels from './SectionChannels';

afterEach(cleanup);

const ci = { lower: 3.8, upper: 4.8 };
function stats(channelBreakdown: FeedbackStats['channelBreakdown']): FeedbackStats {
  return { totalFeedbacks: 50, channelBreakdown } as FeedbackStats;
}

describe('Por onde chegaram', () => {
  it('mostra cada canal com avaliações, percentual e média', () => {
    render(
      <SectionChannels
        stats={stats([
          { channel: 'QR', count: 30, mean: 4.2, ci },
          { channel: 'LINK', count: 10, mean: 3.9, ci },
          { channel: 'NFC', count: 10, mean: 4.7, ci },
        ])}
      />,
    );
    const section = screen.getByRole('region', { name: /Por onde chegaram/ });
    const qr = within(section).getByText('QR Code').closest('li') as HTMLElement;
    expect(qr).toHaveTextContent('30 avaliações · 60%');
    expect(qr).toHaveTextContent('média 4,2');
    expect(within(section).getByText('Etiqueta NFC').closest('li')).toHaveTextContent('10 avaliações · 20%');
    expect(within(section).getByText('Link compartilhado')).toBeInTheDocument();
  });

  it('com um canal só, vira uma linha', () => {
    render(<SectionChannels stats={stats([{ channel: 'QR', count: 12, mean: 4.5, ci }])} />);
    expect(screen.getByText(/vieram pelo/)).toHaveTextContent('vieram pelo QR Code (12 avaliações)');
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('as sem marca de canal ficam à parte, com a dica de baixar o QR de novo', () => {
    render(
      <SectionChannels
        stats={stats([
          { channel: 'NFC', count: 4, mean: 5, ci },
          { channel: null, count: 20, mean: 4.1, ci },
        ])}
      />,
    );
    expect(screen.getByText(/sem a marca de canal/)).toHaveTextContent('20 avaliações sem a marca de canal');
    expect(screen.getByText(/Baixe o QR Code de novo/)).toBeInTheDocument();
    expect(screen.getByText(/vieram pelo/)).toHaveTextContent('Etiqueta NFC');
  });

  it('sem avaliações não aparece', () => {
    const { container } = render(<SectionChannels stats={stats([])} />);
    expect(container).toBeEmptyDOMElement();
  });
});

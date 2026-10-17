import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// O setup global troca o react-router-dom por um mock mínimo; aqui usamos o real.
vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));

vi.mock('components/public/forms/messages/useToast', () => ({
  useToast: () => toast,
}));

import { useFeedbackMilestones } from './useFeedbackMilestones';
import type { MilestoneSnapshot } from 'src/lib/utils/feedbackMilestones';

const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

type Props = { snapshot: MilestoneSnapshot; watching: boolean; refresh: () => void };

function setup(initial: Props) {
  return renderHook(
    (props: Props) => useFeedbackMilestones({ enterpriseId: 'ent-1', inScope: 'na empresa (avaliação geral)', ...props }),
    { wrapper, initialProps: initial },
  );
}

describe('useFeedbackMilestones', () => {
  beforeEach(() => window.localStorage.clear());

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('avisa quando o primeiro feedback chega à conta que estava zerada', () => {
    const refresh = vi.fn();
    const { rerender } = setup({ snapshot: { accountTotal: 0, scopeKey: 'COMPANY:', scopeTotal: 0 }, watching: true, refresh });
    expect(toast.success).not.toHaveBeenCalled();

    rerender({ snapshot: { accountTotal: 1, scopeKey: 'COMPANY:', scopeTotal: 1 }, watching: false, refresh });
    expect(toast.success).toHaveBeenCalledWith(
      'Seu primeiro feedback chegou!',
      'O painel já mostra as primeiras métricas.',
      expect.objectContaining({ actionLabel: 'Ver feedback' }),
    );
  });

  it('avisa quando o escopo chega a 10 feedbacks', () => {
    const refresh = vi.fn();
    const { rerender } = setup({ snapshot: { accountTotal: 9, scopeKey: 'COMPANY:', scopeTotal: 9 }, watching: true, refresh });
    rerender({ snapshot: { accountTotal: 10, scopeKey: 'COMPANY:', scopeTotal: 10 }, watching: false, refresh });
    expect(toast.success).toHaveBeenCalledWith(
      'A IA já pode analisar os comentários',
      'Você chegou a 10 feedbacks na empresa (avaliação geral). Use Analisar comentários com IA, no topo.',
      expect.anything(),
    );
  });

  it('não repete o aviso depois de recarregar a página', () => {
    const refresh = vi.fn();
    const first = setup({ snapshot: { accountTotal: 0, scopeKey: 'COMPANY:', scopeTotal: 0 }, watching: true, refresh });
    first.rerender({ snapshot: { accountTotal: 1, scopeKey: 'COMPANY:', scopeTotal: 1 }, watching: true, refresh });
    first.unmount();
    vi.clearAllMocks();

    setup({ snapshot: { accountTotal: 1, scopeKey: 'COMPANY:', scopeTotal: 1 }, watching: true, refresh });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('enquanto acompanha, atualiza a cada 30s e ao voltar para a aba', () => {
    vi.useFakeTimers();
    const refresh = vi.fn();
    const { rerender } = setup({ snapshot: { accountTotal: 0, scopeKey: 'COMPANY:', scopeTotal: 0 }, watching: true, refresh });

    vi.advanceTimersByTime(30_000);
    expect(refresh).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event('visibilitychange'));
    expect(refresh).toHaveBeenCalledTimes(2);

    rerender({ snapshot: { accountTotal: 12, scopeKey: 'COMPANY:', scopeTotal: 12 }, watching: false, refresh });
    vi.advanceTimersByTime(60_000);
    expect(refresh).toHaveBeenCalledTimes(2);
  });
});

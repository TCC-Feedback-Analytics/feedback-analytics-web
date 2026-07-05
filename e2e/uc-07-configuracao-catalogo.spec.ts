import { test, expect } from '@playwright/test';

test.describe('UC-07: Configuração do catálogo', () => {
  test('[CT-UC07-01] Página de catálogo de produtos carrega corretamente', async ({ page }) => {
    await page.goto('/user/edit/feedback-products');

    // Espera o carregamento assíncrono: a rota deve renderizar OU o conteúdo
    // principal (acesso liberado) OU a mensagem de bloqueio (tipo não ativado).
    // O `.isVisible()` instantâneo anterior corria com o carregamento e falhava
    // de forma intermitente — `toBeVisible` faz auto-retry até o timeout.
    const accessibleOrBlocked = page
      .getByRole('main')
      .or(page.getByText(/tipo.*n.o ativado|ative.*produtos/i));

    await expect(accessibleOrBlocked.first()).toBeVisible({ timeout: 15000 });
  });
});

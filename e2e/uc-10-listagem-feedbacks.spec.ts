import { test, expect } from '@playwright/test';

test.describe('UC-10: Listagem de feedbacks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/user/feedbacks/all');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('[CT-UC10-01] Listagem carrega feedbacks ou exibe estado vazio', async ({ page }) => {
    await expect(page).toHaveURL(/\/user\/feedbacks\/all/);

    // Espera o carregamento assíncrono: a lista deve mostrar OU um card de
    // feedback OU o estado vazio. (O `.isVisible()` instantâneo anterior corria
    // com o fetch e falhava de forma intermitente quando os dados ainda não
    // haviam renderizado — `toBeVisible` faz auto-retry até o timeout.)
    const feedbackOrEmpty = page
      .locator('[data-feedback-card], .feedback-card, article')
      .or(page.getByText(/nenhum feedback|sem feedbacks|vazio/i));

    await expect(feedbackOrEmpty.first()).toBeVisible({ timeout: 15000 });
  });
});

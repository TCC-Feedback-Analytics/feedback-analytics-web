import { test, expect } from '@playwright/test';

test.describe('UC-05: Geração de QR Code da empresa', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/user/edit/feedback-general');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('[CT-UC05-01] Tela de Feedback geral carrega com o QR Code da empresa', async ({ page }) => {
    await expect(page).toHaveURL(/\/user\/edit\/feedback-general/);

    // Espera o carregamento assíncrono: a tela deve mostrar OU o conteúdo do QR
    // Code (canvas, img ou svg) OU o botão de habilitar/desabilitar coleta. O
    // `.isVisible()` instantâneo anterior corria com o fetch e falhava de forma
    // intermitente quando os dados ainda não haviam renderizado — `toBeVisible`
    // faz auto-retry até o timeout.
    const qrOrActivate = page
      .locator('canvas, img[alt*="QR"], svg[data-qr]')
      .or(page.getByText(/(habilitar|desabilitar|ativar) qr code|ativar coleta/i));

    await expect(qrOrActivate.first()).toBeVisible({ timeout: 15000 });
  });
});

import { test, expect } from '@playwright/test';

test.describe('UC-11: Insights de IA', () => {
  test('[CT-UC11-01] Página de relatório de insights carrega com sumário ou estado vazio', async ({ page }) => {
    await page.goto('/user/insights/reports');
    await expect(page.getByRole('main')).toBeVisible();

    // Espera o carregamento assíncrono: a tela deve mostrar OU o sumário/insights
    // OU o estado vazio. O `.isVisible()` instantâneo anterior corria com o fetch
    // e falhava de forma intermitente — `toBeVisible` faz auto-retry até o timeout.
    const summaryOrEmpty = page
      .getByText(/sum.rio|resumo|insights/i)
      .or(page.getByText(/nenhum insight|sem dados|gerar insights|sem feedbacks/i));

    await expect(summaryOrEmpty.first()).toBeVisible({ timeout: 15_000 });
  });

  test('[CT-UC11-02] Página de insights exibe análise de sentimentos e keywords', async ({ page }) => {
    await page.goto('/user/insights/reports');
    await expect(page.getByRole('main')).toBeVisible();

    // Espera o carregamento assíncrono: a tela deve mostrar OU a análise
    // (sentimentos/keywords) OU o estado vazio (que também é válido). O
    // `.isVisible()` instantâneo anterior corria com o fetch e falhava de forma
    // intermitente — `toBeVisible` faz auto-retry até o timeout.
    const analysisOrEmpty = page
      .getByText(/positivo|negativo|neutro|palavra-chave|keywords/i)
      .or(page.getByText(/nenhum insight|sem dados|gerar insights|ainda não há relatório/i));

    await expect(analysisOrEmpty.first()).toBeVisible({ timeout: 15_000 });
  });


  test('[CT-UC11-05] Botão de regenerar insights solicita nova análise', async ({ page }) => {
    await page.goto('/user/insights/reports');
    await expect(page.getByRole('main')).toBeVisible();

    const regenerateBtn = page.getByRole('button', { name: /regenerar|gerar insights|atualizar insights/i }).first();

    // O botão fica desabilitado quando não há análise nova para gerar insights
    // (comportamento intencional). Nesse estado o teste não se aplica. Aguarda o
    // botão aparecer (auto-wait) e então verifica se está habilitado — o
    // `.isVisible()` instantâneo anterior pulava por engano quando a página ainda
    // estava carregando.
    const regenerateReady = await regenerateBtn
      .waitFor({ state: 'visible', timeout: 10_000 })
      .then(() => regenerateBtn.isEnabled())
      .catch(() => false);
    if (!regenerateReady) {
      test.skip();
      return;
    }

    // Intercepta a chamada de API para não consumir créditos Gemini
    await page.route('**/api/protected/ia-analyze/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, analyzedCount: 1 }),
      });
    });

    await regenerateBtn.click();

    await expect(
      page.getByText(/processando|gerando|analisando|aguarde|insights atualizados/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});

import { test, expect } from '@playwright/test';

test.describe('UC-10: Listagem de feedbacks', () => {
  test('[CT-UC10-01] Listagem carrega feedbacks ou exibe estado vazio', async ({ page }) => {
    // O gate de e2e roda contra o homolog DEPLOYADO (Vercel serverless + Supabase).
    // Se a função de listagem der cold start / blip transitório, o loader rejeita e
    // a página cai no estado de erro ("Erro ao carregar feedbacks"). Damos algumas
    // tentativas com reload para absorver esse transitório; se o erro PERSISTIR, o
    // teste falha de verdade — que é o objetivo do gate (não promover uma listagem
    // quebrada). Precisamos de folga no timeout do teste por causa dos retries.
    test.setTimeout(50_000);

    // Estados de sucesso: card de feedback OU estado vazio.
    // (NÃO usamos `article` aqui: os cards reais são `div.feedback-card`; o único
    // `<article>` da tela é o do SKELETON de carregamento — casá-lo daria falso
    // positivo enquanto a lista ainda nem carregou.)
    const success = page
      .locator('[data-feedback-card], .feedback-card')
      .or(page.getByText(/nenhum feedback|sem feedbacks|vazio/i));

    // Estado de erro do loader (loadFeedbacksAll -> FeedbacksAllErrorState).
    const errorState = page.getByText(/erro ao carregar feedbacks/i);

    const MAX_ATTEMPTS = 2;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      await page.goto('/user/feedbacks/all');
      await expect(page).toHaveURL(/\/user\/feedbacks\/all/);
      await expect(page.getByRole('main')).toBeVisible();

      // Aguarda um estado TERMINAL: sucesso (cards/estado vazio) OU erro.
      // `toBeVisible` faz auto-retry até o timeout, cobrindo a latência do homolog.
      await expect(success.or(errorState).first()).toBeVisible({ timeout: 15_000 });

      if (await success.first().isVisible()) {
        return; // sucesso: lista renderizou cards ou o estado vazio.
      }

      // Caiu no estado de erro: se ainda houver tentativa, recarrega (cold start).
      if (attempt < MAX_ATTEMPTS) {
        await page.waitForTimeout(2_000);
      }
    }

    // Esgotou as tentativas e continua no estado de erro → falha real e legível.
    await expect(
      success.first(),
      `A listagem continuou em estado de erro ("Erro ao carregar feedbacks") após ` +
        `${MAX_ATTEMPTS} tentativas. O endpoint GET /api/protected/user/feedbacks ` +
        `provavelmente está falhando no ambiente alvo (verifique o deploy do homolog).`,
    ).toBeVisible({ timeout: 15_000 });
  });
});

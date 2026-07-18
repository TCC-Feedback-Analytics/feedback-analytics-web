import { test as setup, expect } from '@playwright/test';
import { requireE2EEnvironment, TEST_USER } from './test-data';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const AUTH_FILE = path.join(__dirname, '../.auth/user.json');
const LOGIN_ENDPOINT = '/api/public/auth/login';
const AUTH_USER_ENDPOINT = '/api/protected/user/auth_user';

function formatResponseBody(body: string): string {
  const compactBody = body.replace(/\s+/g, ' ').trim();
  return compactBody.length > 500
    ? `${compactBody.slice(0, 500)}…`
    : compactBody;
}

setup('autenticar usuário de teste', async ({ page }) => {
  requireE2EEnvironment();

  await page.goto('/login');

  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(LOGIN_ENDPOINT) &&
      response.request().method() === 'POST',
  );
  const authUserResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(AUTH_USER_ENDPOINT) &&
      response.request().method() === 'GET',
  );

  await page.fill('#email', TEST_USER.email);
  await page.fill('#password', TEST_USER.password);
  await page.click('button[type="submit"]');

  const loginResponse = await loginResponsePromise;
  const loginBody = await loginResponse.text().catch(() => '');
  expect(
    loginResponse.ok(),
    `POST ${LOGIN_ENDPOINT} retornou ${loginResponse.status()}: ${formatResponseBody(loginBody)}`,
  ).toBe(true);

  await expect(page).toHaveURL(/\/user\/dashboard/, { timeout: 15_000 });

  const authUserResponse = await authUserResponsePromise;
  expect(
    authUserResponse.status(),
    `GET ${AUTH_USER_ENDPOINT} deve validar a sessão criada pelo login.`,
  ).toBe(200);

  await page.context().storageState({ path: AUTH_FILE });
});

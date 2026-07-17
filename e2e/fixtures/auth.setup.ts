import { test as setup, expect } from '@playwright/test';
import { TEST_USER, TEST_ENTERPRISE_ID } from './test-data';
import { ensureTestUserExists } from './supabase-helpers';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const AUTH_FILE = path.join(__dirname, '../.auth/user.json');

setup('autenticar usuário de teste', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', exception => console.log('PAGE ERROR:', exception));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure()?.errorText));
  page.on('response', res => {
    if (res.status() >= 400) {
      console.log('BAD RESPONSE:', res.url(), res.status());
    }
  });

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (supabaseUrl && supabaseKey) {
    await ensureTestUserExists(TEST_USER.email, TEST_USER.password, TEST_ENTERPRISE_ID);
  } else {
    console.log('[setup] SUPABASE_URL/KEY not found. Skipping auto-seeding.');
  }

  await page.goto('/login');

  await page.fill('#email', TEST_USER.email);
  await page.fill('#password', TEST_USER.password);
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/user\/dashboard/, { timeout: 15_000 });

  await page.context().storageState({ path: AUTH_FILE });
});

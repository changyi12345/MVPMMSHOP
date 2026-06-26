import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});

test('orders page redirects guest to login', async ({ page }) => {
  await page.goto('/orders');
  await expect(page).toHaveURL(/\/auth\/login/);
});

test('help page loads CMS or fallback', async ({ page }) => {
  await page.goto('/help');
  await expect(page.locator('.page-title, h1, h2').first()).toBeVisible({ timeout: 15_000 });
});

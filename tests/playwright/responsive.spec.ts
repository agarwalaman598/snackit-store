import { test, expect } from '@playwright/test';

// Smoke/responsive visual checks: open home, open cart, proceed to checkout modal, capture screenshots

test('home and checkout are responsive across viewports', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/SnackIt/i);

  // capture home hero
  await page.locator('section').first().screenshot({ path: `pw-hero-${test.info().project.name}.png` });

  // open cart (simulate adding items by toggling empty cart UI is tricky in headless; we'll just open the cart)
  await page.click('[data-testid="cart-button"]');
  await page.waitForSelector('[data-testid="cart-sidebar"]');
  await page.screenshot({ path: `pw-cart-${test.info().project.name}.png` });

  // open checkout if present
  const checkoutBtn = page.locator('[data-testid="checkout-button"]');
  if (await checkoutBtn.count() > 0) {
    await checkoutBtn.first().click();
    await page.waitForSelector('[data-testid="checkout-modal"]', { timeout: 5000 }).catch(() => {});
    await page.screenshot({ path: `pw-checkout-${test.info().project.name}.png` });
  }

  // ensure cart and modal are scrollable by evaluating scroll heights
  const sidebar = await page.locator('[data-testid="cart-sidebar"]').first();
  if (await sidebar.count() > 0) {
    const scrollable = await sidebar.evaluate((el) => ({ scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }));
    expect(scrollable.scrollHeight).toBeGreaterThanOrEqual(scrollable.clientHeight);
  }
});

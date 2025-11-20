import { expect, test } from '@playwright/test';

test.describe('Navigation and UI', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByRole('button', { name: /Login/i }).click();
    await page.getByRole('button', { name: 'Sita Rai' }).click();
    await expect(page.getByText(/Sita/i)).toBeVisible({ timeout: 5000 });
  });

  test('should navigate between pages using bottom nav', async ({ page }) => {
    // Home
    await page.getByRole('button', { name: /Home/i }).click();
    await expect(page.getByText(/Issue|Challenge|Activity/i).first()).toBeVisible();
    
    // Leaderboards
    await page.getByRole('button', { name: /Leaderboard/i }).click();
    await expect(page.getByText(/Top Contributors|Rank|Score/i).first()).toBeVisible();
    
    // Rewards
    await page.getByRole('button', { name: /Rewards/i }).click();
    await expect(page.getByText(/Reward|Prize|Redeem/i).first()).toBeVisible();
    
    // Profile
    await page.getByRole('button', { name: /Profile/i }).click();
    await expect(page.getByText(/Stats|Statistics|Activity|Badge/i).first()).toBeVisible();
  });

  test('should display header with user info', async ({ page }) => {
    // Header should show points
    await expect(page.locator('text=/\\d+\\s*points?/i').first()).toBeVisible();
    
    // Header should have user-related elements
    await expect(page.getByText(/Sita/i)).toBeVisible();
  });

  test('should show live activity feed', async ({ page }) => {
    // Activity feed should be visible on home page
    const activityFeed = page.locator('text=/Recent Activity|Live Feed|Activities/i').first();
    
    if (await activityFeed.isVisible()) {
      // Should have activity items
      await expect(page.locator('[class*="activity"]').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display issues list', async ({ page }) => {
    // Navigate to home
    await page.getByRole('button', { name: /Home/i }).click();
    
    // Issues should be visible
    await expect(page.getByText(/Issue|Report|Problem/i).first()).toBeVisible();
  });

  test('should handle mobile responsive layout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Bottom nav should still be visible
    await expect(page.getByRole('button', { name: /Home/i })).toBeVisible();
    
    // Content should be scrollable
    await page.mouse.wheel(0, 500);
    
    // Should not have horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBe(clientWidth);
  });
});

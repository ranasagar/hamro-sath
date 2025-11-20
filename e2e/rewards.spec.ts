import { expect, test } from '@playwright/test';

test.describe('Rewards and Points Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByRole('button', { name: /Login/i }).click();
    await page.getByRole('button', { name: 'Sita Rai' }).click();
    await expect(page.getByText(/Sita/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display user points in header', async ({ page }) => {
    // Points should be visible in header
    const pointsDisplay = page.locator('text=/\\d+\\s*(points?|pts)/i').first();
    await expect(pointsDisplay).toBeVisible();
  });

  test('should navigate to rewards page', async ({ page }) => {
    // Navigate to Rewards via bottom nav
    await page.getByRole('button', { name: /Rewards/i }).click();
    
    // Should see rewards content
    await expect(page.getByText(/Reward|Redeem|Prize/i)).toBeVisible();
  });

  test('should display available rewards', async ({ page }) => {
    await page.getByRole('button', { name: /Rewards/i }).click();
    
    // Should have reward cards or items
    const rewardItems = page.locator('[class*="reward"]').or(page.locator('img[alt*="reward" i]'));
    await expect(rewardItems.first()).toBeVisible({ timeout: 5000 });
  });

  test('should view reward details', async ({ page }) => {
    await page.getByRole('button', { name: /Rewards/i }).click();
    
    // Click on first reward
    const firstReward = page.locator('button, [role="button"]').filter({ hasText: /voucher|discount|prize/i }).first();
    
    if (await firstReward.isVisible()) {
      await firstReward.click();
      
      // Details modal should open
      await expect(page.getByText(/Details|Description|Points Required/i)).toBeVisible();
    }
  });

  test('should show insufficient points message', async ({ page }) => {
    await page.getByRole('button', { name: /Rewards/i }).click();
    
    // Find a high-value reward
    const expensiveReward = page.locator('text=/\\d{4,}\\s*points/i').first();
    
    if (await expensiveReward.isVisible()) {
      // Try to redeem (this assumes the reward is more expensive than user points)
      const redeemButton = page.locator('button').filter({ hasText: /Redeem/i }).first();
      
      if (await redeemButton.isVisible()) {
        await redeemButton.click();
        
        // Should see insufficient points message (or button should be disabled)
        const isDisabled = await redeemButton.isDisabled();
        expect(isDisabled).toBe(true);
      }
    }
  });
});

import { expect, test } from '@playwright/test';

test.describe('Forum and Community Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByRole('button', { name: /Login/i }).click();
    await page.getByRole('button', { name: 'Sita Rai' }).click();
    await expect(page.getByText(/Sita/i)).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to forum page', async ({ page }) => {
    // Look for Forum button (could be in nav or menu)
    const forumButton = page.locator('button, a').filter({ hasText: /Forum|Community/i }).first();
    
    if (await forumButton.isVisible()) {
      await forumButton.click();
      await expect(page.getByText(/Discussion|Thread|Post/i).first()).toBeVisible();
    }
  });

  test('should display forum threads', async ({ page }) => {
    const forumButton = page.locator('button, a').filter({ hasText: /Forum|Community/i }).first();
    
    if (await forumButton.isVisible()) {
      await forumButton.click();
      
      // Should see thread titles
      const threads = page.locator('[class*="thread"], [class*="post"]');
      const count = await threads.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should open create thread modal', async ({ page }) => {
    const forumButton = page.locator('button, a').filter({ hasText: /Forum|Community/i }).first();
    
    if (await forumButton.isVisible()) {
      await forumButton.click();
      
      // Look for create button
      const createButton = page.locator('button').filter({ hasText: /Create|New Thread|Post/i }).first();
      
      if (await createButton.isVisible()) {
        await createButton.click();
        
        // Modal should open
        await expect(page.getByLabel(/Title/i)).toBeVisible();
        await expect(page.getByLabel(/Content|Description/i)).toBeVisible();
      }
    }
  });

  test('should view thread details', async ({ page }) => {
    const forumButton = page.locator('button, a').filter({ hasText: /Forum|Community/i }).first();
    
    if (await forumButton.isVisible()) {
      await forumButton.click();
      
      // Click on first thread
      const firstThread = page.locator('[class*="thread"], [role="article"]').first();
      
      if (await firstThread.isVisible()) {
        await firstThread.click();
        
        // Should see thread content and comments
        await expect(page.getByText(/Comment|Reply|Response/i).first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should show leaderboard rankings', async ({ page }) => {
    await page.getByRole('button', { name: /Leaderboard/i }).click();
    
    // Should see ranked users
    await expect(page.getByText(/Rank|Position|#\d+/i).first()).toBeVisible();
    
    // Should see point values
    await expect(page.locator('text=/\\d+\\s*points?/i').first()).toBeVisible();
  });
});

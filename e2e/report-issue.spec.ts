import { expect, test } from '@playwright/test';

test.describe('Issue Reporting Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByRole('button', { name: /Login/i }).click();
    await page.getByRole('button', { name: 'Sita Rai' }).click();
    await expect(page.getByText(/Sita/i)).toBeVisible({ timeout: 5000 });
  });

  test('should open report issue modal', async ({ page }) => {
    // Look for report button (could be floating action button or header button)
    const reportButton = page.locator('button').filter({ hasText: /Report/i }).first();
    await reportButton.click();
    
    // Modal should appear
    await expect(page.getByText(/Report an Issue/i)).toBeVisible();
    await expect(page.getByLabel(/Category/i)).toBeVisible();
    await expect(page.getByLabel(/Description/i)).toBeVisible();
    await expect(page.getByLabel(/Location/i)).toBeVisible();
  });

  test('should submit an issue report', async ({ page }) => {
    // Open report modal
    const reportButton = page.locator('button').filter({ hasText: /Report/i }).first();
    await reportButton.click();
    
    // Fill form
    await page.locator('select[name="category"]').selectOption('waste');
    await page.getByLabel(/Description/i).fill('There is uncollected garbage near the main road');
    await page.getByLabel(/Location/i).fill('Main Street, Ward 5');
    
    // Submit
    await page.getByRole('button', { name: /Submit/i }).click();
    
    // Should show success message
    await expect(page.getByText(/successfully|submitted|reported/i)).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields', async ({ page }) => {
    const reportButton = page.locator('button').filter({ hasText: /Report/i }).first();
    await reportButton.click();
    
    // Try to submit without filling
    await page.getByRole('button', { name: /Submit/i }).click();
    
    // Should show validation message or prevent submission
    const categorySelect = page.locator('select[name="category"]');
    await expect(categorySelect).toHaveAttribute('required', '');
  });

  test('should close modal on cancel', async ({ page }) => {
    const reportButton = page.locator('button').filter({ hasText: /Report/i }).first();
    await reportButton.click();
    
    await expect(page.getByText(/Report an Issue/i)).toBeVisible();
    
    // Click close/cancel button
    const closeButton = page.locator('button').filter({ hasText: /Cancel|Close/i }).first();
    await closeButton.click();
    
    // Modal should disappear
    await expect(page.getByText(/Report an Issue/i)).not.toBeVisible();
  });
});

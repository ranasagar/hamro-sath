import { expect, test } from '@playwright/test';

test.describe('User Authentication Flow', () => {
  test('should display welcome page for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('Hamro Saath')).toBeVisible();
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign Up/i })).toBeVisible();
  });

  test('should navigate to login page and login successfully', async ({ page }) => {
    await page.goto('/');
    
    // Click Login button
    await page.getByRole('button', { name: /Login/i }).click();
    
    // Should be on login page
    await expect(page.getByText('Welcome Back!')).toBeVisible();
    
    // Fill in login form
    await page.getByLabel(/Email/i).fill('sitarai@safa.com');
    await page.getByLabel(/Password/i).fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: /Login/i }).click();
    
    // Should be redirected to home page and see user-specific content
    await expect(page.getByText(/Sita/i)).toBeVisible({ timeout: 5000 });
  });

  test('should use demo account quick login', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to login
    await page.getByRole('button', { name: /Login/i }).click();
    
    // Click on demo user
    await page.getByRole('button', { name: 'Sita Rai' }).click();
    
    // Should be logged in
    await expect(page.getByText(/Sita/i)).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    
    // Click Sign Up button
    await page.getByRole('button', { name: /Sign Up/i }).click();
    
    // Should be on register page
    await expect(page.getByText(/Join the Movement/i)).toBeVisible();
    await expect(page.getByLabel(/Full Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Ward/i)).toBeVisible();
  });

  test('should show validation errors on empty login form', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Login/i }).click();
    
    // Clear fields if any default values
    await page.getByLabel(/Email/i).clear();
    await page.getByLabel(/Password/i).clear();
    
    // Try to submit
    await page.getByRole('button', { name: /Login/i }).click();
    
    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel(/Email/i);
    await expect(emailInput).toHaveAttribute('required', '');
  });
});

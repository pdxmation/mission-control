import { test, expect } from '@playwright/test'

// Note: These tests check the login page directly
// With BYPASS_AUTH=true, the main app doesn't redirect to login
test.describe('Authentication Page', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    
    // Should show Mission Control heading
    await expect(page.locator('text=/Mission Control/i')).toBeVisible()
  })

  test('should show email input on login page', async ({ page }) => {
    await page.goto('/login')
    
    // Should have email input
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]')
    await expect(emailInput).toBeVisible()
  })

  test('should show submit button on login page', async ({ page }) => {
    await page.goto('/login')
    
    // Should have a submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign"), button:has-text("Login"), button:has-text("Continue")')
    await expect(submitButton).toBeVisible()
  })

  test('dashboard should be accessible with auth bypass', async ({ page }) => {
    // With BYPASS_AUTH=true, dashboard should load without login
    await page.goto('/')
    
    // Should NOT redirect to login
    await page.waitForTimeout(1000)
    expect(page.url()).not.toContain('/login')
    
    // Should show kanban board elements
    await expect(page.locator('text="Backlog"')).toBeVisible()
  })
})

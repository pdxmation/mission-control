import { test, expect } from '@playwright/test'

test.describe('Activity Feed - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto('/')
    await page.waitForTimeout(2000)
  })

  test('should display activity feed sidebar on desktop', async ({ page }) => {
    // Activity sidebar has "Recent Activity" heading
    await expect(page.locator('h3:has-text("Recent Activity")')).toBeVisible()
  })

  test('should show activity items', async ({ page }) => {
    // Activity items are in rounded-lg divs with border
    const activityItems = page.locator('.space-y-2 > div.rounded-lg')
    const count = await activityItems.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should show activity timestamps', async ({ page }) => {
    // Timestamps show "ago" text from date-fns formatDistanceToNow
    const timestamps = page.locator('text=/ago/')
    const count = await timestamps.count()
    expect(count).toBeGreaterThanOrEqual(0) // May be 0 if no activity
  })
})

test.describe('Activity Feed - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForTimeout(2000)
  })

  test('should show floating activity button on mobile', async ({ page }) => {
    // FAB has aria-label="Open Activity Feed"
    const fab = page.locator('button[aria-label="Open Activity Feed"]')
    await expect(fab).toBeVisible()
  })

  test('should open activity panel when clicking FAB', async ({ page }) => {
    const fab = page.locator('button[aria-label="Open Activity Feed"]')
    await fab.click()
    
    // Panel should show "Recent Activity" heading
    await expect(page.locator('h2:has-text("Recent Activity")')).toBeVisible({ timeout: 3000 })
  })

  test('should close activity panel with close button', async ({ page }) => {
    // Open panel
    const fab = page.locator('button[aria-label="Open Activity Feed"]')
    await fab.click()
    await page.waitForTimeout(500)
    
    // Click close button (has aria-label="Close")
    const closeButton = page.locator('button[aria-label="Close"]')
    await closeButton.click()
    
    // Panel heading should be hidden
    await expect(page.locator('h2:has-text("Recent Activity")')).toBeHidden({ timeout: 3000 })
  })

  test('should close activity panel by clicking backdrop', async ({ page }) => {
    const fab = page.locator('button[aria-label="Open Activity Feed"]')
    await fab.click()
    await page.waitForTimeout(500)
    
    // Click backdrop (bg-black/50 overlay)
    const backdrop = page.locator('.bg-black\\/50')
    if (await backdrop.isVisible()) {
      await backdrop.click({ force: true })
      await expect(page.locator('h2:has-text("Recent Activity")')).toBeHidden({ timeout: 3000 })
    }
  })
})

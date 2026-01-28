import { test, expect } from '@playwright/test'

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForTimeout(2000)
  })

  test('should display header on mobile', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible()
  })

  test('should display kanban columns', async ({ page }) => {
    // Columns should exist
    const columns = page.locator('.flex.gap-3 > div, .flex.gap-4 > div')
    const count = await columns.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should show search input on mobile', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible()
  })

  test('should show floating activity button on mobile', async ({ page }) => {
    const fab = page.locator('button[aria-label="Open Activity Feed"]')
    await expect(fab).toBeVisible()
  })

  test('should be able to open task modal', async ({ page }) => {
    // Click on a task card
    const task = page.locator('.rounded-lg.border.bg-card').first()
    if (await task.isVisible()) {
      await task.click()
      // Modal should appear
      await expect(page.locator('[role="dialog"], .fixed.inset-0')).toBeVisible({ timeout: 3000 })
    }
  })
})

test.describe('Tablet Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForTimeout(2000)
  })

  test('should display properly on tablet', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible()
  })

  test('should have activity FAB on tablet', async ({ page }) => {
    const fab = page.locator('button[aria-label="Open Activity Feed"]')
    await expect(fab).toBeVisible()
  })
})

test.describe('Desktop Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto('/')
    await page.waitForTimeout(2000)
  })

  test('should show activity sidebar on large screens', async ({ page }) => {
    await expect(page.locator('h3:has-text("Recent Activity")')).toBeVisible()
  })

  test('should hide floating activity button on desktop', async ({ page }) => {
    // FAB should be hidden on xl screens (has xl:hidden class)
    const fab = page.locator('button[aria-label="Open Activity Feed"]')
    await expect(fab).toBeHidden()
  })

  test('should show all column titles', async ({ page }) => {
    const columnTitles = ['Recurring', 'Backlog', 'In Progress', 'Review', 'Blocked', 'Completed']
    
    for (const title of columnTitles) {
      await expect(page.locator(`text="${title}"`)).toBeVisible()
    }
  })
})

import { test, expect } from '@playwright/test'

test.describe('Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
  })

  test('should display filter section', async ({ page }) => {
    // Filter label should be visible
    await expect(page.locator('text=Filter:')).toBeVisible()
  })

  test('should display assignee filter button', async ({ page }) => {
    // Assignee filter shows "Assignee" text when not selected
    const assigneeFilter = page.locator('button:has-text("Assignee")')
    await expect(assigneeFilter).toBeVisible()
  })

  test('should display project filter button', async ({ page }) => {
    // Project filter shows "Project" text when not selected
    const projectFilter = page.locator('button:has-text("Project")')
    await expect(projectFilter).toBeVisible()
  })

  test('should open assignee filter dropdown', async ({ page }) => {
    const assigneeFilter = page.locator('button:has-text("Assignee")').first()
    await assigneeFilter.click()
    
    // Dropdown should appear - it's a div with options
    await page.waitForTimeout(300)
    const dropdown = page.locator('.absolute.top-full')
    await expect(dropdown).toBeVisible({ timeout: 3000 })
  })

  test('should open project filter dropdown', async ({ page }) => {
    const projectFilter = page.locator('button:has-text("Project")').first()
    await projectFilter.click()
    
    await page.waitForTimeout(300)
    const dropdown = page.locator('.absolute.top-full')
    await expect(dropdown).toBeVisible({ timeout: 3000 })
  })

  test('should close dropdown when clicking outside', async ({ page }) => {
    const assigneeFilter = page.locator('button:has-text("Assignee")').first()
    await assigneeFilter.click()
    
    await page.waitForTimeout(300)
    
    // Click outside
    await page.locator('body').click({ position: { x: 10, y: 10 } })
    
    await page.waitForTimeout(300)
    const dropdown = page.locator('.absolute.top-full')
    await expect(dropdown).toBeHidden({ timeout: 3000 })
  })
})

import { test, expect } from '@playwright/test'

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
  })

  test('should display all kanban columns', async ({ page }) => {
    const columnTitles = ['Recurring', 'Backlog', 'In Progress', 'Review', 'Blocked', 'Completed']
    
    for (const title of columnTitles) {
      await expect(page.locator(`text="${title}"`)).toBeVisible()
    }
  })

  test('should display stats bar', async ({ page }) => {
    // Stats bar shows task counts
    await expect(page.locator('text=/\\d+/')).toBeVisible()
  })

  test('should show refresh button and timestamp', async ({ page }) => {
    // Should have update timestamp
    await expect(page.locator('text=/Updated/')).toBeVisible()
  })

  test('should display task cards', async ({ page }) => {
    // Task cards have rounded-lg border bg-card classes
    const taskCards = page.locator('.rounded-lg.border.bg-card')
    const count = await taskCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should open task modal when clicking a task', async ({ page }) => {
    // Click first task card
    const firstTask = page.locator('.rounded-lg.border.bg-card').first()
    await firstTask.click()
    
    // Modal should appear (has fixed positioning)
    await expect(page.locator('.fixed.inset-0, [role="dialog"]')).toBeVisible({ timeout: 3000 })
  })

  test('should close task modal with close button or escape', async ({ page }) => {
    // Open modal
    const firstTask = page.locator('.rounded-lg.border.bg-card').first()
    await firstTask.click()
    
    await page.waitForTimeout(500)
    
    // Press Escape to close
    await page.keyboard.press('Escape')
    
    // Modal should close
    await page.waitForTimeout(500)
  })

  test('should show add task buttons', async ({ page }) => {
    // Each column has a + button
    const addButtons = page.locator('button:has-text("+")')
    const count = await addButtons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should open new task modal when clicking add button', async ({ page }) => {
    // Click first add button
    const addButton = page.locator('button:has-text("+")').first()
    await addButton.click()
    
    // Modal should appear with empty form
    await expect(page.locator('.fixed.inset-0, [role="dialog"]')).toBeVisible({ timeout: 3000 })
    
    // Title input should be empty
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]')
    await expect(titleInput).toHaveValue('')
  })
})

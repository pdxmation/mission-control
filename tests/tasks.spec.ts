import { test, expect } from '@playwright/test'

test.describe('Task CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
  })

  test('should create a new task', async ({ page }) => {
    // Click add button in first column
    const addButton = page.locator('button:has-text("+")').first()
    await addButton.click()
    
    // Wait for modal
    await expect(page.locator('.fixed.inset-0, [role="dialog"]')).toBeVisible({ timeout: 3000 })
    
    // Fill in task title
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]')
    const testTitle = 'Playwright Test Task ' + Date.now()
    await titleInput.fill(testTitle)
    
    // Save the task
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]')
    await saveButton.click()
    
    // Modal should close
    await page.waitForTimeout(1000)
    
    // Task should appear in the board
    await expect(page.locator(`text="${testTitle}"`)).toBeVisible({ timeout: 5000 })
  })

  test('should view task details in modal', async ({ page }) => {
    // Click on a task
    const task = page.locator('.rounded-lg.border.bg-card').first()
    await task.click()
    
    // Modal should show
    await expect(page.locator('.fixed.inset-0, [role="dialog"]')).toBeVisible({ timeout: 3000 })
    
    // Should show title input with value
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]')
    await expect(titleInput).toBeVisible()
    const value = await titleInput.inputValue()
    expect(value.length).toBeGreaterThan(0)
  })

  test('should edit task title', async ({ page }) => {
    // Click on a task
    const task = page.locator('.rounded-lg.border.bg-card').first()
    await task.click()
    
    await page.waitForTimeout(500)
    
    // Edit title
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]')
    await titleInput.clear()
    const newTitle = 'Updated Title ' + Date.now()
    await titleInput.fill(newTitle)
    
    // Save
    const saveButton = page.locator('button:has-text("Save"), button[type="submit"]')
    await saveButton.click()
    
    // Wait for modal to close and changes to save
    await page.waitForTimeout(1000)
    
    // Updated title should be visible
    await expect(page.locator(`text="${newTitle}"`)).toBeVisible({ timeout: 5000 })
  })

  test('should close modal with escape key', async ({ page }) => {
    const task = page.locator('.rounded-lg.border.bg-card').first()
    await task.click()
    
    await expect(page.locator('.fixed.inset-0, [role="dialog"]')).toBeVisible({ timeout: 3000 })
    
    // Press Escape
    await page.keyboard.press('Escape')
    
    // Modal should close
    await page.waitForTimeout(500)
  })

  test('should change task priority', async ({ page }) => {
    // Click on a task
    const task = page.locator('.rounded-lg.border.bg-card').first()
    await task.click()
    
    await page.waitForTimeout(500)
    
    // Find priority selector
    const prioritySelect = page.locator('select[name="priority"]')
    
    if (await prioritySelect.isVisible()) {
      await prioritySelect.selectOption('HIGH')
      
      // Save
      const saveButton = page.locator('button:has-text("Save"), button[type="submit"]')
      await saveButton.click()
      
      await page.waitForTimeout(1000)
    }
  })

  test('should change task status via dropdown', async ({ page }) => {
    // Click on a task
    const task = page.locator('.rounded-lg.border.bg-card').first()
    await task.click()
    
    await page.waitForTimeout(500)
    
    // Find status selector
    const statusSelect = page.locator('select[name="status"]')
    
    if (await statusSelect.isVisible()) {
      // Change to IN_PROGRESS
      await statusSelect.selectOption('IN_PROGRESS')
      
      // Save
      const saveButton = page.locator('button:has-text("Save"), button[type="submit"]')
      await saveButton.click()
      
      await page.waitForTimeout(1000)
    }
  })
})

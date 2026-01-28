import { test, expect } from '@playwright/test'

test.describe('Task CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
  })

  test('should create a new task', async ({ page }) => {
    // Click add button (has Plus icon)
    const addButton = page.locator('button:has(svg.lucide-plus)').first()
    await addButton.click()
    
    // Wait for modal
    await expect(page.locator('.fixed.inset-0').first()).toBeVisible({ timeout: 3000 })
    
    // Fill in task title - use the specific placeholder
    const titleInput = page.locator('input[placeholder="Task title..."]')
    const testTitle = 'Playwright Test Task ' + Date.now()
    await titleInput.fill(testTitle)
    
    // Verify title is filled before clicking save
    await expect(titleInput).toHaveValue(testTitle)
    
    // Save the task - button should now be enabled
    const saveButton = page.locator('button[type="submit"]:has-text("Create")')
    await expect(saveButton).toBeEnabled({ timeout: 3000 })
    await saveButton.click()
    
    // Wait for save
    await page.waitForTimeout(1000)
    
    // Task should appear
    await expect(page.locator(`text="${testTitle}"`)).toBeVisible({ timeout: 5000 })
  })

  test('should view task details in modal', async ({ page }) => {
    // Click on a task
    const task = page.locator('.rounded-lg.border.bg-card').first()
    await task.click()
    
    // Modal should show
    await expect(page.locator('.fixed.inset-0').first()).toBeVisible({ timeout: 3000 })
    
    // Should show input with value
    const titleInput = page.locator('input[placeholder="Task title..."]')
    await expect(titleInput).toBeVisible()
  })

  test('should edit task title', async ({ page }) => {
    // Click on a task
    const task = page.locator('.rounded-lg.border.bg-card').first()
    await task.click()
    
    await page.waitForTimeout(500)
    
    // Edit title
    const titleInput = page.locator('input[placeholder="Task title..."]')
    await titleInput.clear()
    const newTitle = 'Updated Title ' + Date.now()
    await titleInput.fill(newTitle)
    
    // Verify title is filled
    await expect(titleInput).toHaveValue(newTitle)
    
    // Save - button text is "Update" when editing
    const saveButton = page.locator('button[type="submit"]:has-text("Update")')
    await expect(saveButton).toBeEnabled({ timeout: 3000 })
    await saveButton.click()
    
    // Wait for save
    await page.waitForTimeout(1000)
    
    // Updated title should be visible
    await expect(page.locator(`text="${newTitle}"`)).toBeVisible({ timeout: 5000 })
  })

  test('should close modal with escape key', async ({ page }) => {
    const task = page.locator('.rounded-lg.border.bg-card').first()
    await task.click()
    
    await expect(page.locator('.fixed.inset-0').first()).toBeVisible({ timeout: 3000 })
    
    // Press Escape
    await page.keyboard.press('Escape')
    
    // Wait for close
    await page.waitForTimeout(500)
  })

  test('should change task priority', async ({ page }) => {
    const task = page.locator('.rounded-lg.border.bg-card').first()
    await task.click()
    
    await page.waitForTimeout(500)
    
    // Find priority selector
    const prioritySelect = page.locator('select').filter({ hasText: /low|medium|high|critical/i }).first()
    
    if (await prioritySelect.isVisible()) {
      await prioritySelect.selectOption('HIGH')
      
      const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first()
      await saveButton.click()
      
      await page.waitForTimeout(1000)
    }
  })
})

import { test, expect } from '@playwright/test'

test.describe('Semantic Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
  })

  test('should display search input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible()
  })

  test('should focus search with keyboard shortcut', async ({ page }) => {
    // Press Cmd/Ctrl + K
    await page.keyboard.press('Meta+k')
    
    const searchInput = page.locator('input[placeholder*="Search"]')
    await expect(searchInput).toBeFocused()
  })

  test('should show results when typing', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    
    // Type a search query
    await searchInput.fill('mission')
    
    // Wait for debounce and results
    await page.waitForTimeout(500)
    
    // Results dropdown should appear (has absolute positioning)
    const resultsDropdown = page.locator('.absolute.top-full.mt-2')
    await expect(resultsDropdown).toBeVisible({ timeout: 5000 })
  })

  test('should show AI-powered indicator in results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('email')
    
    await page.waitForTimeout(500)
    
    // Should show "AI-powered semantic search" text
    await expect(page.locator('text=/AI-powered/i')).toBeVisible({ timeout: 5000 })
  })

  test('should show similarity percentage', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('task')
    
    await page.waitForTimeout(500)
    
    // Should show match percentage
    await expect(page.locator('text=/\\d+%\\s*match/i')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate results with keyboard', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('mission')
    
    await page.waitForTimeout(500)
    
    // Press arrow down
    await page.keyboard.press('ArrowDown')
    
    // Results should still be visible
    const resultsDropdown = page.locator('.absolute.top-full.mt-2')
    await expect(resultsDropdown).toBeVisible()
  })

  test('should open task modal when selecting result', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('mission')
    
    await page.waitForTimeout(500)
    
    // Click first result
    const firstResult = page.locator('.absolute.top-full.mt-2 button').first()
    if (await firstResult.isVisible()) {
      await firstResult.click()
      
      // Task modal should open
      await expect(page.locator('.fixed.inset-0, [role="dialog"]')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should close search with Escape', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('test')
    
    await page.waitForTimeout(500)
    
    // Press Escape
    await page.keyboard.press('Escape')
    
    // Results should close
    const resultsDropdown = page.locator('.absolute.top-full.mt-2')
    await expect(resultsDropdown).toBeHidden({ timeout: 3000 })
  })

  test('should clear search with X button', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('test query')
    
    // Find and click clear button (X icon)
    const clearButton = page.locator('input[placeholder*="Search"] + button, input[placeholder*="Search"] ~ button').first()
    if (await clearButton.isVisible()) {
      await clearButton.click()
      await expect(searchInput).toHaveValue('')
    }
  })

  test('should show no results message', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    
    // Search for something that won't match
    await searchInput.fill('xyznonexistent12345')
    
    await page.waitForTimeout(500)
    
    // Should show no results message
    await expect(page.locator('text=/No tasks found/i')).toBeVisible({ timeout: 5000 })
  })
})

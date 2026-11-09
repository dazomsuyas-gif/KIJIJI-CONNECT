import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('homepage has core content and no serious accessibility violations', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('link', { name: /marketplace/i }).first()).toBeVisible()

  const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze()
  expect(results.violations.filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')).toEqual([])
})

test('mobile menu opens and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const menu = page.getByRole('button', { name: 'Menu' })
  await menu.click()
  await expect(page.locator('#primary-navigation')).toHaveClass(/is-open/)
  await page.keyboard.press('Escape')
  await expect(page.locator('#primary-navigation')).not.toHaveClass(/is-open/)
})

test('marketplace search and cart checkout preview work', async ({ page }) => {
  await page.goto('/marketplace')
  await page.getByRole('searchbox', { name: /search products and suppliers/i }).fill('avocado')
  await expect(page.locator('.product-card').filter({ hasText: /avocado/i }).first()).toBeVisible()
  await page.getByRole('button', { name: /add .* to cart/i }).first().click()
  await page.getByRole('link', { name: /open cart/i }).click()
  await expect(page.getByRole('heading', { name: /cart/i })).toBeVisible()
  await page.locator('.market-cart-total:visible button').click({ force: true })
  await expect(page.getByText(/simulation-only|sandbox checkout|simulated/i).first()).toBeVisible()
})

test('seller accepts and sends an order and orders show balance and destination', async ({ page }) => {
  await page.goto('/marketplace')
  await page.getByRole('button', { name: /add .* to cart/i }).first().click()
  await page.getByRole('link', { name: /open cart/i }).click()
  await expect(page.getByRole('heading', { name: /cart/i })).toBeVisible()
  await page.locator('.market-cart-total:visible button').click({ force: true })
  const mobileMoney = page.getByLabel(/mobile money number/i)
  if (await mobileMoney.isVisible()) await mobileMoney.fill('+255700000000')
  await page.getByRole('button', { name: /simulate payment/i }).click()
  await page.goto('/orders')
  await expect(page.getByText(/balance/i).first()).toBeVisible()
  await expect(page.getByText(/delivery destination/i).first()).toBeVisible()
  await page.goto('/seller')
  await expect(page.getByRole('button', { name: /accept good/i })).toBeVisible()
  await page.getByRole('button', { name: /accept good/i }).click()
  await page.getByRole('button', { name: /send good/i }).click()
})

test('travel enquiry is review-only', async ({ page }) => {
  await page.goto('/travel')
  await expect(page.getByRole('heading', { name: /one thoughtful starting point/i })).toBeVisible()
  await page.getByRole('tab', { name: /stays/i }).click()
  await page.getByRole('button', { name: /request details/i }).first().click()
  await expect(page.getByText(/does not send a message|not reserved|illustrative/i).first()).toBeVisible()
})

test('learning quiz, assistant confirmation, dark mode and 404 work', async ({ page }) => {
  await page.goto('/learning')
  await expect(page.getByRole('heading').first()).toBeVisible()
  const assessment = page.getByRole('button', { name: /assessment|quiz|check answers/i }).first()
  if (await assessment.isVisible()) {
    await assessment.click()
    const option = page.locator('input[type="radio"]').first()
    if (await option.isVisible()) await option.check()
  }
  await page.goto('/')
  await page.getByRole('button', { name: /dark|light/i }).click()
  await expect(page.locator('.app-shell')).toHaveAttribute('data-theme', 'dark')
  await page.goto('/assistant')
  await expect(page.getByText(/local rules|not a connected ai/i).first()).toBeVisible()
  await page.goto('/does-not-exist')
  await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible()
})

test('story draft and community post remain local and reviewable', async ({ page }) => {
  await page.goto('/stories')
  const storyForm = page.locator('article.phase-card').filter({ hasText: 'Write a story' }).locator('form')
  await storyForm.getByLabel('Title', { exact: true }).fill('My Arusha day trip')
  await storyForm.getByLabel('Story text').fill('A local example story prepared for review.')
  await storyForm.getByRole('button', { name: /save for moderation/i }).click()
  await expect(page.locator('.story-card').filter({ hasText: 'My Arusha day trip' }).getByText(/pending review/i)).toBeVisible()
  await page.goto('/community')
  const communityForm = page.locator('form').filter({ hasText: 'Publish to this browser' })
  await communityForm.getByLabel('Title', { exact: true }).fill('A useful community idea')
  await communityForm.getByLabel('Your post').fill('This post is stored only in this browser.')
  await communityForm.getByRole('button', { name: /publish to this browser/i }).click()
  await expect(page.getByRole('heading', { name: 'A useful community idea' })).toBeVisible()
})

test('habit challenge saves a daily check-in locally', async ({ page }) => {
  await page.goto('/stories')
  await page.getByLabel('What small action will you practise?').fill('Read one page after breakfast')
  await page.getByRole('button', { name: 'Start my 7 days' }).click()
  await expect(page.getByText('Your action: Read one page after breakfast')).toBeVisible()
  await page.getByRole('button', { name: 'Check in for today' }).click()
  await expect(page.getByRole('button', { name: 'Checked in today' })).toBeDisabled()
  await expect(page.getByText('1 of 7 daily check-ins complete')).toBeVisible()
  await page.reload()
  await expect(page.getByText('Your action: Read one page after breakfast')).toBeVisible()
  await expect(page.getByText('1 of 7 daily check-ins complete')).toBeVisible()
})

test('keyboard navigation exposes visible focus', async ({ page }) => {
  await page.goto('/')
  for (let index = 0; index < 8; index += 1) await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toBeVisible()
})

test('required viewport widths do not overflow horizontally', async ({ page }) => {
  for (const width of [320, 390, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1)
  }
})

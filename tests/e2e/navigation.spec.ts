import { expect, test } from '@playwright/test'

test('navigates from home to image editor', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'WebToolbox' })).toBeVisible()

  await page.getByRole('link', { name: '图片编辑' }).first().click()

  await expect(page).toHaveURL(/\/tools\/image-editor$/)
  await expect(page.getByRole('heading', { name: '图片编辑' })).toBeVisible()
})

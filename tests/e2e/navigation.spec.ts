import { expect, test } from '@playwright/test'

test('navigates from overview to image text tool', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '分类总览' })).toBeVisible()

  await page.getByRole('link', { name: '进入分类' }).first().click()
  await expect(page).toHaveURL(/\/categories\/image$/)
  await expect(page.getByRole('heading', { name: '图片', exact: true })).toBeVisible()

  const [toolPage] = await Promise.all([
    page.context().waitForEvent('page'),
    page.getByRole('link', { name: '打开工具' }).first().click(),
  ])

  await toolPage.waitForLoadState('domcontentloaded')
  await expect(toolPage).toHaveURL(/\/tools\/image-text-edit$/)
  await expect(toolPage.getByRole('heading', { name: '图片文本编辑' })).toBeVisible()
})

test('opens direct tool from sidebar and renders in main area', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: '文本计数器' }).click()
  await expect(page).toHaveURL(/\/tools\/text-counter$/)
  await expect(page.getByRole('heading', { name: '文本计数器' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '参数面板' })).toHaveCount(0)
})

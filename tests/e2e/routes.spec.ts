import { expect, test } from '@playwright/test'

for (const route of [
  ['/', 'Планируйте отпуск и выплаты'],
  ['/vacation', 'Выгодный отпуск 2026'],
  ['/salary', 'Сколько и когда придёт'],
] as const) {
  test(`${route[0]} renders and hydrates`, async ({ page }) => {
    await page.goto(route[0])
    await expect(page.getByRole('heading', { level: 1 })).toContainText(route[1])
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru-RU')
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  })
}

test('salary inputs update the result', async ({ page }) => {
  await page.goto('/salary')
  const income = page.getByLabel('Доход в месяц')
  await income.fill('200000')
  await income.blur()
  await expect(
    page.getByText('2 088 000 ₽', { exact: true }).first(),
  ).toBeVisible()
})

test('vacation opens a month detail', async ({ page }) => {
  await page.goto('/vacation')
  await page.getByRole('button', { name: /Май/ }).first().click()
  await expect(page.getByRole('heading', { name: 'Май 2026' })).toBeVisible()
  await expect(page.getByText(/Выбирать можно только рабочие дни/)).toBeVisible()
})

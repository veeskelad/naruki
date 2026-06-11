import { expect, test } from '@playwright/test'
import ExcelJS from 'exceljs'

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

test('salary XLSX includes edited workday counts', async ({ page }) => {
  await page.goto('/salary')
  await page.getByRole('button', { name: 'Показать предпросмотр таблицы' }).click()
  await page
    .getByRole('button', {
      name: 'Изменить количество рабочих дней для 1 — 15 в января 2026',
    })
    .click()
  await page.getByRole('spinbutton', { name: 'Рабочие дни для 1 — 15' }).fill('0')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Скачать таблицу' }).click()
  const download = await downloadPromise
  const path = await download.path()
  expect(path).not.toBeNull()

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(path!)
  const monthly = workbook.getWorksheet('Помесячно')!

  expect(monthly.getCell('C5').value).toBe(0)
  expect(monthly.getCell('I5').value).toMatchObject({
    formula: 'ROUND(87000*E5,0)',
    result: 63800,
  })
})

test('child deduction follows the selected child count', async ({ page }) => {
  await page.goto('/salary')

  const deduction = page.getByRole('checkbox', {
    name: 'Учитывать стандартный вычет на детей',
  })

  await expect(deduction).toBeDisabled()
  await expect(deduction).not.toBeChecked()

  await page.getByRole('button', { name: '1', exact: true }).click()
  await expect(deduction).toBeEnabled()
  await expect(deduction).toBeChecked()

  await page.getByRole('button', { name: 'нет', exact: true }).click()
  await expect(deduction).toBeDisabled()
  await expect(deduction).not.toBeChecked()
})

test('vacation opens a month detail', async ({ page }) => {
  await page.goto('/vacation')
  await page.getByRole('button', { name: /Май/ }).first().click()
  await expect(page.getByRole('heading', { name: 'Май 2026' })).toBeVisible()
  await expect(page.getByText(/Выбирать можно только рабочие дни/)).toBeVisible()
})

test('vacation starts without a preselected range and supports drag selection', async ({
  page,
}) => {
  await page.goto('/vacation')

  await expect(
    page.getByText(
      'Выберите рекомендацию или откройте месяц и отметьте дни вручную.',
    ),
  ).toBeVisible()

  const topRecommendation = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Лучшие варианты' }) })
    .locator('button')
    .first()
  await expect(topRecommendation).toHaveClass(/border-emerald-200/)

  await page.getByRole('button', { name: /Май/ }).first().click()
  const day4 = page.getByRole('button', { name: /^4 май:/ })
  const day5 = page.getByRole('button', { name: /^5 май:/ })
  const day6 = page.getByRole('button', { name: /^6 май:/ })
  const day7 = page.getByRole('button', { name: /^7 май:/ })
  const day8 = page.getByRole('button', { name: /^8 май:/ })

  await day4.scrollIntoViewIfNeeded()
  const boxes = await Promise.all(
    [day4, day5, day6, day7, day8].map((locator) => locator.boundingBox()),
  )

  boxes.forEach((box) => expect(box).not.toBeNull())

  await page.mouse.move(
    boxes[0]!.x + boxes[0]!.width / 2,
    boxes[0]!.y + boxes[0]!.height / 2,
  )
  await page.mouse.down()
  for (const box of boxes.slice(1)) {
    await page.mouse.move(
      box!.x + box!.width / 2,
      box!.y + box!.height / 2,
    )
  }
  await page.mouse.up()

  await expect(day4).toHaveAttribute('aria-pressed', 'true')
  await expect(
    page.getByRole('button', { name: /^5 май:/ }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(
    page.getByRole('button', { name: /^8 май:/ }),
  ).toHaveAttribute('aria-pressed', 'true')
})

test('FAQ starts with only the first item open and keeps its desktop columns separated', async ({
  page,
}, testInfo) => {
  await page.goto('/')

  const triggers = page.locator('[data-slot="accordion-trigger"]')
  const contents = page.locator('[data-slot="accordion-content"]')

  await expect(triggers).toHaveCount(5)
  expect(
    await triggers.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('aria-expanded')),
    ),
  ).toEqual(['true', 'false', 'false', 'false', 'false'])
  await expect(contents.first()).toBeVisible()
  await expect(contents.nth(1)).toBeHidden()

  await triggers.first().click()
  await expect(contents.first()).toBeHidden()
  await triggers.nth(1).click()
  await expect(contents.nth(1)).toBeVisible()

  if (testInfo.project.name === 'chromium') {
    const headingBox = await page
      .getByRole('heading', { name: 'Часто спрашивают' })
      .boundingBox()
    const accordionBox = await page
      .locator('[data-slot="accordion"]')
      .boundingBox()

    expect(headingBox).not.toBeNull()
    expect(accordionBox).not.toBeNull()
    expect(headingBox!.x + headingBox!.width).toBeLessThan(accordionBox!.x)
  }
})

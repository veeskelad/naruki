import type { SalaryInput, YearSalaryResult } from '@/lib/salary'
import { downloadBlob } from './download'
import type { Borders, Cell, Row, Worksheet } from 'exceljs'

const MODE_LABELS = {
  tk_rf: 'ТК РФ',
  npd: 'Самозанятый (НПД)',
  usn_6: 'ИП УСН 6%',
  custom: 'Своя ставка',
} as const

const COLORS = {
  navy: '1E293B',
  slate: '475569',
  muted: '64748B',
  border: 'D7E0EA',
  soft: 'F8FAFC',
  softGreen: 'ECFDF5',
  green: '2F855A',
  greenDark: '166534',
  greenText: '0F5132',
  gold: 'FDE68A',
  amber: 'B45309',
  red: 'B91C1C',
  white: 'FFFFFF',
} as const

const RUB_FMT = '# ##0 ₽;[Red]-# ##0 ₽;–'
export async function exportSalaryXlsx(
  input: SalaryInput,
  result: YearSalaryResult,
): Promise<void> {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'На руки'
  workbook.created = new Date()
  workbook.calcProperties.fullCalcOnLoad = true

  const summary = workbook.addWorksheet('Сводка', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 6 }],
  })
  const months = workbook.addWorksheet('Помесячно', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 4 }],
  })
  const events = workbook.addWorksheet('Выплаты', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
  })

  buildSummarySheet(summary, input, result)
  buildMonthlySheet(months, input, result)
  buildEventsSheet(events, input, result)

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `salary-${input.mode}-${input.year}.xlsx`,
  )
}

function buildSummarySheet(
  sheet: Worksheet,
  input: SalaryInput,
  result: YearSalaryResult,
) {
  sheet.properties.defaultRowHeight = 22
  sheet.columns = [
    { width: 18 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
  ]
  sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 6, showGridLines: false }]

  sheet.mergeCells('A1:F1')
  sheet.getCell('A1').value = 'Сколько и когда придёт'
  styleHeroTitle(sheet.getCell('A1'))

  sheet.mergeCells('A2:F2')
  sheet.getCell('A2').value = `Зарплата ${input.year} · ${MODE_LABELS[input.mode]} · Excel-отчёт`
  styleSubtitle(sheet.getCell('A2'))

  const metrics = [
    {
      label: 'На руки за год',
      value: formatMoney(result.totals.net),
      note: 'Чистыми после всех удержаний',
      fill: COLORS.green,
      text: COLORS.white,
    },
    {
      label: 'Среднее в месяц',
      value: formatMoney(result.averageMonthlyNet),
      note: 'С учётом рабочих дней и графика выплат',
      fill: COLORS.soft,
      text: COLORS.navy,
    },
    {
      label: 'Налог + взносы',
      value: formatMoney(result.totals.tax + result.totals.contributions),
      note: `Эффективная нагрузка ${formatPercent(result.totals.effectiveRate)}`,
      fill: COLORS.soft,
      text: COLORS.navy,
    },
    {
      label: 'Доход до налогов',
      value: formatMoney(result.totals.gross),
      note: 'Годовой gross по сценарию',
      fill: COLORS.softGreen,
      text: COLORS.greenDark,
    },
  ]

  const cardRanges = ['A4:B6', 'C4:D6', 'E4:F6', 'A8:B10']
  metrics.forEach((metric, index) => {
    const range = cardRanges[index]
    sheet.mergeCells(range)
    const cell = sheet.getCell(range.split(':')[0])
    cell.value = metric.label + '\n' + metric.value + '\n' + metric.note
    styleMetricCard(cell, metric.fill, metric.text)
  })
  sheet.getRow(4).height = 18
  sheet.getRow(5).height = 28
  sheet.getRow(6).height = 18
  sheet.getRow(8).height = 18
  sheet.getRow(9).height = 28
  sheet.getRow(10).height = 18

  sheet.mergeCells('C8:F10')
  const notes = sheet.getCell('C8')
  notes.value =
    'Как читать файл\nЛист «Помесячно» показывает расчёт по каждому месяцу. Лист «Выплаты» содержит график поступлений с датами переноса на предыдущий рабочий день. Файл можно сразу отправить в бухгалтерию или открыть в Excel / Google Sheets.'
  styleNoteCard(notes)

  sheet.getCell('A12').value = 'Параметры расчёта'
  styleSectionLabel(sheet.getCell('A12'))
  sheet.getCell('A13').value = 'Параметр'
  sheet.getCell('B13').value = 'Значение'
  sheet.getCell('C13').value = 'Параметр'
  sheet.getCell('D13').value = 'Значение'
  sheet.getCell('E13').value = 'Параметр'
  sheet.getCell('F13').value = 'Значение'
  styleTableHeaderRow(sheet.getRow(13))

  const details = [
    ['Год', String(input.year)],
    ['Режим', MODE_LABELS[input.mode]],
    ['Доход', formatMoney(input.amount)],
    ['Форма', input.amountMode === 'gross' ? 'До налогов' : 'На руки'],
    ['Дети', String(input.children ?? 0)],
    ['Прогрессивный НДФЛ', input.useProgressiveTax ? 'Да' : 'Нет'],
    ['Вычет на детей', input.useChildDeduction ? 'Да' : 'Нет'],
    ['Аванс', `${input.paymentSchedule?.advanceDay ?? 25}-го`],
    ['Зарплата', `${input.paymentSchedule?.salaryDay ?? 10}-го`],
    ['НПД доля бизнеса', `${input.npdBusinessShare ?? 0}%`],
    ['Своя ставка', `${input.customRate ?? 0}%`],
    ['Фикс. взносы УСН', formatMoney(input.usnFixedContributions ?? 0)],
  ]

  const rows = [14, 15, 16, 17, 18, 19]
  rows.forEach((rowNumber, idx) => {
    const left = details[idx * 2]
    const right = details[idx * 2 + 1]
    if (left) {
      sheet.getCell(`A${rowNumber}`).value = left[0]
      sheet.getCell(`B${rowNumber}`).value = left[1]
    }
    if (right) {
      sheet.getCell(`C${rowNumber}`).value = right[0]
      sheet.getCell(`D${rowNumber}`).value = right[1]
    }
    if (details[idx * 2 + 2]) {
      sheet.getCell(`E${rowNumber}`).value = details[idx * 2 + 2][0]
      sheet.getCell(`F${rowNumber}`).value = details[idx * 2 + 2][1]
    }
  })
  sheet.getCell('A20').value = 'Примечание'
  sheet.getCell('B20').value =
    'Числа рассчитываются локально в браузере. Даты выплат сдвигаются на предыдущий рабочий день, если попадают на выходной или праздник.'
  sheet.mergeCells('B20:F20')
  styleMutedNote(sheet.getCell('B20'))
  sheet.getRow(20).height = 34

  styleDetailTable(sheet, 14, 19)
}

function buildMonthlySheet(
  sheet: Worksheet,
  input: SalaryInput,
  result: YearSalaryResult,
) {
  const monthNames = new Intl.DateTimeFormat('ru-RU', { month: 'long' })
  sheet.columns = [
    { width: 20 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 16 },
    { width: 16 },
  ]
  sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4, showGridLines: false }]

  sheet.mergeCells('A1:F1')
  sheet.getCell('A1').value = 'Помесячный расчёт'
  styleHeroTitle(sheet.getCell('A1'))
  sheet.mergeCells('A2:F2')
  sheet.getCell('A2').value =
    'Суммы показаны по месяцам. Итоговая строка выделена для быстрой проверки годового результата.'
  styleSubtitle(sheet.getCell('A2'))

  const headerRow = sheet.getRow(4)
  headerRow.getCell(1).value = 'Месяц'
  headerRow.getCell(2).value = 'До налогов'
  headerRow.getCell(3).value = 'Налог'
  headerRow.getCell(4).value = 'Взносы'
  headerRow.getCell(5).value = 'На руки'
  styleTableHeaderRow(headerRow)

  result.months.forEach((month, index) => {
    const row = sheet.addRow([
      `${monthNames.format(new Date(input.year, month.month, 1))}`,
      month.gross,
      month.tax,
      month.contributions,
      month.net,
    ])
    const isOdd = index % 2 === 0
    styleDataRow(row, isOdd)
    row.getCell(2).numFmt = RUB_FMT
    row.getCell(3).numFmt = RUB_FMT
    row.getCell(4).numFmt = RUB_FMT
    row.getCell(5).numFmt = RUB_FMT
  })

  const totalRow = sheet.addRow([
    'Итого за год',
    result.totals.gross,
    result.totals.tax,
    result.totals.contributions,
    result.totals.net,
  ])
  styleTotalRow(totalRow)
  totalRow.getCell(2).numFmt = RUB_FMT
  totalRow.getCell(3).numFmt = RUB_FMT
  totalRow.getCell(4).numFmt = RUB_FMT
  totalRow.getCell(5).numFmt = RUB_FMT

  sheet.autoFilter = { from: 'A4', to: 'E17' }
}

function buildEventsSheet(
  sheet: Worksheet,
  input: SalaryInput,
  result: YearSalaryResult,
) {
  sheet.columns = [
    { width: 14 },
    { width: 16 },
    { width: 12 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 18 },
  ]
  sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 3, showGridLines: false }]

  sheet.mergeCells('A1:G1')
  sheet.getCell('A1').value = 'График поступлений'
  styleHeroTitle(sheet.getCell('A1'))
  sheet.mergeCells('A2:G2')
  sheet.getCell('A2').value =
    'Платёж переносится на предыдущий рабочий день, если дата выпадает на выходной или праздник.'
  styleSubtitle(sheet.getCell('A2'))

  const headerRow = sheet.getRow(3)
  headerRow.getCell(1).value = 'Дата'
  headerRow.getCell(2).value = 'Тип'
  headerRow.getCell(3).value = 'Месяц'
  headerRow.getCell(4).value = 'Гросс'
  headerRow.getCell(5).value = 'Удержано'
  headerRow.getCell(6).value = 'На руки'
  headerRow.getCell(7).value = 'Сдвиг'
  styleTableHeaderRow(headerRow)

  const monthNames = new Intl.DateTimeFormat('ru-RU', { month: 'short' })
  result.events.forEach((event, index) => {
    const row = sheet.addRow([
      excelDate(event.date),
      event.kind,
      `${monthNames.format(new Date(input.year, event.forMonth, 1))}`,
      event.gross,
      event.tax,
      event.net,
      event.shifted ? 'Да' : 'Нет',
    ])
    styleDataRow(row, index % 2 === 0)
    row.getCell(1).numFmt = 'dd mmm yyyy'
    if (event.shifted) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLORS.gold },
        }
      })
    }
    row.getCell(4).numFmt = RUB_FMT
    row.getCell(5).numFmt = RUB_FMT
    row.getCell(6).numFmt = RUB_FMT
  })

  sheet.autoFilter = { from: 'A3', to: 'G3' }
}

function styleHeroTitle(cell: Cell) {
  cell.font = {
    name: 'Arial',
    size: 20,
    bold: true,
    color: { argb: COLORS.navy },
  }
  cell.alignment = { vertical: 'middle', horizontal: 'left' }
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.white },
  }
}

function styleSubtitle(cell: Cell) {
  cell.font = {
    name: 'Arial',
    size: 11,
    color: { argb: COLORS.slate },
  }
  cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
}

function styleMetricCard(cell: Cell, fillColor: string, textColor: string) {
  const [label, value, note] = String(cell.value).split('\n')
  cell.value = {
    richText: [
      {
        text: `${label}\n`,
        font: {
          name: 'Arial',
          size: 10,
          bold: true,
          color: { argb: textColor },
        },
      },
      {
        text: `${value}\n`,
        font: {
          name: 'Arial',
          size: 18,
          bold: true,
          color: { argb: textColor },
        },
      },
      {
        text: note,
        font: {
          name: 'Arial',
          size: 10,
          color: { argb: textColor },
        },
      },
    ],
  } as never
  cell.alignment = {
    vertical: 'middle',
    horizontal: 'left',
    wrapText: true,
  }
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: fillColor },
  }
  cell.border = cardBorder()
  cell.value = String(cell.value).replace(/\n/g, '\n')
}

function styleNoteCard(cell: Cell) {
  cell.font = {
    name: 'Arial',
    size: 11,
    color: { argb: COLORS.slate },
  }
  cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.soft },
  }
  cell.border = cardBorder()
}

function styleSectionLabel(cell: Cell) {
  cell.font = {
    name: 'Arial',
    size: 10,
    bold: true,
    color: { argb: COLORS.greenDark },
  }
  cell.alignment = { vertical: 'middle', horizontal: 'left' }
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.softGreen },
  }
}

function styleTableHeaderRow(row: Row) {
  row.height = 22
  row.eachCell((cell) => {
    cell.font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: COLORS.white },
    }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.green },
    }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = thinBorder(COLORS.greenDark)
  })
}

function styleDataRow(row: Row, shaded: boolean) {
  row.height = 21
  row.eachCell((cell, colNumber) => {
    cell.font = {
      name: 'Arial',
      size: 10,
      color: { argb: COLORS.navy },
    }
    cell.alignment = {
      vertical: 'middle',
      horizontal: colNumber === 1 ? 'left' : 'right',
    }
    cell.border = thinBottomBorder()
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: shaded ? COLORS.soft : COLORS.white },
    }
  })
}

function styleTotalRow(row: Row) {
  row.height = 22
  row.eachCell((cell, colNumber) => {
    cell.font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: colNumber === 1 ? COLORS.white : COLORS.greenDark },
    }
    cell.alignment = {
      vertical: 'middle',
      horizontal: colNumber === 1 ? 'left' : 'right',
    }
    cell.border = thinBorder(COLORS.greenDark)
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.softGreen },
    }
  })
  row.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.green },
  }
}

function styleDetailTable(sheet: Worksheet, startRow: number, endRow: number) {
  for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
    const row = sheet.getRow(rowNumber)
    row.height = 20
    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: 'Arial',
        size: 10,
        color: { argb: COLORS.navy },
      }
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber % 2 === 1 ? 'left' : 'right',
        wrapText: true,
      }
      cell.border = thinBottomBorder()
      if (colNumber % 2 === 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLORS.soft },
        }
      }
    })
  }
}

function styleMutedNote(cell: Cell) {
  cell.font = {
    name: 'Arial',
    size: 10,
    italic: true,
    color: { argb: COLORS.muted },
  }
  cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
}

function cardBorder(): Partial<Borders> {
  return {
    top: { style: 'thin', color: { argb: COLORS.border } },
    left: { style: 'thin', color: { argb: COLORS.border } },
    bottom: { style: 'thin', color: { argb: COLORS.border } },
    right: { style: 'thin', color: { argb: COLORS.border } },
  }
}

function thinBorder(color: string): Partial<Borders> {
  return {
    top: { style: 'thin', color: { argb: color } },
    left: { style: 'thin', color: { argb: color } },
    bottom: { style: 'thin', color: { argb: color } },
    right: { style: 'thin', color: { argb: color } },
  }
}

function thinBottomBorder(): Partial<Borders> {
  return {
    bottom: { style: 'thin', color: { argb: COLORS.border } },
  }
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(Math.round(value)) + ' ₽'
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1).replace('.', ',')}%`
}

function excelDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

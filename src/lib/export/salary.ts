import type { SalaryInput, YearSalaryResult } from '@/lib/salary'
import { downloadBlob } from './download'

const MODE_LABELS = {
  tk_rf: 'ТК РФ',
  npd: 'Самозанятый (НПД)',
  usn_6: 'ИП УСН 6%',
  custom: 'Своя ставка',
} as const

export async function exportSalaryXlsx(
  input: SalaryInput,
  result: YearSalaryResult,
): Promise<void> {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'На руки'
  workbook.created = new Date()

  const summary = workbook.addWorksheet('Сводка')
  summary.addRows([
    ['Параметр', 'Значение'],
    ['Год', input.year],
    ['Режим', MODE_LABELS[input.mode]],
    ['Доход до налогов за год', result.totals.gross],
    ['Налоги', result.totals.tax],
    ['Страховые взносы', result.totals.contributions],
    ['На руки за год', result.totals.net],
    ['Эффективная нагрузка', result.totals.effectiveRate],
  ])
  summary.getColumn(2).numFmt = '# ##0 ₽'
  summary.getCell('B8').numFmt = '0.0%'

  const months = workbook.addWorksheet('Помесячно')
  months.addRow([
    'Месяц',
    'До налогов',
    'Налог',
    'Взносы',
    'На руки',
  ])
  const monthNames = new Intl.DateTimeFormat('ru-RU', { month: 'long' })
  result.months.forEach((month) => {
    months.addRow([
      monthNames.format(new Date(input.year, month.month, 1)),
      month.gross,
      month.tax,
      month.contributions,
      month.net,
    ])
  })
  months.addRow([
    'Итого',
    result.totals.gross,
    result.totals.tax,
    result.totals.contributions,
    result.totals.net,
  ])
  for (let index = 2; index <= 5; index++) {
    months.getColumn(index).numFmt = '# ##0 ₽'
  }

  const events = workbook.addWorksheet('Выплаты')
  events.addRow(['Дата', 'Тип', 'За месяц', 'До налогов', 'Удержано', 'На руки'])
  result.events.forEach((event) => {
    events.addRow([
      event.date,
      event.kind,
      event.forMonth + 1,
      event.gross,
      event.tax,
      event.net,
    ])
  })
  ;[summary, months, events].forEach((sheet) => {
    sheet.views = [{ state: 'frozen', ySplit: 1 }]
    sheet.getRow(1).font = { bold: true }
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' },
    }
    sheet.columns.forEach((column) => {
      column.width = Math.max(
        14,
        ...(column.values ?? [])
          .slice(1)
          .map((value) => String(value ?? '').length + 2),
      )
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `salary-${input.mode}-${input.year}.xlsx`,
  )
}

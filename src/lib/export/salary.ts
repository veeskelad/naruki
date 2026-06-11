import type {
  SalaryInput,
  WorkdayAdjustments,
  YearSalaryResult,
} from '@/lib/salary'
import {
  adjustedMonthSummary,
} from '@/lib/salary'
import { MONTH_NAMES_RU, MONTH_NAMES_RU_GENITIVE } from '@/lib/calendar/types'
import { downloadBlob } from './download'
import type {
  Borders,
  Cell,
  CellFormulaValue,
  Row,
  Workbook,
  Worksheet,
} from 'exceljs'

const MODE_LABELS = {
  tk_rf: 'ТК РФ',
  npd: 'Самозанятый (НПД)',
  usn_6: 'ИП УСН 6%',
  custom: 'Своя ставка',
} as const

const EVENT_LABELS = {
  advance: 'Аванс',
  salary: 'Зарплата',
  income: 'Поступление',
  tax: 'Налог',
  contribution: 'Взнос',
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
  gold: 'FEF3C7',
  blue: '0000FF',
  input: 'EFF6FF',
  white: 'FFFFFF',
} as const

const RUB_FMT = '# ##0 ₽;[Red](# ##0 ₽);–'
const INT_FMT = '# ##0;[Red](# ##0);–'
const PERCENT_FMT = '0.0%;[Red](0.0%);–'

export interface SalaryExportOptions {
  workdayAdjustments?: WorkdayAdjustments
}

export async function createSalaryWorkbook(
  input: SalaryInput,
  result: YearSalaryResult,
  options: SalaryExportOptions = {},
): Promise<Workbook> {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'На руки'
  workbook.company = 'naruki.space'
  workbook.subject = `Расчёт зарплаты ${input.year}`
  workbook.title = 'Сколько и когда придёт'
  workbook.description =
    'Локальный расчёт зарплаты, налогов и графика выплат.'
  workbook.created = new Date()
  workbook.calcProperties.fullCalcOnLoad = true

  const summary = workbook.addWorksheet('Сводка')
  const months = workbook.addWorksheet('Помесячно')
  const events = workbook.addWorksheet('Выплаты')

  const adjusted = result.months.map((month) =>
    adjustedMonthSummary(
      input.year,
      month,
      options.workdayAdjustments?.[month.month],
    ),
  )

  buildMonthlySheet(months, input, result, adjusted)
  buildSummarySheet(summary, input, result, adjusted)
  buildEventsSheet(events, input, result, adjusted)

  return workbook
}

export async function createSalaryXlsxBuffer(
  input: SalaryInput,
  result: YearSalaryResult,
  options: SalaryExportOptions = {},
): Promise<ArrayBuffer> {
  const workbook = await createSalaryWorkbook(input, result, options)
  return workbook.xlsx.writeBuffer()
}

export async function exportSalaryXlsx(
  input: SalaryInput,
  result: YearSalaryResult,
  options: SalaryExportOptions = {},
): Promise<void> {
  const buffer = await createSalaryXlsxBuffer(input, result, options)
  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `naruki-salary-${input.mode}-${input.year}.xlsx`,
  )
}

function buildSummarySheet(
  sheet: Worksheet,
  input: SalaryInput,
  result: YearSalaryResult,
  adjusted: ReturnType<typeof adjustedMonthSummary>[],
) {
  configureSheet(sheet, 'portrait', 'A1:F22')
  sheet.columns = [
    { width: 19 },
    { width: 18 },
    { width: 19 },
    { width: 18 },
    { width: 19 },
    { width: 18 },
  ]
  sheet.views = [{ state: 'frozen', ySplit: 3, showGridLines: false }]

  sheet.mergeCells('A1:F1')
  sheet.getCell('A1').value = 'Сколько и когда придёт'
  styleHeroTitle(sheet.getCell('A1'))
  sheet.getRow(1).height = 34

  sheet.mergeCells('A2:F2')
  sheet.getCell('A2').value =
    `Зарплата ${input.year} · ${MODE_LABELS[input.mode]} · отчёт Naruki`
  styleSubtitle(sheet.getCell('A2'))
  sheet.getRow(2).height = 25

  const totals = getAdjustedTotals(result, adjusted, input.mode === 'tk_rf')
  const metrics = [
    {
      range: 'A4:B6',
      label: 'НА РУКИ ЗА ГОД',
      value: totals.net,
      note: 'Чистыми после всех удержаний',
      fill: COLORS.green,
      text: COLORS.white,
      formula: "'Помесячно'!I17",
    },
    {
      range: 'C4:D6',
      label: 'В СРЕДНЕМ В МЕСЯЦ',
      value: Math.round(totals.net / 12),
      note: 'С учётом выбранных рабочих дней',
      fill: COLORS.soft,
      text: COLORS.navy,
      formula: "'Помесячно'!I17/12",
    },
    {
      range: 'E4:F6',
      label: 'НАЛОГ + ВЗНОСЫ',
      value: totals.tax + totals.contributions,
      note: `Эффективная нагрузка ${formatPercent(
        totals.gross > 0
          ? (totals.tax + totals.contributions) / totals.gross
          : 0,
      )}`,
      fill: COLORS.soft,
      text: COLORS.navy,
      formula: "'Помесячно'!G17+'Помесячно'!H17",
    },
  ]

  metrics.forEach((metric) => {
    const [start, end] = metric.range.split(':')
    const startRow = Number(start.match(/\d+/)?.[0])
    const endRow = Number(end.match(/\d+/)?.[0])
    const startColumn = start.replace(/\d+/g, '')
    const endColumn = end.replace(/\d+/g, '')
    sheet.mergeCells(`${startColumn}${startRow}:${endColumn}${startRow}`)
    sheet.mergeCells(
      `${startColumn}${startRow + 1}:${endColumn}${startRow + 1}`,
    )
    sheet.mergeCells(`${startColumn}${endRow}:${endColumn}${endRow}`)
    const label = sheet.getCell(start)
    const value = sheet.getCell(`${startColumn}${startRow + 1}`)
    const note = sheet.getCell(`${startColumn}${endRow}`)
    label.value = metric.label
    value.value = formula(metric.formula, metric.value)
    note.value = metric.note
    styleMetricCard(label, value, note, metric.fill, metric.text)
  })
  sheet.getRow(4).height = 22
  sheet.getRow(5).height = 32
  sheet.getRow(6).height = 28

  sheet.mergeCells('A8:F8')
  sheet.getCell('A8').value = 'ПАРАМЕТРЫ РАСЧЁТА'
  styleSectionLabel(sheet.getCell('A8'))

  const headers = ['Параметр', 'Значение', 'Параметр', 'Значение', 'Параметр', 'Значение']
  headers.forEach((value, index) => {
    sheet.getRow(9).getCell(index + 1).value = value
  })
  styleTableHeaderRow(sheet.getRow(9))

  const details = buildDetails(input)
  const detailRows = Math.ceil(details.length / 3)
  for (let rowOffset = 0; rowOffset < detailRows; rowOffset++) {
    const row = sheet.getRow(10 + rowOffset)
    for (let pair = 0; pair < 3; pair++) {
      const detail = details[rowOffset * 3 + pair]
      if (!detail) continue
      row.getCell(pair * 2 + 1).value = detail[0]
      row.getCell(pair * 2 + 2).value = detail[1]
    }
  }
  styleDetailTable(sheet, 10, 10 + detailRows - 1)

  const noteRow = 11 + detailRows
  sheet.getCell(`A${noteRow}`).value = 'ПРИМЕЧАНИЕ'
  styleSectionLabel(sheet.getCell(`A${noteRow}`))
  sheet.mergeCells(`B${noteRow}:F${noteRow}`)
  sheet.getCell(`B${noteRow}`).value =
    input.mode === 'tk_rf'
      ? 'Синие ячейки на листе «Помесячно» можно менять. Аванс, зарплата и итоги пересчитаются при открытии файла в Excel или Google Sheets.'
      : 'Файл является снимком расчёта. Налоговые параметры изменяются на сайте, после чего отчёт нужно скачать заново.'
  styleMutedNote(sheet.getCell(`B${noteRow}`))
  sheet.getRow(noteRow).height = 42
}

function buildMonthlySheet(
  sheet: Worksheet,
  input: SalaryInput,
  result: YearSalaryResult,
  adjusted: ReturnType<typeof adjustedMonthSummary>[],
) {
  const isTk = input.mode === 'tk_rf'
  configureSheet(sheet, 'landscape', isTk ? 'A1:K17' : 'A1:E17')
  sheet.views = [{ state: 'frozen', ySplit: 4, showGridLines: false }]
  sheet.columns = isTk
    ? [
        { width: 18 },
        { width: 12 },
        { width: 12 },
        { width: 14 },
        { width: 11 },
        { width: 16 },
        { width: 14 },
        { width: 14 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
      ]
    : [
        { width: 20 },
        { width: 16 },
        { width: 14 },
        { width: 14 },
        { width: 16 },
      ]

  const lastColumn = isTk ? 'K' : 'E'
  sheet.mergeCells(`A1:${lastColumn}1`)
  sheet.getCell('A1').value = 'Помесячный расчёт'
  styleHeroTitle(sheet.getCell('A1'))
  sheet.getRow(1).height = 34
  sheet.mergeCells(`A2:${lastColumn}2`)
  sheet.getCell('A2').value = isTk
    ? 'Синие ячейки — рабочие дни, которые можно менять для учёта отпуска или больничного.'
    : 'Суммы по месяцам; итоговая строка использует формулы Excel.'
  styleSubtitle(sheet.getCell('A2'))
  sheet.getRow(2).height = 25

  const headerValues = isTk
    ? [
        'Месяц',
        'Норма дней',
        '1 — 15',
        '16 — конец',
        'Доля месяца',
        'До налогов',
        'Налог',
        'Взносы',
        'На руки',
        `Аванс (${input.paymentSchedule?.advanceDay ?? 25}-го)`,
        `Зарплата (${input.paymentSchedule?.salaryDay ?? 10}-го след.)`,
      ]
    : ['Месяц', 'До налогов', 'Налог', 'Взносы', 'На руки']
  headerValues.forEach((value, index) => {
    sheet.getRow(4).getCell(index + 1).value = value
  })
  styleTableHeaderRow(sheet.getRow(4))
  sheet.getRow(4).height = 34

  result.months.forEach((month, index) => {
    const rowNumber = index + 5
    const monthAdjusted = adjusted[index]
    const row = sheet.getRow(rowNumber)
    row.getCell(1).value = `${MONTH_NAMES_RU_GENITIVE[index]} ${input.year}`

    if (isTk) {
      row.getCell(2).value =
        monthAdjusted.defaultFirstHalf + monthAdjusted.defaultSecondHalf
      row.getCell(3).value = monthAdjusted.firstHalf
      row.getCell(4).value = monthAdjusted.secondHalf
      row.getCell(5).value = formula(
        `IF(B${rowNumber}=0,0,(C${rowNumber}+D${rowNumber})/B${rowNumber})`,
        monthAdjusted.ratio,
      )
      row.getCell(6).value = formula(
        `ROUND(${month.gross}*E${rowNumber},0)`,
        monthAdjusted.gross,
      )
      row.getCell(7).value = formula(
        `ROUND(${month.tax}*E${rowNumber},0)`,
        monthAdjusted.tax,
      )
      row.getCell(8).value = formula(
        `ROUND(${month.contributions}*E${rowNumber},0)`,
        monthAdjusted.contributions,
      )
      row.getCell(9).value = formula(
        `ROUND(${month.net}*E${rowNumber},0)`,
        monthAdjusted.net,
      )
      row.getCell(10).value = formula(
        `IF(C${rowNumber}+D${rowNumber}=0,0,ROUND(I${rowNumber}*C${rowNumber}/(C${rowNumber}+D${rowNumber}),0))`,
        monthAdjusted.advanceNet,
      )
      row.getCell(11).value = formula(
        `I${rowNumber}-J${rowNumber}`,
        monthAdjusted.salaryNet,
      )
      styleInputCell(row.getCell(3), monthAdjusted.defaultFirstHalf)
      styleInputCell(row.getCell(4), monthAdjusted.defaultSecondHalf)
      row.getCell(5).numFmt = PERCENT_FMT
      for (let col = 6; col <= 11; col++) row.getCell(col).numFmt = RUB_FMT
    } else {
      row.getCell(2).value = month.gross
      row.getCell(3).value = month.tax
      row.getCell(4).value = month.contributions
      row.getCell(5).value = formula(
        `B${rowNumber}-C${rowNumber}-D${rowNumber}`,
        month.net,
      )
      for (let col = 2; col <= 5; col++) row.getCell(col).numFmt = RUB_FMT
    }
    styleDataRow(row, index % 2 === 0)
  })

  const totalRow = sheet.getRow(17)
  totalRow.getCell(1).value = 'Итого за год'
  const firstTotalColumn = isTk ? 6 : 2
  const lastTotalColumn = isTk ? 11 : 5
  for (let col = firstTotalColumn; col <= lastTotalColumn; col++) {
    const letter = sheet.getColumn(col).letter
    const resultValue = sumColumnResult(adjusted, result, input.mode, col)
    totalRow.getCell(col).value = formula(
      `SUM(${letter}5:${letter}16)`,
      resultValue,
    )
    totalRow.getCell(col).numFmt = RUB_FMT
  }
  if (isTk) {
    totalRow.getCell(2).value = formula('SUM(B5:B16)', sum(adjusted, (x) => x.defaultFirstHalf + x.defaultSecondHalf))
    totalRow.getCell(3).value = formula('SUM(C5:C16)', sum(adjusted, (x) => x.firstHalf))
    totalRow.getCell(4).value = formula('SUM(D5:D16)', sum(adjusted, (x) => x.secondHalf))
    totalRow.getCell(5).value = formula(
      'IF(B17=0,0,(C17+D17)/B17)',
      sum(adjusted, (x) => x.totalDays) /
        Math.max(1, sum(adjusted, (x) => x.defaultFirstHalf + x.defaultSecondHalf)),
    )
    totalRow.getCell(5).numFmt = PERCENT_FMT
  }
  styleTotalRow(totalRow)
  sheet.autoFilter = { from: 'A4', to: `${lastColumn}16` }
}

function buildEventsSheet(
  sheet: Worksheet,
  input: SalaryInput,
  result: YearSalaryResult,
  adjusted: ReturnType<typeof adjustedMonthSummary>[],
) {
  configureSheet(sheet, 'landscape', `A1:H${result.events.length + 3}`)
  sheet.columns = [
    { width: 15 },
    { width: 15 },
    { width: 16 },
    { width: 15 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 34 },
  ]
  sheet.views = [{ state: 'frozen', ySplit: 3, showGridLines: false }]
  sheet.mergeCells('A1:H1')
  sheet.getCell('A1').value = 'График поступлений'
  styleHeroTitle(sheet.getCell('A1'))
  sheet.getRow(1).height = 34
  sheet.mergeCells('A2:H2')
  sheet.getCell('A2').value =
    'Плановая дата и фактическая дата после переноса на предыдущий рабочий день.'
  styleSubtitle(sheet.getCell('A2'))

  const headers = [
    'Плановая дата',
    'Дата выплаты',
    'Тип',
    'Месяц',
    'До налогов',
    'Удержано',
    'На руки',
    'Примечание',
  ]
  headers.forEach((value, index) => {
    sheet.getRow(3).getCell(index + 1).value = value
  })
  styleTableHeaderRow(sheet.getRow(3))

  result.events.forEach((event, index) => {
    const row = sheet.getRow(index + 4)
    const monthAdjusted = adjusted[event.forMonth]
    const amounts = adjustedEventAmounts(event.kind, monthAdjusted, event)
    row.getCell(1).value = excelDate(event.originalDate)
    row.getCell(2).value = excelDate(event.date)
    row.getCell(3).value = EVENT_LABELS[event.kind]
    row.getCell(4).value = `${MONTH_NAMES_RU[event.forMonth]} ${input.year}`
    row.getCell(5).value = amounts.gross
    row.getCell(6).value = amounts.tax
    row.getCell(7).value = amounts.net
    row.getCell(8).value = event.shifted
      ? 'Перенесено на предыдущий рабочий день'
      : 'По графику'
    styleDataRow(row, index % 2 === 0)
    row.getCell(1).numFmt = 'dd mmm yyyy'
    row.getCell(2).numFmt = 'dd mmm yyyy'
    row.getCell(5).numFmt = RUB_FMT
    row.getCell(6).numFmt = RUB_FMT
    row.getCell(7).numFmt = RUB_FMT
    if (event.shifted) {
      row.getCell(1).fill = solidFill(COLORS.gold)
      row.getCell(2).fill = solidFill(COLORS.gold)
      row.getCell(8).fill = solidFill(COLORS.gold)
    }
  })
  sheet.autoFilter = {
    from: 'A3',
    to: `H${result.events.length + 3}`,
  }
}

function buildDetails(input: SalaryInput): Array<[string, string | number]> {
  const details: Array<[string, string | number]> = [
    ['Год', String(input.year)],
    ['Режим', MODE_LABELS[input.mode]],
    ['Доход', formatMoney(input.amount)],
    ['Форма', input.amountMode === 'gross' ? 'До налогов' : 'На руки'],
  ]

  if (input.mode === 'tk_rf') {
    details.push(
      ['Дети', input.children ?? 0],
      ['Прогрессивный НДФЛ', input.useProgressiveTax === false ? 'Нет' : 'Да'],
      ['Вычет на детей', input.useChildDeduction === false ? 'Нет' : 'Да'],
      ['Аванс', `${input.paymentSchedule?.advanceDay ?? 25}-го`],
      ['Зарплата', `${input.paymentSchedule?.salaryDay ?? 10}-го`],
    )
  } else if (input.mode === 'npd') {
    details.push(
      ['Доля поступлений от бизнеса', `${input.npdBusinessShare ?? 60}%`],
      ['Налоговый бонус', input.useNpdBonus === false ? 'Нет' : 'Да'],
    )
  } else if (input.mode === 'usn_6') {
    details.push([
      'Фиксированные взносы',
      formatMoney(input.usnFixedContributions ?? 0),
    ])
  } else {
    details.push(['Пользовательская ставка', `${input.customRate ?? 13}%`])
  }
  return details
}

function adjustedEventAmounts(
  kind: YearSalaryResult['events'][number]['kind'],
  adjusted: ReturnType<typeof adjustedMonthSummary>,
  event: YearSalaryResult['events'][number],
) {
  if (kind !== 'advance' && kind !== 'salary') {
    return { gross: event.gross, tax: event.tax, net: event.net }
  }
  const selectedDays =
    kind === 'advance' ? adjusted.firstHalf : adjusted.secondHalf
  const totalDays = adjusted.totalDays
  const share = totalDays > 0 ? selectedDays / totalDays : 0
  return {
    gross: Math.round(adjusted.gross * share),
    tax: Math.round(adjusted.tax * share),
    net: kind === 'advance' ? adjusted.advanceNet : adjusted.salaryNet,
  }
}

function getAdjustedTotals(
  result: YearSalaryResult,
  adjusted: ReturnType<typeof adjustedMonthSummary>[],
  useAdjusted: boolean,
) {
  if (!useAdjusted) return result.totals
  const gross = sum(adjusted, (x) => x.gross)
  const tax = sum(adjusted, (x) => x.tax)
  const contributions = sum(adjusted, (x) => x.contributions)
  const net = sum(adjusted, (x) => x.net)
  return {
    gross,
    tax,
    contributions,
    net,
    effectiveRate: gross > 0 ? (tax + contributions) / gross : 0,
  }
}

function sumColumnResult(
  adjusted: ReturnType<typeof adjustedMonthSummary>[],
  result: YearSalaryResult,
  mode: SalaryInput['mode'],
  column: number,
): number {
  if (mode !== 'tk_rf') {
    const key = ({ 2: 'gross', 3: 'tax', 4: 'contributions', 5: 'net' } as const)[
      column as 2 | 3 | 4 | 5
    ]
    return result.months.reduce((total, month) => total + month[key], 0)
  }
  const key = (
    {
      6: 'gross',
      7: 'tax',
      8: 'contributions',
      9: 'net',
      10: 'advanceNet',
      11: 'salaryNet',
    } as const
  )[column as 6 | 7 | 8 | 9 | 10 | 11]
  return sum(adjusted, (month) => month[key])
}

function configureSheet(
  sheet: Worksheet,
  orientation: 'portrait' | 'landscape',
  printArea: string,
) {
  sheet.properties.defaultRowHeight = 22
  sheet.pageSetup = {
    orientation,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
    margins: {
      left: 0.3,
      right: 0.3,
      top: 0.5,
      bottom: 0.5,
      header: 0.2,
      footer: 0.2,
    },
    printArea,
  }
  sheet.headerFooter.oddFooter =
    '&LНа руки · naruki.space&CСтраница &P из &N&RРасчёт справочный'
}

function styleHeroTitle(cell: Cell) {
  cell.font = {
    name: 'Arial',
    size: 20,
    bold: true,
    color: { argb: COLORS.navy },
  }
  cell.alignment = { vertical: 'middle', horizontal: 'left' }
}

function styleSubtitle(cell: Cell) {
  cell.font = {
    name: 'Arial',
    size: 11,
    color: { argb: COLORS.slate },
  }
  cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
}

function styleMetricCard(
  label: Cell,
  value: Cell,
  note: Cell,
  fillColor: string,
  textColor: string,
) {
  for (const cell of [label, value, note]) {
    cell.fill = solidFill(fillColor)
    cell.border = cardBorder()
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'left',
      wrapText: true,
    }
  }
  label.font = {
    name: 'Arial',
    size: 9,
    bold: true,
    color: { argb: textColor },
  }
  value.font = {
    name: 'Arial',
    size: 18,
    bold: true,
    color: { argb: textColor },
  }
  value.numFmt = RUB_FMT
  note.font = { name: 'Arial', size: 9, color: { argb: textColor } }
}

function styleSectionLabel(cell: Cell) {
  cell.font = {
    name: 'Arial',
    size: 10,
    bold: true,
    color: { argb: COLORS.greenDark },
  }
  cell.alignment = { vertical: 'middle', horizontal: 'left' }
  cell.fill = solidFill(COLORS.softGreen)
}

function styleTableHeaderRow(row: Row) {
  row.eachCell((cell) => {
    cell.font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: COLORS.white },
    }
    cell.fill = solidFill(COLORS.green)
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = thinBorder(COLORS.greenDark)
  })
}

function styleDataRow(row: Row, shaded: boolean) {
  row.height = 24
  row.eachCell((cell, colNumber) => {
    if (cell.font?.color?.argb !== COLORS.blue) {
      cell.font = {
        name: 'Arial',
        size: 10,
        color: { argb: COLORS.navy },
      }
    }
    cell.alignment = {
      vertical: 'middle',
      horizontal: colNumber === 1 ? 'left' : 'right',
      wrapText: colNumber === 8,
    }
    cell.border = thinBottomBorder()
    if (
      cell.fill?.type !== 'pattern' ||
      cell.fill.fgColor?.argb !== COLORS.input
    ) {
      cell.fill = solidFill(shaded ? COLORS.soft : COLORS.white)
    }
  })
}

function styleInputCell(cell: Cell, max: number) {
  cell.font = {
    name: 'Arial',
    size: 10,
    bold: true,
    color: { argb: COLORS.blue },
  }
  cell.fill = solidFill(COLORS.input)
  cell.numFmt = INT_FMT
  cell.dataValidation = {
    type: 'whole',
    operator: 'between',
    formulae: [0, max],
    allowBlank: false,
    showErrorMessage: true,
    errorStyle: 'stop',
    errorTitle: 'Недопустимое значение',
    error: `Введите целое число от 0 до ${max}.`,
    showInputMessage: true,
    promptTitle: 'Рабочие дни',
    prompt: `Можно указать от 0 до ${max} рабочих дней.`,
  }
}

function styleTotalRow(row: Row) {
  row.height = 26
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
    cell.fill = solidFill(COLORS.softGreen)
  })
  row.getCell(1).fill = solidFill(COLORS.green)
}

function styleDetailTable(sheet: Worksheet, startRow: number, endRow: number) {
  for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
    const row = sheet.getRow(rowNumber)
    row.height = 24
    for (let colNumber = 1; colNumber <= 6; colNumber++) {
      const cell = row.getCell(colNumber)
      cell.font = {
        name: 'Arial',
        size: 10,
        bold: colNumber % 2 === 1,
        color: { argb: COLORS.navy },
      }
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber % 2 === 1 ? 'left' : 'right',
        wrapText: true,
      }
      cell.border = thinBottomBorder()
      if (colNumber % 2 === 0) cell.fill = solidFill(COLORS.soft)
    }
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

function formula(expression: string, result: number): CellFormulaValue {
  return { formula: expression, result }
}

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((total, item) => total + selector(item), 0)
}

function solidFill(color: string) {
  return {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: color },
  }
}

function cardBorder(): Partial<Borders> {
  return thinBorder(COLORS.border)
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

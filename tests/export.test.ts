import { describe, expect, it } from 'vitest'
import ExcelJS from 'exceljs'
import { calculateSalary } from '@/lib/salary'
import {
  createSalaryWorkbook,
  createSalaryXlsxBuffer,
} from '@/lib/export/salary'
import {
  buildVacationClipboardText,
  buildVacationCsv,
  buildVacationIcs,
} from '@/lib/export/vacation'

const tkInput = {
  year: 2026,
  mode: 'tk_rf' as const,
  amount: 100_000,
  amountMode: 'gross' as const,
  children: 0,
  useChildDeduction: false,
  useProgressiveTax: true,
  paymentSchedule: {
    advanceDay: 25,
    salaryDay: 10,
    advanceShare: 0.4,
  },
}

describe('salary XLSX export', () => {
  it('builds a styled workbook with editable workdays and cached formulas', async () => {
    const result = calculateSalary(tkInput)
    const workbook = await createSalaryWorkbook(tkInput, result, {
      workdayAdjustments: {
        0: { firstHalf: 0, secondHalf: 11 },
      },
    })

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      'Сводка',
      'Помесячно',
      'Выплаты',
    ])

    const summary = workbook.getWorksheet('Сводка')!
    const monthly = workbook.getWorksheet('Помесячно')!
    const payments = workbook.getWorksheet('Выплаты')!

    expect(String(summary.getCell('A1').value)).toBe('Сколько и когда придёт')
    expect(JSON.stringify(summary.model)).not.toContain('[object Object]')
    expect(monthly.getCell('C5').value).toBe(0)
    expect(monthly.getCell('C5').font.color?.argb).toBe('0000FF')
    expect(monthly.getCell('C5').dataValidation.formulae).toEqual([0, 4])

    const januaryNet = monthly.getCell('I5').value
    expect(januaryNet).toMatchObject({
      formula: 'ROUND(87000*E5,0)',
      result: 63800,
    })
    expect(monthly.getCell('I17').value).toMatchObject({
      formula: 'SUM(I5:I16)',
    })
    expect(summary.getCell('A5').value).toMatchObject({
      formula: "'Помесячно'!I17",
    })
    expect(monthly.autoFilter).toEqual({ from: 'A4', to: 'K16' })
    expect(payments.autoFilter).toEqual({ from: 'A3', to: 'H27' })
    expect(payments.getCell('C4').value).toBe('Аванс')

    const formulas: string[] = []
    workbook.eachSheet((sheet) => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          const value = cell.value
          if (
            value &&
            typeof value === 'object' &&
            'formula' in value &&
            typeof value.formula === 'string'
          ) {
            formulas.push(value.formula)
          }
          expect(String(value)).not.toMatch(
            /#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A/,
          )
        })
      })
    })
    expect(formulas.length).toBeGreaterThan(40)
  })

  it.each(['npd', 'usn_6', 'custom'] as const)(
    'creates a readable report for %s',
    async (mode) => {
      const input = {
        ...tkInput,
        mode,
        paymentSchedule: undefined,
        npdBusinessShare: 60,
        useNpdBonus: true,
        usnFixedContributions: 57_390,
        customRate: 13,
      }
      const result = calculateSalary(input)
      const workbook = await createSalaryWorkbook(input, result)
      const monthly = workbook.getWorksheet('Помесячно')!

      expect(monthly.getCell('E17').value).toMatchObject({
        formula: 'SUM(E5:E16)',
        result: result.totals.net,
      })
      expect(monthly.autoFilter).toEqual({ from: 'A4', to: 'E16' })
    },
  )

  it('serializes to a workbook that ExcelJS can read back', async () => {
    const result = calculateSalary(tkInput)
    const buffer = await createSalaryXlsxBuffer(tkInput, result)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    expect(workbook.getWorksheet('Сводка')?.getCell('A1').value).toBe(
      'Сколько и когда придёт',
    )
    expect(workbook.getWorksheet('Помесячно')?.getCell('I17').value).toMatchObject({
      formula: 'SUM(I5:I16)',
      result: result.totals.net,
    })
  })
})

describe('vacation output formats', () => {
  const dates = ['2026-05-08', '2026-05-04', '2026-05-04']

  it('builds a sorted Excel-friendly CSV', () => {
    const csv = buildVacationCsv(dates)
    expect(csv.startsWith('\uFEFFДата;День недели\r\n')).toBe(true)
    expect(csv).toContain('04.05.2026;понедельник\r\n')
    expect(csv).toContain('08.05.2026;пятница\r\n')
    expect(csv.match(/04\.05\.2026/g)).toHaveLength(1)
    expect(csv.endsWith('\r\n')).toBe(true)
  })

  it('builds deterministic all-day ICS events', () => {
    const ics = buildVacationIcs(dates, new Date('2026-01-02T03:04:05Z'))
    expect(ics).toContain('CALSCALE:GREGORIAN\r\nMETHOD:PUBLISH')
    expect(ics).toContain('DTSTAMP:20260102T030405Z')
    expect(ics).toContain('UID:2026-05-04-vacation@naruki.space')
    expect(ics).toContain('DTSTART;VALUE=DATE:20260504')
    expect(ics).toContain('DTEND;VALUE=DATE:20260505')
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
    expect(ics.endsWith('\r\n')).toBe(true)
  })

  it('builds localized clipboard text', () => {
    expect(buildVacationClipboardText(2026, dates, 2, 6)).toBe(
      'Отпуск 2026: 4 мая 2026 г., 8 мая 2026 г. 2 дня отпуска → 6 дней отдыха.',
    )
  })
})

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import {
  ChevronDown,
  Download,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { FaqSection } from '@/components/content/FaqSection'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { SALARY_FAQ } from '@/seo/content'
import { cn } from '@/lib/utils'
import {
  calculateSalary,
  adjustedMonthSummary,
  countWorkdays,
  previousWorkdayDate,
  type SalaryInput,
  type TaxMode,
  type WorkdayAdjustment,
  type WorkdayAdjustments,
  type YearSalaryResult,
} from '@/lib/salary'
import { exportSalaryXlsx } from '@/lib/export/salary'
import {
  daysInMonth,
  diffDays,
  isoDate,
  parseIso,
} from '@/lib/calendar'
import {
  MONTH_NAMES_RU,
  MONTH_NAMES_RU_GENITIVE,
} from '@/lib/calendar/types'
import {
  formatMoneyInput,
  formatRubles,
  formatShortDate,
  parseMoney,
} from '@/lib/format'

const YEAR = 2026
const PROGRESSIVE_LIMIT = 2_400_000

const EMPLOYMENT_LABELS: Record<TaxMode, string> = {
  tk_rf: 'ТК РФ',
  npd: 'Самозанятый',
  usn_6: 'ИП УСН 6%',
  custom: 'Своя ставка',
}

const EVENT_LABELS: Record<string, string> = {
  advance: 'аванс',
  salary: 'зарплата',
  income: 'поступление',
  tax: 'налог',
  contribution: 'взнос',
}

export function SalaryPage() {
  const [mode, setMode] = useState<TaxMode>('tk_rf')
  const [amountRaw, setAmountRaw] = useState('100 000')
  const [amountMode, setAmountMode] = useState<'gross' | 'net'>('gross')
  const [children, setChildren] = useState('0')
  const [useProgressiveTax, setUseProgressiveTax] = useState(true)
  const [useChildDeduction, setUseChildDeduction] = useState(false)
  const [npdBusinessShare, setNpdBusinessShare] = useState('60')
  const [usnFixedContributions, setUsnFixedContributions] = useState('57 390')
  const [customRate, setCustomRate] = useState('13')
  const [advanceDay, setAdvanceDay] = useState('25')
  const [salaryDay, setSalaryDay] = useState('10')
  const [scheduleExpanded, setScheduleExpanded] = useState(false)
  const [compareExpanded, setCompareExpanded] = useState(true)
  const [workdayAdjustments, setWorkdayAdjustments] =
    useState<WorkdayAdjustments>({})
  const [exporting, setExporting] = useState(false)

  const amount = useMemo(() => parseMoney(amountRaw), [amountRaw])
  const childrenCount = useMemo(() => parseInt(children, 10) || 0, [children])
  const advanceDayNumber = useMemo(
    () => parseDay(advanceDay, 25),
    [advanceDay],
  )
  const salaryDayNumber = useMemo(() => parseDay(salaryDay, 10), [salaryDay])

  const input = useMemo<SalaryInput>(
    () => ({
      year: YEAR,
      mode,
      amount,
      amountMode,
      children: childrenCount,
      useChildDeduction,
      useProgressiveTax,
      npdBusinessShare: parsePercent(npdBusinessShare, 60),
      useNpdBonus: true,
      customRate: parsePercent(customRate, 13),
      usnFixedContributions: parseMoney(usnFixedContributions) || 57_390,
      paymentSchedule:
        mode === 'tk_rf'
          ? {
              advanceDay: advanceDayNumber,
              salaryDay: salaryDayNumber,
              advanceShare: 0.4,
            }
          : undefined,
    }),
    [
      amount,
      amountMode,
      advanceDayNumber,
      childrenCount,
      customRate,
      mode,
      npdBusinessShare,
      salaryDayNumber,
      useChildDeduction,
      useProgressiveTax,
      usnFixedContributions,
    ],
  )

  const result = useMemo(() => calculateSalary(input), [input])
  const canShowResult = amount > 0

  const handleExport = async () => {
    if (!canShowResult || exporting) return
    setExporting(true)
    try {
      await exportSalaryXlsx(input, result, {
        workdayAdjustments,
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 pt-9 pb-20 md:px-6 md:pt-14 md:pb-28">
        <header className="max-w-[760px]">
          <h1 className="font-display text-[36px] font-bold leading-[1.05] tracking-tight text-foreground md:text-[54px] lg:text-[64px]">
            Сколько и&nbsp;когда придёт
          </h1>
          <p className="mt-4 max-w-[680px] text-[15px] leading-relaxed text-muted-foreground md:text-[18px]">
            Заполните три шага — получите сумму на руки и даты выплат на 2026
            год. Сохраните результат в Excel.
          </p>
        </header>

        <Wizard
          mode={mode}
          setMode={setMode}
          amountRaw={amountRaw}
          setAmountRaw={setAmountRaw}
          amountMode={amountMode}
          setAmountMode={setAmountMode}
          children={children}
          setChildren={(value) => {
            setChildren(value)
            setUseChildDeduction(value !== '0')
          }}
          useProgressiveTax={useProgressiveTax}
          setUseProgressiveTax={setUseProgressiveTax}
          useChildDeduction={useChildDeduction}
          setUseChildDeduction={setUseChildDeduction}
          npdBusinessShare={npdBusinessShare}
          setNpdBusinessShare={setNpdBusinessShare}
          usnFixedContributions={usnFixedContributions}
          setUsnFixedContributions={setUsnFixedContributions}
          customRate={customRate}
          setCustomRate={setCustomRate}
          advanceDay={advanceDay}
          setAdvanceDay={setAdvanceDay}
          salaryDay={salaryDay}
          setSalaryDay={setSalaryDay}
          amount={amount}
          result={result}
        />

        {canShowResult ? (
          <div className="mt-7 flex flex-col gap-7 md:mt-9 md:gap-8">
            <SalaryHero result={result} mode={mode} />
            <ScheduleCard
              result={result}
              mode={mode}
              year={YEAR}
              advanceDay={advanceDayNumber}
              salaryDay={salaryDayNumber}
              expanded={scheduleExpanded}
              onToggleExpanded={() => setScheduleExpanded((value) => !value)}
              onExport={handleExport}
              exporting={exporting}
              adjustments={workdayAdjustments}
              onChangeAdjustment={(monthIndex, field, value, max) => {
                setWorkdayAdjustments((current) => {
                  const existing = current[monthIndex] ?? {
                    firstHalf: countWorkdays(YEAR, monthIndex, 1, 15),
                    secondHalf: countWorkdays(
                      YEAR,
                      monthIndex,
                      16,
                      daysInMonth(YEAR, monthIndex),
                    ),
                  }
                  const next: WorkdayAdjustment = {
                    ...existing,
                    [field]: clamp(value, 0, max),
                  }
                  const defaults = adjustedMonthSummary(
                    YEAR,
                    result.months[monthIndex],
                  )

                  if (
                    next.firstHalf === defaults.defaultFirstHalf &&
                    next.secondHalf === defaults.defaultSecondHalf
                  ) {
                    const rest = { ...current }
                    delete rest[monthIndex]
                    return rest
                  }

                  return { ...current, [monthIndex]: next }
                })
              }}
            />
            <InsightGrid
              result={result}
              mode={mode}
              grossMonthly={result.inputGrossMonthly}
            />
            <ComparePanel
              input={input}
              currentMode={mode}
              grossMonthly={result.inputGrossMonthly}
              expanded={compareExpanded}
              onToggle={() => setCompareExpanded((value) => !value)}
            />
          </div>
        ) : (
          <EmptyHint />
        )}
      </div>

      <FaqSection items={SALARY_FAQ} />
    </PageShell>
  )
}

function Wizard({
  mode,
  setMode,
  amountRaw,
  setAmountRaw,
  amountMode,
  setAmountMode,
  children,
  setChildren,
  useProgressiveTax,
  setUseProgressiveTax,
  useChildDeduction,
  setUseChildDeduction,
  npdBusinessShare,
  setNpdBusinessShare,
  usnFixedContributions,
  setUsnFixedContributions,
  customRate,
  setCustomRate,
  advanceDay,
  setAdvanceDay,
  salaryDay,
  setSalaryDay,
  amount,
  result,
}: {
  mode: TaxMode
  setMode: (value: TaxMode) => void
  amountRaw: string
  setAmountRaw: (value: string) => void
  amountMode: 'gross' | 'net'
  setAmountMode: (value: 'gross' | 'net') => void
  children: string
  setChildren: (value: string) => void
  useProgressiveTax: boolean
  setUseProgressiveTax: (value: boolean) => void
  useChildDeduction: boolean
  setUseChildDeduction: (value: boolean) => void
  npdBusinessShare: string
  setNpdBusinessShare: (value: string) => void
  usnFixedContributions: string
  setUsnFixedContributions: (value: string) => void
  customRate: string
  setCustomRate: (value: string) => void
  advanceDay: string
  setAdvanceDay: (value: string) => void
  salaryDay: string
  setSalaryDay: (value: string) => void
  amount: number
  result: YearSalaryResult
}) {
  const grossMonthly = result.inputGrossMonthly
  const monthlyTake = result.months[0]?.net ?? 0
  const monthlyTax = result.months[0]?.tax ?? 0
  const effectiveRatePct = Math.round(result.totals.effectiveRate * 1000) / 10

  return (
    <section className="mt-8 overflow-hidden rounded-[24px] border border-border/70 bg-card md:mt-9">
      <StepRow num={1} title="Тип занятости" hint={EMPLOYMENT_LABELS[mode]}>
        <EmploymentPicker value={mode} onChange={setMode} />
      </StepRow>

      <StepRow
        num={2}
        title="Доход"
        hint={
          amount > 0
            ? `${formatMoneyInput(amountRaw)} ₽ в мес.`
            : 'не указан'
        }
      >
        <IncomeBlock
          amountRaw={amountRaw}
          setAmountRaw={setAmountRaw}
          amountMode={amountMode}
          setAmountMode={setAmountMode}
          grossMonthly={grossMonthly}
          monthlyTake={monthlyTake}
          monthlyTax={monthlyTax}
          effectiveRatePct={effectiveRatePct}
        />
        <ModeExtras
          mode={mode}
          children={children}
          setChildren={setChildren}
          useProgressiveTax={useProgressiveTax}
          setUseProgressiveTax={setUseProgressiveTax}
          useChildDeduction={useChildDeduction}
          setUseChildDeduction={setUseChildDeduction}
          npdBusinessShare={npdBusinessShare}
          setNpdBusinessShare={setNpdBusinessShare}
          usnFixedContributions={usnFixedContributions}
          setUsnFixedContributions={setUsnFixedContributions}
          customRate={customRate}
          setCustomRate={setCustomRate}
        />
      </StepRow>

      {mode === 'tk_rf' && (
        <StepRow
          num={3}
          title="Даты выплат"
          hint={`аванс ${advanceDay} · зарплата ${salaryDay}`}
        >
          <DatesBlock
            advanceDay={advanceDay}
            setAdvanceDay={setAdvanceDay}
            salaryDay={salaryDay}
            setSalaryDay={setSalaryDay}
          />
        </StepRow>
      )}
    </section>
  )
}

function StepRow({
  num,
  title,
  hint,
  children,
}: {
  num: number
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-4 border-b border-border/70 p-5 last:border-b-0 md:grid-cols-[200px_1fr] md:gap-8 md:p-7">
      <div className="flex items-center gap-3 md:items-start md:pt-1">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-[13px] font-semibold tabular text-background">
          {num}
        </span>
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-foreground md:text-[16px]">
            {title}
          </span>
          {hint ? (
            <span className="text-[12px] text-muted-foreground md:text-[13px]">
              {hint}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

function EmploymentPicker({
  value,
  onChange,
}: {
  value: TaxMode
  onChange: (value: TaxMode) => void
}) {
  const options: Array<{ value: TaxMode; label: string; hint: string }> = [
    { value: 'tk_rf', label: 'ТК РФ', hint: 'аванс + зарплата' },
    { value: 'npd', label: 'НПД', hint: 'самозанятый' },
    { value: 'usn_6', label: 'ИП УСН 6%', hint: 'минус взносы' },
    { value: 'custom', label: 'Своя ставка', hint: 'произвольный %' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-col gap-0.5 rounded-[16px] border p-3 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              active
                ? 'border-primary bg-primary/5 text-foreground'
                : 'border-border bg-background text-foreground hover:border-primary/40',
            )}
          >
            <span className="text-[14px] font-semibold leading-tight md:text-[15px]">
              {option.label}
            </span>
            <span className="text-[12px] leading-tight text-muted-foreground md:text-[13px]">
              {option.hint}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function IncomeBlock({
  amountRaw,
  setAmountRaw,
  amountMode,
  setAmountMode,
  grossMonthly,
  monthlyTake,
  monthlyTax,
  effectiveRatePct,
}: {
  amountRaw: string
  setAmountRaw: (value: string) => void
  amountMode: 'gross' | 'net'
  setAmountMode: (value: 'gross' | 'net') => void
  grossMonthly: number
  monthlyTake: number
  monthlyTax: number
  effectiveRatePct: number
}) {
  const showEcho = grossMonthly > 0
  const echoLabel = amountMode === 'gross' ? 'на руки' : 'до налогов'
  const echoValue = amountMode === 'gross' ? monthlyTake : grossMonthly

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex h-12 overflow-hidden rounded-[16px] border border-border bg-background">
          <MoneyInput
            placeholder="100 000"
            value={amountRaw}
            onChange={setAmountRaw}
            aria-label="Доход в месяц"
            className="h-full flex-1 border-none bg-transparent px-4 text-[18px] font-semibold tabular outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-0"
          />
          <div className="flex items-center gap-1 border-l border-border bg-muted/40 px-4 text-[14px] text-muted-foreground">
            <span className="font-medium text-foreground">₽ в мес.</span>
          </div>
        </div>

        <div className="inline-flex h-12 items-center gap-1 rounded-[16px] border border-border bg-background p-1 text-[13px]">
          {[
            { value: 'gross' as const, label: 'До налогов' },
            { value: 'net' as const, label: 'На руки' },
          ].map((option) => {
            const active = amountMode === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setAmountMode(option.value)}
                className={cn(
                  'h-full rounded-[12px] px-3 font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  active
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {showEcho ? (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[13px] text-muted-foreground md:text-[14px]">
          <span aria-hidden className="text-muted-foreground/60">
            →
          </span>
          <span className="font-display text-[18px] font-bold tabular leading-none text-foreground md:text-[20px]">
            {formatRubles(echoValue)}
          </span>
          <span>{echoLabel} в месяц</span>
          <span className="text-muted-foreground/50">·</span>
          <span>
            налог {formatRubles(monthlyTax)} ({effectiveRatePct}%)
          </span>
        </div>
      ) : null}
    </div>
  )
}

function ModeExtras({
  mode,
  children,
  setChildren,
  useProgressiveTax,
  setUseProgressiveTax,
  useChildDeduction,
  setUseChildDeduction,
  npdBusinessShare,
  setNpdBusinessShare,
  usnFixedContributions,
  setUsnFixedContributions,
  customRate,
  setCustomRate,
}: {
  mode: TaxMode
  children: string
  setChildren: (value: string) => void
  useProgressiveTax: boolean
  setUseProgressiveTax: (value: boolean) => void
  useChildDeduction: boolean
  setUseChildDeduction: (value: boolean) => void
  npdBusinessShare: string
  setNpdBusinessShare: (value: string) => void
  usnFixedContributions: string
  setUsnFixedContributions: (value: string) => void
  customRate: string
  setCustomRate: (value: string) => void
}) {
  if (mode === 'tk_rf') {
    return (
      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <SmallLabel>Уточнения по ТК</SmallLabel>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-muted-foreground md:text-[14px]">
            Детей для вычета:
          </span>
          <ChipSelect
            value={children}
            onChange={setChildren}
            options={[
              { value: '0', label: 'нет' },
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3+' },
            ]}
          />
        </div>
        <CheckLine
          checked={useProgressiveTax}
          onChange={setUseProgressiveTax}
          label="Прогрессивная шкала НДФЛ 13–22%"
        />
        <CheckLine
          checked={useChildDeduction}
          onChange={setUseChildDeduction}
          disabled={children === '0'}
          label="Учитывать стандартный вычет на детей"
        />
      </div>
    )
  }

  if (mode === 'npd') {
    return (
      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <SmallLabel>Откуда доход</SmallLabel>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[13px] text-muted-foreground md:text-[14px]">
            Доля от юрлиц / ИП:
          </span>
          <div className="flex h-10 w-[120px] items-center rounded-[12px] border border-border bg-background px-3">
          <input
            inputMode="numeric"
            value={npdBusinessShare}
            onChange={(event) => setNpdBusinessShare(event.target.value)}
            className="flex-1 border-none bg-transparent text-[14px] tabular outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-0"
            aria-label="Доля дохода от юрлиц и ИП"
          />
            <span className="text-[13px] text-muted-foreground">%</span>
          </div>
        </div>
        <p className="text-[12px] leading-relaxed text-muted-foreground md:text-[13px]">
          С физлиц — 4%, с юрлиц и ИП — 6%.
        </p>
      </div>
    )
  }

  if (mode === 'usn_6') {
    return (
      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <SmallLabel>Фикс-взносы за год</SmallLabel>
        <div className="flex h-10 w-[180px] items-center rounded-[12px] border border-border bg-background px-3">
          <MoneyInput
            value={usnFixedContributions}
            onChange={setUsnFixedContributions}
            aria-label="Фиксированные взносы за год"
            className="flex-1 border-none bg-transparent text-[14px] tabular outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-0"
          />
          <span className="text-[13px] text-muted-foreground">₽</span>
        </div>
        <p className="text-[12px] leading-relaxed text-muted-foreground md:text-[13px]">
          По умолчанию — 57 390 ₽ (2026). 1% сверх 300 000 ₽ учитывается
          автоматически.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <SmallLabel>Ставка налога</SmallLabel>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-[100px] items-center rounded-[12px] border border-border bg-background px-3">
          <input
            inputMode="numeric"
            value={customRate}
            onChange={(event) => setCustomRate(event.target.value)}
            className="flex-1 border-none bg-transparent text-[14px] tabular outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-0"
            aria-label="Ставка налога"
          />
          <span className="text-[13px] text-muted-foreground">%</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['6', '13', '15', '20'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCustomRate(preset)}
                className={cn(
                'rounded-full border px-2.5 py-1 text-[12px] font-medium tabular transition outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:text-[13px]',
                customRate === preset
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-foreground hover:border-primary/30',
              )}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function DatesBlock({
  advanceDay,
  setAdvanceDay,
  salaryDay,
  setSalaryDay,
}: {
  advanceDay: string
  setAdvanceDay: (value: string) => void
  salaryDay: string
  setSalaryDay: (value: string) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DayInput
        label="Аванс"
        hint="обычно 20–25 число"
        value={advanceDay}
        onChange={setAdvanceDay}
      />
      <DayInput
        label="Зарплата"
        hint="обычно 5–10 число следующего месяца"
        value={salaryDay}
        onChange={setSalaryDay}
      />
    </div>
  )
}

function DayInput({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-foreground">{label}</span>
      <div className="flex h-11 items-center rounded-[12px] border border-border bg-background px-3">
        <input
          inputMode="numeric"
          value={value}
          onChange={(event) => {
            const next = parseInt(event.target.value.replace(/\D+/g, ''), 10)
            if (Number.isNaN(next)) {
              onChange('')
              return
            }
            onChange(String(Math.max(1, Math.min(31, next))))
          }}
          className="flex-1 border-none bg-transparent text-[15px] font-semibold tabular outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-0"
          aria-label={label}
        />
        <span className="text-[13px] text-muted-foreground">числа</span>
      </div>
      <span className="text-[11px] text-muted-foreground md:text-[12px]">
        {hint}
      </span>
    </div>
  )
}

function MoneyInput({
  value,
  onChange,
  className = '',
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  value: string
  onChange: (value: string) => void
}) {
  const ref = useRef<HTMLInputElement | null>(null)
  const nextCaret = useRef<number | null>(null)

  useEffect(() => {
    if (nextCaret.current != null && ref.current) {
      const position = nextCaret.current
      ref.current.setSelectionRange(position, position)
      nextCaret.current = null
    }
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const before = input.value
    const caretBefore = input.selectionStart ?? before.length
    const digitsBeforeCaret = before
      .slice(0, caretBefore)
      .replace(/\D+/g, '').length
    const formatted = formatMoneyInput(before)

    let count = 0
    let newCaret = formatted.length
    if (digitsBeforeCaret === 0) {
      newCaret = 0
    } else {
      for (let index = 0; index < formatted.length; index++) {
        if (/\d/.test(formatted[index])) count++
        if (count >= digitsBeforeCaret) {
          newCaret = index + 1
          break
        }
      }
    }

    nextCaret.current = newCaret
    onChange(formatted)
  }

  return (
    <input
      ref={ref}
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      className={cn(
        className,
        'focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
      {...rest}
    />
  )
}

function EmptyHint() {
  return (
    <div className="mt-10 flex items-center justify-center rounded-[24px] border border-dashed border-border bg-card p-10 text-center text-[14px] text-muted-foreground md:mt-12 md:p-14">
      <span>Введите сумму дохода — покажем график выплат на год вперёд.</span>
    </div>
  )
}

function SalaryHero({
  result,
  mode,
}: {
  result: YearSalaryResult
  mode: TaxMode
}) {
  const todayIso = useMemo(() => {
    const today = new Date()
    return isoDate(today.getFullYear(), today.getMonth(), today.getDate())
  }, [])
  const nextEvent =
    result.events.find((event) => event.date >= todayIso) ?? result.events[0]

  if (!nextEvent) return null

  const days = Math.max(0, diffDays(todayIso, nextEvent.date))
  const monthIndex = nextEvent.forMonth
  const breakdown =
    mode === 'tk_rf'
      ? nextPaymentBreakdown(nextEvent, monthIndex)
      : null

  return (
    <section className="overflow-hidden rounded-[24px] border border-border/70 bg-card p-6 md:p-8">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Следующая выплата · {EVENT_LABELS[nextEvent.kind] ?? nextEvent.kind}
      </div>
      <div className="mt-4 grid gap-x-10 gap-y-7 md:grid-cols-[1fr_auto] md:items-start">
        <div className="flex flex-col gap-2.5">
          <div className="font-display text-[44px] font-bold leading-[0.9] tracking-tight tabular text-foreground md:text-[64px]">
            {formatRubles(nextEvent.net)}
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2 text-[14px] text-muted-foreground md:text-[15px]">
            <span className="font-medium text-foreground">
              {formatLongDate(nextEvent.date)}
            </span>
            <span>·</span>
            <span>
              {days === 0
                ? 'сегодня'
                : days === 1
                  ? 'завтра'
                  : `через ${days} ${pluralDays(days)}`}
            </span>
          </div>
          {breakdown ? (
            <div className="text-[13px] text-muted-foreground md:text-[14px]">
              {breakdown}
            </div>
          ) : (
            <div className="text-[13px] text-muted-foreground md:text-[14px]">
              {mode === 'tk_rf'
                ? 'выплата за часть месяца'
                : 'следующее поступление по текущему режиму'}
            </div>
          )}
        </div>
        <UpcomingStrip events={result.events} todayIso={todayIso} active={nextEvent.date} />
      </div>
    </section>
  )
}

function UpcomingStrip({
  events,
  todayIso,
  active,
}: {
  events: YearSalaryResult['events']
  todayIso: string
  active: string
}) {
  const upcoming = events.filter((event) => event.date >= todayIso).slice(0, 3)
  return (
    <ul className="flex flex-col gap-2 text-[13px] md:min-w-[260px] md:text-[14px]">
      {upcoming.map((event) => {
        const isActive = event.date === active
        return (
          <li
            key={`${event.kind}-${event.date}-${event.forMonth}`}
            className={cn(
              'flex items-baseline justify-between gap-3 rounded-lg border px-3 py-2 tabular',
              isActive
                ? 'border-primary/30 bg-primary/5 text-foreground'
                : 'border-transparent text-muted-foreground',
            )}
          >
            <span className="font-medium">{formatShortDate(event.date)}</span>
            <span className="text-muted-foreground">
              {EVENT_LABELS[event.kind] ?? event.kind}
            </span>
            <span className={cn('font-medium', isActive && 'text-primary')}>
              {formatRubles(event.net)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function ScheduleCard({
  result,
  mode,
  year,
  advanceDay,
  salaryDay,
  expanded,
  onToggleExpanded,
  onExport,
  exporting,
  adjustments,
  onChangeAdjustment,
}: {
  result: YearSalaryResult
  mode: TaxMode
  year: number
  advanceDay: number
  salaryDay: number
  expanded: boolean
  onToggleExpanded: () => void
  onExport: () => Promise<void>
  exporting: boolean
  adjustments: WorkdayAdjustments
  onChangeAdjustment: (
    monthIndex: number,
    field: keyof WorkdayAdjustment,
    value: number,
    max: number,
  ) => void
}) {
  const summary =
    mode === 'tk_rf'
      ? `Аванс ${advanceDay}-го · зарплата ${salaryDay}-го · в среднем ${formatRubles(result.averageMonthlyNet)} в месяц на руки`
      : `${result.events.length} ${pluralPayout(result.events.length)} в год · в среднем ${formatRubles(result.averageMonthlyNet)} в месяц на руки`
  return (
    <section className="overflow-hidden rounded-[24px] border border-border/70 bg-card">
      <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center md:gap-6 md:p-7">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-[20px] font-bold tracking-tight md:text-[24px]">
            Расписание выплат на {year}
          </h2>
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[13px] text-muted-foreground md:text-[14px]">
            {summary}
          </p>
        </div>

        <div className="md:justify-self-end">
          <Button
            type="button"
            size="lg"
            onClick={onExport}
            disabled={exporting}
            className="min-w-[190px]"
          >
            <Download />
            {exporting ? 'Готовим файл…' : 'Скачать таблицу'}
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
        aria-controls="salary-schedule-preview"
        className="flex w-full items-center justify-between gap-3 border-t border-border/70 bg-muted/30 px-5 py-3.5 text-left transition outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset md:px-7"
      >
        <span className="text-[14px] font-medium text-foreground md:text-[15px]">
          {expanded ? 'Скрыть' : 'Показать'} предпросмотр таблицы
        </span>
        <span
          className={cn(
            'text-muted-foreground transition-transform duration-300',
            expanded && 'rotate-180',
          )}
        >
          <ChevronDown className="size-4" />
        </span>
      </button>

      <div
        id="salary-schedule-preview"
        className="overflow-hidden border-t border-border/70 transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          maxHeight: expanded ? '1600px' : '0px',
          opacity: expanded ? 1 : 0,
        }}
        aria-hidden={!expanded}
        inert={!expanded ? true : undefined}
      >
        <div className="min-h-0">
          <SchedulePreview
            result={result}
            mode={mode}
            advanceDay={advanceDay}
            salaryDay={salaryDay}
            year={year}
            adjustments={adjustments}
            onChangeAdjustment={onChangeAdjustment}
          />
        </div>
      </div>
    </section>
  )
}

function SchedulePreview({
  result,
  mode,
  advanceDay,
  salaryDay,
  year,
  adjustments,
  onChangeAdjustment,
}: {
  result: YearSalaryResult
  mode: TaxMode
  advanceDay: number
  salaryDay: number
  year: number
  adjustments: WorkdayAdjustments
  onChangeAdjustment: (
    monthIndex: number,
    field: keyof WorkdayAdjustment,
    value: number,
    max: number,
  ) => void
}) {
  if (mode === 'tk_rf') {
    return (
      <SchedulePreviewTK
        result={result}
        advanceDay={advanceDay}
        salaryDay={salaryDay}
        year={year}
        adjustments={adjustments}
        onChangeAdjustment={onChangeAdjustment}
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-separate border-spacing-0">
        <thead>
          <tr>
            <th className={previewTh}>Месяц</th>
            <th className={cn(previewTh, 'text-right')}>На руки</th>
            <th className={cn(previewTh, 'text-right')}>Налог</th>
          </tr>
        </thead>
        <tbody>
          {result.months.map((month, index) => {
            return (
              <tr key={month.month} className="hover:bg-muted/20">
                <td className={cn(previewTd, 'font-medium text-foreground')}>
                  {MONTH_NAMES_RU[index]} {year}
                </td>
                <td className={cn(previewTd, 'text-right font-medium tabular text-foreground')}>
                  {formatRubles(month.net)}
                </td>
                <td className={cn(previewTd, 'text-right tabular text-muted-foreground')}>
                  {formatRubles(month.tax + month.contributions)}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={1}
              className="px-4 py-3 text-[12px] font-medium uppercase tracking-wider text-muted-foreground md:text-[13px]"
            >
              Итого за год
            </td>
            <td className="px-4 py-3 text-right text-[12px] tabular text-muted-foreground md:text-[13px]">
              {formatRubles(result.totals.gross)}
            </td>
            <td className="px-4 py-3 text-right text-[12px] tabular text-muted-foreground md:text-[13px]">
              {formatRubles(result.totals.tax + result.totals.contributions)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function SchedulePreviewTK({
  result,
  advanceDay,
  salaryDay,
  year,
  adjustments,
  onChangeAdjustment,
}: {
  result: YearSalaryResult
  advanceDay: number
  salaryDay: number
  year: number
  adjustments: WorkdayAdjustments
  onChangeAdjustment: (
    monthIndex: number,
    field: keyof WorkdayAdjustment,
    value: number,
    max: number,
  ) => void
}) {
  return (
    <div className="overflow-x-auto">
      <div className="border-b border-border/70 px-4 py-4 md:px-6">
        <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-[13px] leading-6 text-muted-foreground md:text-[14px]">
          <span className="font-medium text-foreground">
            Кликните по ячейке «1 — 15» или «16 — конец», чтобы учесть отпуск или
            больничный
          </span>
          {' — '}
          сумма за месяц пересчитается пропорционально.
        </div>
      </div>
      <table className="w-full min-w-[760px] border-separate border-spacing-0">
        <thead>
          <tr>
            <th className={previewTh}>Месяц</th>
            <th className={cn(previewTh, 'text-right')}>Норма дн.</th>
            <th className={cn(previewTh, 'text-right')}>1 — 15</th>
            <th className={cn(previewTh, 'text-right')}>16 — конец</th>
            <th className={cn(previewTh, 'text-right')}>Аванс ({advanceDay}-го)</th>
            <th className={cn(previewTh, 'text-right')}>Зарплата ({salaryDay}-го след.)</th>
            <th className={cn(previewTh, 'text-right')}>Итого</th>
          </tr>
        </thead>
        <tbody>
          {result.months.map((month, index) => {
            const daysInMonthTotal = daysInMonth(year, index)
            const adjusted = adjustedMonthSummary(
              year,
              month,
              adjustments[index],
            )
            const advanceDate = previousWorkdayDate(year, index, advanceDay)
            const salaryDate = previousWorkdayDate(year, index + 1, salaryDay)
            const firstHalfEdited =
              adjusted.firstHalf !== adjusted.defaultFirstHalf
            const secondHalfEdited =
              adjusted.secondHalf !== adjusted.defaultSecondHalf

            return (
              <tr key={month.month} className="hover:bg-muted/20">
                <td className={cn(previewTd, 'font-medium text-foreground')}>
                  {MONTH_NAMES_RU_GENITIVE[index]} {year}
                </td>
                <td className={cn(previewTd, 'text-right tabular text-foreground/85')}>
                  {daysInMonthTotal}
                </td>
                <td className={cn(previewTd, 'text-right')}>
                  <EditableWorkdayCell
                    label="1 — 15"
                    monthLabel={`${MONTH_NAMES_RU_GENITIVE[index]} ${year}`}
                    value={adjusted.firstHalf}
                    max={adjusted.defaultFirstHalf}
                    edited={firstHalfEdited}
                    onChange={(value) =>
                      onChangeAdjustment(
                        index,
                        'firstHalf',
                        value,
                        adjusted.defaultFirstHalf,
                      )
                    }
                  />
                </td>
                <td className={cn(previewTd, 'text-right')}>
                  <EditableWorkdayCell
                    label="16 — конец"
                    monthLabel={`${MONTH_NAMES_RU_GENITIVE[index]} ${year}`}
                    value={adjusted.secondHalf}
                    max={adjusted.defaultSecondHalf}
                    edited={secondHalfEdited}
                    onChange={(value) =>
                      onChangeAdjustment(
                        index,
                        'secondHalf',
                        value,
                        adjusted.defaultSecondHalf,
                      )
                    }
                  />
                </td>
                <td className={cn(previewTd, 'text-right')}>
                  <div className="font-medium tabular text-foreground">
                    {formatRubles(adjusted.advanceNet)}
                  </div>
                  <div className="text-[11px] text-muted-foreground md:text-[12px]">
                    {formatShortDate(advanceDate)}
                  </div>
                </td>
                <td className={cn(previewTd, 'text-right')}>
                  <div className="font-medium tabular text-foreground">
                    {formatRubles(adjusted.salaryNet)}
                  </div>
                  <div className="text-[11px] text-muted-foreground md:text-[12px]">
                    {formatShortDate(salaryDate)}
                  </div>
                </td>
                <td className={cn(previewTd, 'text-right font-display font-semibold tabular text-foreground')}>
                  {formatRubles(adjusted.net)}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={4}
              className="px-4 py-3 text-[12px] font-medium uppercase tracking-wider text-muted-foreground md:text-[13px]"
            >
              Итого за год
            </td>
            <td className="px-4 py-3 text-right text-[12px] tabular text-muted-foreground md:text-[13px]">
              налог {formatRubles(result.totals.tax)} ₽
            </td>
            <td className="px-4 py-3 text-right text-[12px] tabular text-muted-foreground md:text-[13px]">
              {Math.round(result.totals.effectiveRate * 100)}%
            </td>
            <td className="px-4 py-3 text-right font-display text-[15px] font-bold tabular text-foreground md:text-[16px]">
              {formatRubles(result.totals.net)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function EditableWorkdayCell({
  label,
  monthLabel,
  value,
  max,
  edited,
  onChange,
}: {
  label: string
  monthLabel: string
  value: number
  max: number
  edited: boolean
  onChange: (value: number) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex min-w-[76px] items-center justify-end rounded-lg border border-dashed px-3 py-2 text-right text-[13px] tabular transition outline-none',
            'focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            edited
              ? 'border-primary/40 bg-primary/10 font-semibold text-primary shadow-sm'
              : 'border-primary/20 bg-primary/[0.04] text-foreground/85 hover:border-primary/35 hover:bg-primary/[0.08]',
          )}
          aria-label={`Изменить количество рабочих дней для ${label} в ${monthLabel}`}
          title={`Кликните, чтобы изменить число рабочих дней для ${label}`}
        >
          {value}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4">
        <div className="space-y-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {label}
            </div>
            <div className="mt-1 text-[13px] leading-5 text-foreground">
              {monthLabel}
            </div>
            <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
              Уменьшите число, если в этой половине месяца были отпуск или
              больничный.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange(Math.max(0, value - 1))}
              disabled={value <= 0}
              className="grid size-9 place-items-center rounded-lg border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Уменьшить число рабочих дней для ${label}`}
            >
              <span className="text-lg leading-none">−</span>
            </button>
            <label className="flex min-w-0 flex-1 items-center rounded-xl border border-border bg-background px-3 py-2">
              <input
                type="number"
                min={0}
                max={max}
                value={value}
                onChange={(event) =>
                  onChange(
                    Math.max(0, Math.min(max, Number(event.target.value) || 0)),
                  )
                }
                className="w-full bg-transparent text-center text-[14px] font-medium outline-none tabular"
                aria-label={`Рабочие дни для ${label}`}
              />
            </label>
            <button
              type="button"
              onClick={() => onChange(Math.min(max, value + 1))}
              disabled={value >= max}
              className="grid size-9 place-items-center rounded-lg border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Увеличить число рабочих дней для ${label}`}
            >
              <span className="text-lg leading-none">+</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[12px] text-muted-foreground">
            <span>Доступно до {max} рабочих дней</span>
            <button
              type="button"
              onClick={() => onChange(max)}
              className="font-medium text-primary transition hover:text-primary/80"
            >
              Сбросить
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const previewTh =
  'border-b border-border bg-muted/40 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground md:text-[11px]'
const previewTd =
  'border-b border-border/60 px-4 py-3 align-top text-[12px] md:text-[13px]'

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function InsightGrid({
  result,
  mode,
  grossMonthly,
}: {
  result: YearSalaryResult
  mode: TaxMode
  grossMonthly: number
}) {
  const items = useMemo(
    () => buildInsightCards(result, mode, grossMonthly),
    [result, mode, grossMonthly],
  )

  return (
    <section className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <InsightCard key={item.headline} {...item} />
      ))}
    </section>
  )
}

function InsightCard({
  headline,
  value,
  body,
}: {
  headline: string
  value: string
  body: string
}) {
  return (
    <article className="rounded-[18px] border border-border bg-card p-5 md:p-6">
      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {headline}
      </div>
      <div className="mt-2 font-display text-[22px] font-bold leading-tight tracking-tight tabular text-foreground md:text-[26px]">
        {value}
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground md:text-[14px]">
        {body}
      </p>
    </article>
  )
}

function buildInsightCards(
  result: YearSalaryResult,
  mode: TaxMode,
  grossMonthly: number,
) {
  const annualGross = grossMonthly * 12
  const averageMonthly = formatRubles(result.averageMonthlyNet)
  const totalTax = formatRubles(result.totals.tax + result.totals.contributions)
  const annualNet = formatRubles(result.totals.net)

  if (mode === 'tk_rf') {
    const progressiveValue =
      annualGross > PROGRESSIVE_LIMIT ? '15%+' : '13%'
    const progressiveBody =
      annualGross > PROGRESSIVE_LIMIT
        ? `Доход выше порога 2,4 млн ₽ — часть суммы попадёт под повышенные ставки прогрессии НДФЛ.`
        : `Платите базовые 13%. До порога 2,4 млн ₽ — ещё ${formatRubles(PROGRESSIVE_LIMIT - annualGross)} годового дохода.`

    return [
      {
        headline: 'Прогрессивный НДФЛ',
        value: progressiveValue,
        body: progressiveBody,
      },
      {
        headline: 'В среднем в месяц',
        value: averageMonthly,
        body: 'Чистыми. Месяцы отличаются на ±1—3% из-за разного числа рабочих дней.',
      },
      {
        headline: 'Уйдёт на налоги',
        value: totalTax,
        body: `Эффективная ставка ${(result.totals.effectiveRate * 100).toFixed(1).replace('.', ',')}% — с учётом прогрессии НДФЛ.`,
      },
      {
        headline: 'Получите за год',
        value: annualNet,
        body: 'Чистыми после налогов. Среднее значение уже включает все месяцы года.',
      },
    ]
  }

  if (mode === 'npd') {
    const overLimit = annualGross > PROGRESSIVE_LIMIT
    return [
      {
        headline: 'Лимит НПД',
        value: `${formatRubles(Math.min(annualGross, PROGRESSIVE_LIMIT))} / 2 400 000 ₽`,
        body: overLimit
          ? 'Превышение лимита — режим нужно сменить до конца года.'
          : `Запас до конца года — ${formatRubles(PROGRESSIVE_LIMIT - annualGross)}.`,
      },
      {
        headline: 'В среднем в месяц',
        value: averageMonthly,
        body: 'Чистыми после НПД. Ставка зависит от того, кто платит доход.',
      },
      {
        headline: 'Уйдёт на налог',
        value: totalTax,
        body: `Эффективная ставка ${(result.totals.effectiveRate * 100).toFixed(1).replace('.', ',')}%.`,
      },
      {
        headline: 'Получите за год',
        value: annualNet,
        body: 'Чистыми после налога. Сервис считает всё локально, без отправки данных на сервер.',
      },
    ]
  }

  if (mode === 'usn_6') {
    return [
      {
        headline: 'Страховые взносы',
        value: formatRubles(result.totals.contributions),
        body: 'Фиксированные взносы и 1% с дохода свыше 300 000 ₽ уже включены в расчёт.',
      },
      {
        headline: 'В среднем в месяц',
        value: averageMonthly,
        body: 'Чистыми после налога и взносов.',
      },
      {
        headline: 'Уйдёт на налоги',
        value: totalTax,
        body: `Эффективная ставка ${(result.totals.effectiveRate * 100).toFixed(1).replace('.', ',')}% с учётом взносов.`,
      },
      {
        headline: 'Получите за год',
        value: annualNet,
        body: 'Чистыми после налогов и обязательных платежей.',
      },
    ]
  }

  return [
    {
      headline: 'Эффективная ставка',
      value: `${(result.totals.effectiveRate * 100).toFixed(1).replace('.', ',')}%`,
      body: 'Своя ставка без вычетов, прогрессии и фикс-взносов.',
    },
    {
      headline: 'В среднем в месяц',
      value: averageMonthly,
      body: 'Чистыми. Подходит для быстрого сценарного расчёта.',
    },
    {
      headline: 'Уйдёт на налоги',
      value: totalTax,
      body: 'Сумма налога по выбранной ставке от годового дохода.',
    },
    {
      headline: 'Получите за год',
      value: annualNet,
      body: 'Чистыми после выбранной ставки налога.',
    },
  ]
}

const COMPARISON_MODES: Array<{
  mode: Extract<TaxMode, 'tk_rf' | 'npd' | 'usn_6'>
  label: string
}> = [
  { mode: 'tk_rf', label: 'ТК РФ' },
  { mode: 'npd', label: 'НПД' },
  { mode: 'usn_6', label: 'ИП УСН 6%' },
]

function ComparePanel({
  input,
  currentMode,
  grossMonthly,
  expanded,
  onToggle,
}: {
  input: SalaryInput
  currentMode: TaxMode
  grossMonthly: number
  expanded: boolean
  onToggle: () => void
}) {
  const comparisons = useMemo(
    () =>
      COMPARISON_MODES.map(({ mode, label }) => ({
        mode,
        label,
        result: calculateSalary({
          ...input,
          mode,
          amount: grossMonthly,
          amountMode: 'gross',
          paymentSchedule:
            mode === 'tk_rf' ? input.paymentSchedule : undefined,
        }),
      })),
    [grossMonthly, input],
  )
  const bestAnnualNet = Math.max(
    ...comparisons.map(({ result }) => result.totals.net),
  )
  const contentId = 'salary-mode-comparison'

  return (
    <section className="overflow-hidden rounded-[24px] border border-border/70 bg-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left outline-none transition-colors hover:bg-muted/20 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset md:px-7 md:py-6"
      >
        <span className="flex min-w-0 flex-col gap-1">
          <span className="font-display text-[18px] font-bold leading-tight tracking-tight text-foreground md:text-[21px]">
            Сравнить с другими режимами
          </span>
          <span className="text-[13px] leading-relaxed text-muted-foreground md:text-[14px]">
            Та же сумма дохода в трёх режимах налогообложения
          </span>
        </span>
        <span
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-[transform,border-color,background-color,color] duration-300 motion-reduce:transition-none',
            expanded &&
              'rotate-180 border-primary/30 bg-primary/5 text-primary',
          )}
          aria-hidden="true"
        >
          <ChevronDown className="size-4" />
        </span>
      </button>

      <div
        id={contentId}
        className={cn(
          'overflow-hidden transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
          expanded
            ? 'max-h-[1400px] opacity-100 md:max-h-[760px]'
            : 'max-h-0 opacity-0',
        )}
        aria-hidden={!expanded}
      >
        <div className="border-t border-border/70 p-5 md:p-7">
          <div className="grid gap-4 md:grid-cols-3">
            {comparisons.map(({ mode, label, result }) => {
              const isCurrent = mode === currentMode
              const isBest = result.totals.net === bestAnnualNet

              return (
                <article
                  key={mode}
                  className={cn(
                    'flex flex-col gap-5 rounded-[20px] border bg-background p-5 md:p-6',
                    isBest
                      ? 'border-primary/40 bg-primary/[0.04]'
                      : 'border-border',
                  )}
                >
                  <div className="flex min-h-6 items-start justify-between gap-3">
                    <h3 className="text-[15px] font-semibold uppercase tracking-[0.06em] text-foreground md:text-[16px]">
                      {label}
                    </h3>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {isCurrent && (
                        <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-background">
                          Ваш
                        </span>
                      )}
                      {isBest && (
                        <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-primary-foreground">
                          Больше всего
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      На руки за год
                    </div>
                    <div className="mt-2 font-display text-[30px] font-bold leading-none tracking-tight text-foreground tabular md:text-[36px]">
                      {formatRubles(result.totals.net)}
                    </div>
                  </div>

                  <dl className="mt-auto space-y-2 text-[13px] md:text-[14px]">
                    <CompareRow
                      label="В месяц"
                      value={formatRubles(result.averageMonthlyNet)}
                    />
                    <CompareRow
                      label="Налог за год"
                      value={formatRubles(
                        result.totals.tax + result.totals.contributions,
                      )}
                    />
                    <CompareRow
                      label="Ставка"
                      value={`${(result.totals.effectiveRate * 100)
                        .toFixed(1)
                        .replace('.', ',')}%`}
                    />
                  </dl>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function CompareRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground tabular">{value}</dd>
    </div>
  )
}

function SmallLabel({ children }: { children: string }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </div>
  )
}

function ChipSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <div className="inline-flex h-9 items-center gap-1 rounded-full border border-border bg-background p-1">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'h-full rounded-full px-3 text-[13px] font-medium transition tabular outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              active
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function CheckLine({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <label
      className={cn(
        'flex items-center gap-2.5 text-[13px] md:text-[14px]',
        disabled
          ? 'cursor-not-allowed text-muted-foreground'
          : 'cursor-pointer text-foreground',
      )}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onChange(value === true)}
      />
      <span>{label}</span>
    </label>
  )
}

function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
    .format(parseIso(iso))
    .replace(/\./g, '')
}

function pluralDays(value: number): string {
  const mod100 = value % 100
  const mod10 = value % 10
  if (mod100 >= 11 && mod100 <= 14) return 'дней'
  if (mod10 === 1) return 'день'
  if (mod10 >= 2 && mod10 <= 4) return 'дня'
  return 'дней'
}

function pluralPayout(value: number): string {
  const mod100 = value % 100
  const mod10 = value % 10
  if (mod100 >= 11 && mod100 <= 14) return 'выплат'
  if (mod10 === 1) return 'выплата'
  if (mod10 >= 2 && mod10 <= 4) return 'выплаты'
  return 'выплат'
}

function parseDay(value: string, fallback: number): number {
  const parsed = parseInt(value.replace(/\D+/g, ''), 10)
  if (Number.isNaN(parsed)) return fallback
  return Math.max(1, Math.min(31, parsed))
}

function parsePercent(value: string, fallback: number): number {
  const parsed = parseInt(value.replace(/\D+/g, ''), 10)
  if (Number.isNaN(parsed)) return fallback
  return Math.max(0, Math.min(100, parsed))
}

function nextPaymentBreakdown(
  event: YearSalaryResult['events'][number],
  monthIndex: number,
): string | null {
  if (event.kind === 'advance') {
    const workdays = countWorkdays(YEAR, monthIndex, 1, 15)
    return `за работу 1—15 ${MONTH_NAMES_RU_GENITIVE[monthIndex]} · ${workdays} раб. дней`
  }

  if (event.kind === 'salary') {
    const lastDay = daysInMonth(YEAR, monthIndex)
    const workdays = countWorkdays(YEAR, monthIndex, 16, lastDay)
    return `за работу 16—${lastDay} ${MONTH_NAMES_RU_GENITIVE[monthIndex]} · ${workdays} раб. дней`
  }
  return null
}

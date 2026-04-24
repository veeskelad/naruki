import { useMemo, useState } from 'react'
import { Download, HelpCircle, Lightbulb, Lock } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { calcSalary, fmt, type CalcResult, type TaxMode } from '@/lib/salary/stub'
import { cn } from '@/lib/utils'

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

function parseMoney(raw: string): number {
  const digits = raw.replace(/\D+/g, '')
  return digits ? parseInt(digits, 10) : 0
}

export function SalaryPage() {
  const [employment, setEmployment] = useState<TaxMode>('tk')
  const [grossMode, setGrossMode] = useState(true)
  const [grossRaw, setGrossRaw] = useState('200 000')
  const [children, setChildren] = useState('0')
  const [useProgressive, setUseProgressive] = useState(true)
  const [useChildDeduction, setUseChildDeduction] = useState(true)
  const [npdLegalShare, setNpdLegalShare] = useState('60')
  const [npdBonus, setNpdBonus] = useState(false)
  const [usnContribs, setUsnContribs] = useState('57 390')
  const [customRate, setCustomRate] = useState('13')
  const [advanceDay, setAdvanceDay] = useState('15')
  const [salaryDay, setSalaryDay] = useState('30')

  const grossMonthly = parseMoney(grossRaw)

  const result: CalcResult = useMemo(
    () =>
      calcSalary({
        mode: employment,
        grossMonthly,
        children: parseInt(children, 10) || 0,
        useProgressive,
        useChildDeduction,
        npdLegalSharePct: parseMoney(npdLegalShare),
        usnContributionsYear: parseMoney(usnContribs),
        customRatePct: parseMoney(customRate),
      }),
    [
      employment,
      grossMonthly,
      children,
      useProgressive,
      useChildDeduction,
      npdLegalShare,
      usnContribs,
      customRate,
    ],
  )

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-20 md:pt-14 md:pb-28">
        <SalaryHeader />

        <div className="mt-8">
          <NextPayments
            mode={employment}
            result={result}
            grossMonthly={grossMonthly}
            advanceDay={parseInt(advanceDay, 10) || 15}
            salaryDay={parseInt(salaryDay, 10) || 30}
          />
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <SalaryForm
            employment={employment}
            onEmploymentChange={(v) => setEmployment(v as TaxMode)}
            grossMode={grossMode}
            onGrossModeChange={setGrossMode}
            grossRaw={grossRaw}
            onGrossRawChange={setGrossRaw}
            children={children}
            onChildrenChange={setChildren}
            useProgressive={useProgressive}
            onUseProgressiveChange={setUseProgressive}
            useChildDeduction={useChildDeduction}
            onUseChildDeductionChange={setUseChildDeduction}
            npdLegalShare={npdLegalShare}
            onNpdLegalShareChange={setNpdLegalShare}
            npdBonus={npdBonus}
            onNpdBonusChange={setNpdBonus}
            usnContribs={usnContribs}
            onUsnContribsChange={setUsnContribs}
            customRate={customRate}
            onCustomRateChange={setCustomRate}
            advanceDay={advanceDay}
            onAdvanceDayChange={setAdvanceDay}
            salaryDay={salaryDay}
            onSalaryDayChange={setSalaryDay}
          />

          <div className="flex flex-col gap-6">
            <SummaryCards
              result={result}
              grossMonthly={grossMonthly}
              isDemo={grossMonthly <= 0}
            />
            <FocusCard
              result={result}
              grossMonthly={grossMonthly}
              mode={employment}
              children={parseInt(children, 10) || 0}
            />
          </div>
        </div>

        <div className="mt-8">
          <CashflowSection result={result} />
        </div>
      </div>
    </PageShell>
  )
}

function SalaryHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight md:text-[40px]">
          Сколько придёт на&nbsp;руки
        </h1>
        <p className="mt-2 max-w-[620px] text-[15px] leading-relaxed text-muted-foreground md:text-base">
          Покажем выплаты по&nbsp;месяцам и&nbsp;итог за&nbsp;год с&nbsp;учётом твоего режима работы.
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[12px] text-muted-foreground">
          <Lock className="size-3" strokeWidth={1.8} />
          Ничего не&nbsp;уходит на&nbsp;сервер
        </div>
      </div>
      <Button variant="outline" className="gap-2 rounded-xl">
        <Download className="size-4" />
        Экспорт в Excel
      </Button>
    </div>
  )
}

function SalaryForm({
  employment,
  onEmploymentChange,
  grossMode,
  onGrossModeChange,
  grossRaw,
  onGrossRawChange,
  children,
  onChildrenChange,
  useProgressive,
  onUseProgressiveChange,
  useChildDeduction,
  onUseChildDeductionChange,
  npdLegalShare,
  onNpdLegalShareChange,
  npdBonus,
  onNpdBonusChange,
  usnContribs,
  onUsnContribsChange,
  customRate,
  onCustomRateChange,
  advanceDay,
  onAdvanceDayChange,
  salaryDay,
  onSalaryDayChange,
}: {
  employment: string
  onEmploymentChange: (v: string) => void
  grossMode: boolean
  onGrossModeChange: (v: boolean) => void
  grossRaw: string
  onGrossRawChange: (v: string) => void
  children: string
  onChildrenChange: (v: string) => void
  useProgressive: boolean
  onUseProgressiveChange: (v: boolean) => void
  useChildDeduction: boolean
  onUseChildDeductionChange: (v: boolean) => void
  npdLegalShare: string
  onNpdLegalShareChange: (v: string) => void
  npdBonus: boolean
  onNpdBonusChange: (v: boolean) => void
  usnContribs: string
  onUsnContribsChange: (v: string) => void
  customRate: string
  onCustomRateChange: (v: string) => void
  advanceDay: string
  onAdvanceDayChange: (v: string) => void
  salaryDay: string
  onSalaryDayChange: (v: string) => void
}) {
  return (
    <form className="flex flex-col gap-5 rounded-[24px] border border-border/60 bg-card p-6 md:p-7">
      {/* Общие параметры */}
      <Field label="Тип занятости">
        <Select value={employment} onValueChange={onEmploymentChange}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tk">По ТК РФ</SelectItem>
            <SelectItem value="npd">Самозанятый (НПД)</SelectItem>
            <SelectItem value="ip_usn">ИП УСН 6%</SelectItem>
            <SelectItem value="custom">Свой процент</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field
        label={grossMode ? 'Сумма до налогов' : 'Сумма на руки'}
        right={
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn(grossMode && 'text-foreground')}>До налогов</span>
            <Switch
              checked={!grossMode}
              onCheckedChange={(v) => onGrossModeChange(!v)}
            />
            <span className={cn(!grossMode && 'text-foreground')}>На руки</span>
          </div>
        }
      >
        <div className="flex h-11 overflow-hidden rounded-xl border border-border/60 bg-white">
          <Input
            className="h-full border-none bg-transparent text-[15px] shadow-none focus-visible:ring-0"
            inputMode="numeric"
            placeholder="200 000"
            value={grossRaw}
            onChange={(e) => onGrossRawChange(e.target.value)}
          />
          <div className="flex items-center gap-1 border-l border-border/60 bg-muted/50 px-3 text-sm text-muted-foreground">
            <span>₽</span>
            <Select defaultValue="month">
              <SelectTrigger className="h-auto border-none bg-transparent p-0 text-sm shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="month">в&nbsp;месяц</SelectItem>
                <SelectItem value="year">в&nbsp;год</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Field>

      {/* Слот режима — фиксированная высота, чтобы форма не прыгала */}
      <div className="flex min-h-[240px] flex-col gap-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {employment === 'tk' && 'Параметры ТК РФ'}
          {employment === 'npd' && 'Параметры НПД'}
          {employment === 'ip_usn' && 'Параметры ИП УСН 6%'}
          {employment === 'custom' && 'Своя ставка'}
        </div>

        {employment === 'tk' && (
          <>
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                График выплат
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="Аванс">
                  <Select value={advanceDay} onValueChange={onAdvanceDayChange}>
                    <SelectTrigger className="h-11 rounded-xl bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Зарплата">
                  <Select value={salaryDay} onValueChange={onSalaryDayChange}>
                    <SelectTrigger className="h-11 rounded-xl bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>

            <Field label="Дети">
              <Select value={children} onValueChange={onChildrenChange}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Нет</SelectItem>
                  <SelectItem value="1">1 ребёнок</SelectItem>
                  <SelectItem value="2">2 детей</SelectItem>
                  <SelectItem value="3">3 и больше</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </>
        )}

        {employment === 'npd' && (
          <>
            <Field label="Доля дохода от юрлиц, %">
              <div className="flex h-11 items-center gap-2 rounded-xl border border-border/60 bg-white px-3">
                <Input
                  className="border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
                  inputMode="numeric"
                  placeholder="60"
                  value={npdLegalShare}
                  onChange={(e) => onNpdLegalShareChange(e.target.value)}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </Field>
            <CheckboxWithTooltip
              id="npd-bonus"
              label="Стартовый бонус НПД"
              checked={npdBonus}
              onCheckedChange={onNpdBonusChange}
              tooltip="Разовый бонус 10 000 ₽ даёт 1 п.п. скидки к ставке: 4%→3% с физлиц, 6%→5% с юрлиц — пока бонус не исчерпан."
            />
          </>
        )}

        {employment === 'ip_usn' && (
          <Field label="Уплаченные фикс-взносы за год">
            <div className="flex h-11 items-center gap-2 rounded-xl border border-border/60 bg-white px-3">
              <Input
                className="border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
                inputMode="numeric"
                placeholder="55 500"
                value={usnContribs}
                onChange={(e) => onUsnContribsChange(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">₽</span>
            </div>
          </Field>
        )}

        {employment === 'custom' && (
          <Field label="Ставка налога">
            <div className="flex h-11 items-center gap-2 rounded-xl border border-border/60 bg-white px-3">
              <Input
                className="border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
                inputMode="numeric"
                placeholder="13"
                value={customRate}
                onChange={(e) => onCustomRateChange(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </Field>
        )}
      </div>

      {/* Уточнения — чекбоксы с tooltip (только для ТК РФ) */}
      {employment === 'tk' && (
        <div className="flex flex-col gap-3 border-t border-border/60 pt-5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Уточнения
          </div>
          <CheckboxWithTooltip
            id="progressive-ndfl"
            label="Прогрессивный НДФЛ 2025+"
            checked={useProgressive}
            onCheckedChange={onUseProgressiveChange}
            tooltip="С 2025 года ставка растёт с дохода 2,4 млн ₽ в год — до 22%. Снимите галку, чтобы считать по плоской 13%."
          />
          <CheckboxWithTooltip
            id="child-deduction"
            label="Учитывать вычеты на детей"
            checked={useChildDeduction}
            onCheckedChange={onUseChildDeductionChange}
            disabled={children === '0'}
            tooltip="Стандартный вычет из налоговой базы: 1 400 ₽ на первого и второго ребёнка, 3 000 ₽ — на третьего и далее. Действует пока доход с начала года ≤ 450 000 ₽."
          />
        </div>
      )}

      {/* Placeholder checkbox block — keep layout stable when no refinements */}
      {employment !== 'tk' && employment !== 'npd' && (
        <div className="flex flex-col gap-3 border-t border-border/60 pt-5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Уточнения
          </div>
          <p className="text-[13px] text-muted-foreground">
            Для этого режима дополнительных уточнений нет.
          </p>
        </div>
      )}

      <Button type="button" className="mt-2 h-11 w-full rounded-xl md:w-auto md:self-start md:px-8">
        Рассчитать
      </Button>
    </form>
  )
}

function Field({
  label,
  right,
  children,
}: {
  label: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted-foreground">
          {label}
        </span>
        {right}
      </div>
      {children}
    </div>
  )
}

function CheckboxWithTooltip({
  id,
  label,
  checked,
  onCheckedChange,
  tooltip,
  disabled = false,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  tooltip: string
  disabled?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 text-[14px]',
        disabled && 'opacity-50',
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        disabled={disabled}
        className="mt-0.5"
      />
      <label
        htmlFor={id}
        className="flex select-none items-center gap-1.5 text-foreground"
      >
        {label}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Подробнее"
              className="inline-flex text-muted-foreground transition hover:text-foreground"
            >
              <HelpCircle className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[280px] text-[12px]">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </label>
    </div>
  )
}

const DEMO_GROSS = 100_000

function SummaryCards({
  result,
  grossMonthly,
  isDemo,
}: {
  result: CalcResult
  grossMonthly: number
  isDemo: boolean
}) {
  const shownGross = isDemo ? DEMO_GROSS : grossMonthly
  const shownResult = isDemo
    ? calcSalary({
        mode: 'tk',
        grossMonthly: DEMO_GROSS,
        children: 0,
        useProgressive: true,
        useChildDeduction: true,
        npdLegalSharePct: 60,
        usnContributionsYear: 57_390,
        customRatePct: 13,
      })
    : result

  const monthlyTax = Math.round(shownResult.totals.tax / 12)
  const monthlyTake = shownResult.avgMonthlyTake
  const rate = shownResult.totals.effectiveRatePct

  return (
    <div className="relative">
      {isDemo && (
        <div className="pointer-events-none absolute -top-3 right-3 z-10 rounded-full border border-border/60 bg-background/90 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
          Демо: пример для&nbsp;100&nbsp;000&nbsp;₽ до&nbsp;налогов
        </div>
      )}
      <div
        className={cn(
          'grid grid-cols-2 gap-3',
          isDemo && 'opacity-60',
        )}
      >
        <SummaryCard
          label="Доход до налогов"
          value={`${fmt(shownGross)} ₽`}
          hint="в месяц"
        />
        <SummaryCard
          label={`Налоги (${rate}%)`}
          value={`${fmt(monthlyTax)} ₽`}
          hint="в месяц"
        />
        <SummaryCard
          label="На руки"
          value={`${fmt(monthlyTake)} ₽`}
          hint="в месяц"
          accent
        />
        <SummaryCard
          label="За год на руки"
          value={`${fmt(shownResult.totals.take)} ₽`}
          hint="итого за 12 мес."
          accent
        />
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string
  value: string
  hint: string
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        'flex h-[120px] flex-col justify-between rounded-[20px] border p-4 md:h-[132px] md:p-5',
        accent
          ? 'border-primary/20 bg-primary/5'
          : 'border-border/60 bg-card',
      )}
    >
      <div className="text-[12px] font-medium text-muted-foreground">
        {label}
      </div>
      <div>
        <div className="text-[22px] font-semibold tabular-nums tracking-tight text-foreground md:text-[26px]">
          {value}
        </div>
        <div className="mt-1 text-[12px] text-muted-foreground">{hint}</div>
      </div>
    </div>
  )
}

function FocusCard({
  result,
  grossMonthly,
  mode,
  children,
}: {
  result: CalcResult
  grossMonthly: number
  mode: string
  children: number
}) {
  if (grossMonthly <= 0) {
    return (
      <div className="flex items-start gap-3 rounded-[20px] border border-border/60 bg-muted/40 p-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
          <Lightbulb className="size-4" />
        </span>
        <div className="flex flex-col gap-1">
          <div className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
            На что обратить внимание
          </div>
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            Введите сумму дохода — покажем, где обычно теряются деньги в&nbsp;этом режиме.
          </p>
        </div>
      </div>
    )
  }

  const insights = buildInsights({ result, grossMonthly, mode, children })

  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-primary/20 bg-primary/5 p-5">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-xl bg-primary/15 text-primary">
          <Lightbulb className="size-4" />
        </span>
        <div className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
          На что обратить внимание
        </div>
      </div>
      <ul className="flex flex-col gap-2 text-[14px] leading-relaxed text-foreground/85">
        {insights.map((text, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-[8px] size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function buildInsights({
  result,
  grossMonthly,
  mode,
  children,
}: {
  result: CalcResult
  grossMonthly: number
  mode: string
  children: number
}): string[] {
  const out: string[] = []
  const annualGross = grossMonthly * 12
  const rate = result.totals.effectiveRatePct

  if (mode === 'tk') {
    if (annualGross > 2_400_000) {
      const extra = annualGross - 2_400_000
      out.push(
        `Доход за год ${fmt(annualGross)} ₽ — попадает под прогрессивный НДФЛ. Сверх 2,4 млн ₽ (${fmt(extra)} ₽) считается по повышенной ставке.`,
      )
    }
    if (children > 0) {
      const months = Math.min(12, Math.floor(450_000 / Math.max(1, grossMonthly)))
      out.push(
        `Вычет на детей работает до дохода 450 000 ₽ с начала года — это примерно ${months} мес. при текущей зарплате.`,
      )
    }
    if (out.length === 0) {
      out.push(
        `Эффективная ставка — ${rate}%. В годовом обзоре видно, как НДФЛ перераспределяется между авансом и зарплатой.`,
      )
    }
  } else if (mode === 'npd') {
    out.push(
      `Лимит НПД — 2,4 млн ₽ в год. Текущий годовой доход — ${fmt(annualGross)} ₽.`,
    )
    out.push(
      `Ставка меняется от доли юрлиц в выручке: с физлиц 4%, с ИП и организаций 6%.`,
    )
  } else if (mode === 'ip_usn') {
    const contribs = 57_390
    out.push(
      `Фикс-взносы ИП (${fmt(contribs)} ₽ в 2026) вычитаются из налога УСН — платите разницу, а не сумму налога полностью.`,
    )
    if (annualGross > 300_000) {
      const extra = Math.round((annualGross - 300_000) * 0.01)
      out.push(
        `1% сверх 300 000 ₽ в год — добавится к фикс-взносам. Ориентир: ${fmt(extra)} ₽ дополнительно к концу года.`,
      )
    }
  } else if (mode === 'custom') {
    out.push(
      `Простая fallback-ставка ${rate}% — без прогрессии и вычетов. Подходит для прикидки.`,
    )
  }

  return out.slice(0, 3)
}

function NextPayments({
  mode,
  result,
  grossMonthly,
  advanceDay,
  salaryDay,
}: {
  mode: string
  result: CalcResult
  grossMonthly: number
  advanceDay: number
  salaryDay: number
}) {
  const today = new Date()
  const now = today.getDate()
  const monthName = (d: Date) =>
    MONTHS[d.getMonth()].toLowerCase()

  const nextByDay = (day: number) => {
    const d = new Date(today.getFullYear(), today.getMonth(), day)
    if (day <= now) d.setMonth(d.getMonth() + 1)
    return d
  }

  const currentMonthIdx = today.getMonth()
  const currentMonthly = result.monthly[currentMonthIdx] ?? result.monthly[0]
  const isEmpty = grossMonthly <= 0

  if (mode === 'tk') {
    const advDate = nextByDay(advanceDay)
    const salDate = nextByDay(salaryDay)
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <NextCard
          label="Ближайший аванс"
          value={isEmpty ? '—' : `${fmt(currentMonthly.advance)} ₽`}
          hint={`${advanceDay} ${monthName(advDate)}`}
        />
        <NextCard
          label="Ближайшая зарплата"
          value={isEmpty ? '—' : `${fmt(currentMonthly.salary)} ₽`}
          hint={`${salaryDay} ${monthName(salDate)}`}
        />
        <NextCard
          label="На руки в месяц"
          value={isEmpty ? '—' : `${fmt(result.avgMonthlyTake)} ₽`}
          hint="средняя выплата"
          accent
        />
        <NextCard
          label="За год"
          value={isEmpty ? '—' : `${fmt(result.totals.take)} ₽`}
          hint="после налогов"
          accent
        />
      </div>
    )
  }

  // НПД / ИП УСН / Custom — нет авансов, показываем поступление и налог
  const monthlyTax = isEmpty ? 0 : Math.round(result.totals.tax / 12)
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <NextCard
        label="Поступление"
        value={isEmpty ? '—' : `${fmt(grossMonthly)} ₽`}
        hint="до налога, в месяц"
      />
      <NextCard
        label="Налог"
        value={isEmpty ? '—' : `${fmt(monthlyTax)} ₽`}
        hint={`ставка ${result.totals.effectiveRatePct}%`}
      />
      <NextCard
        label="На руки в месяц"
        value={isEmpty ? '—' : `${fmt(result.avgMonthlyTake)} ₽`}
        hint="после налогов"
        accent
      />
      <NextCard
        label="За год"
        value={isEmpty ? '—' : `${fmt(result.totals.take)} ₽`}
        hint="итого"
        accent
      />
    </div>
  )
}

function NextCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string
  value: string
  hint: string
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        'flex h-[120px] flex-col justify-between rounded-[20px] border p-4',
        accent
          ? 'border-primary/20 bg-primary/5'
          : 'border-border/60 bg-card',
      )}
    >
      <div className="text-[12px] font-medium text-muted-foreground">
        {label}
      </div>
      <div>
        <div className="text-[20px] font-semibold tabular-nums tracking-tight text-foreground md:text-[22px]">
          {value}
        </div>
        <div className="mt-1 text-[12px] text-muted-foreground">{hint}</div>
      </div>
    </div>
  )
}

function CashflowSection({ result }: { result: CalcResult }) {
  const rate = result.totals.effectiveRatePct
  return (
    <div className="rounded-[24px] border border-border/60 bg-card p-5 md:p-6">
      <Tabs defaultValue="chart">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[18px] font-semibold tracking-tight md:text-xl">
            Денежный поток по месяцам
          </h2>
          <TabsList className="rounded-xl">
            <TabsTrigger value="chart" className="rounded-lg">
              График
            </TabsTrigger>
            <TabsTrigger value="table" className="rounded-lg">
              Таблица
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chart" className="mt-5">
          <ChartStub result={result} />
          <p className="mt-4 text-[13px] text-muted-foreground">
            Средний доход на руки — {fmt(result.avgMonthlyTake)}&nbsp;₽ / мес · налоговая нагрузка {rate}%
          </p>
        </TabsContent>

        <TabsContent value="table" className="mt-5">
          <MonthlyTable result={result} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ChartStub({ result }: { result: CalcResult }) {
  const max = Math.max(1, ...result.monthly.map((m) => m.take))
  return (
    <div className="grid grid-cols-12 gap-2 md:gap-3">
      {result.monthly.map((m, i) => {
        const advH = m.take > 0 ? (m.advance / max) * 100 : 0
        const salH = m.take > 0 ? (m.salary / max) * 100 : 0
        return (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="flex h-40 w-full flex-col-reverse overflow-hidden rounded-lg bg-muted/40">
              <div
                className="w-full bg-primary"
                style={{ height: `${advH}%` }}
                title={`Аванс ${fmt(m.advance)} ₽`}
              />
              <div
                className="w-full bg-primary/40"
                style={{ height: `${salH}%` }}
                title={`Зарплата ${fmt(m.salary)} ₽`}
              />
            </div>
            <span className="text-[11px] text-muted-foreground">
              {MONTHS[i].slice(0, 3)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function MonthlyTable({ result }: { result: CalcResult }) {
  const totalAdv = result.monthly.reduce((s, m) => s + m.advance, 0)
  const totalSal = result.monthly.reduce((s, m) => s + m.salary, 0)
  const totalTake = result.totals.take
  const totalTax = result.totals.tax

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-border/60 md:block">
        <table className="w-full table-fixed text-[14px] tabular-nums">
          <colgroup>
            <col className="w-[14%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col className="w-[18%]" />
            <col className="w-[16%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead className="bg-muted/50 text-left text-[12px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Месяц</th>
              <th className="px-4 py-3 font-medium text-right">Аванс</th>
              <th className="px-4 py-3 font-medium text-right">Зарплата</th>
              <th className="px-4 py-3 font-medium text-right">На руки</th>
              <th className="px-4 py-3 font-medium text-right">Налоги</th>
              <th className="px-4 py-3 font-medium text-right">Накопительно</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {result.monthly.map((m, i) => (
              <tr key={i} className="bg-white">
                <td className="px-4 py-3 font-medium">{MONTHS[i]}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {fmt(m.advance)} ₽
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {fmt(m.salary)} ₽
                </td>
                <td className="px-4 py-3 text-right font-medium text-emerald-700">
                  {fmt(m.take)} ₽
                </td>
                <td className="px-4 py-3 text-right text-rose-600">
                  {fmt(m.tax)} ₽
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {fmt(m.cumulative)} ₽
                </td>
              </tr>
            ))}
            <tr className="bg-muted/30 font-semibold">
              <td className="px-4 py-3">Итого</td>
              <td className="px-4 py-3 text-right">{fmt(totalAdv)} ₽</td>
              <td className="px-4 py-3 text-right">{fmt(totalSal)} ₽</td>
              <td className="px-4 py-3 text-right text-emerald-700">
                {fmt(totalTake)} ₽
              </td>
              <td className="px-4 py-3 text-right text-rose-600">
                {fmt(totalTax)} ₽
              </td>
              <td className="px-4 py-3" />
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {result.monthly.map((m, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-white p-4"
          >
            <div className="text-[15px] font-medium">{MONTHS[i]}</div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] tabular-nums">
              <dt className="text-muted-foreground">Аванс</dt>
              <dd className="text-right">{fmt(m.advance)} ₽</dd>
              <dt className="text-muted-foreground">Зарплата</dt>
              <dd className="text-right">{fmt(m.salary)} ₽</dd>
              <dt className="text-muted-foreground">На руки</dt>
              <dd className="text-right font-medium text-emerald-700">
                {fmt(m.take)} ₽
              </dd>
              <dt className="text-muted-foreground">Налоги</dt>
              <dd className="text-right text-rose-600">{fmt(m.tax)} ₽</dd>
            </dl>
          </div>
        ))}
      </div>
    </>
  )
}

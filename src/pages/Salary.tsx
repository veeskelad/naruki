import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Download,
  Info,
  Lock,
  WalletCards,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { FaqSection } from '@/components/content/FaqSection'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  calculateSalary,
  type AmountMode,
  type SalaryInput,
  type TaxMode,
} from '@/lib/salary'
import {
  formatMoneyInput,
  formatRubles,
  formatShortDate,
  parseMoney,
} from '@/lib/format'
import { exportSalaryXlsx } from '@/lib/export/salary'
import { SALARY_FAQ } from '@/seo/content'
import { cn } from '@/lib/utils'

const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

const MODES: Array<{ value: TaxMode; label: string; hint: string }> = [
  { value: 'tk_rf', label: 'ТК РФ', hint: 'аванс + зарплата' },
  { value: 'npd', label: 'Самозанятый', hint: 'НПД 4% / 6%' },
  { value: 'usn_6', label: 'ИП УСН 6%', hint: 'налог и взносы' },
  { value: 'custom', label: 'Своя ставка', hint: 'произвольный %' },
]

export function SalaryPage() {
  const [mode, setMode] = useState<TaxMode>('tk_rf')
  const [amountRaw, setAmountRaw] = useState('100 000')
  const [amountMode, setAmountMode] = useState<AmountMode>('gross')
  const [children, setChildren] = useState(0)
  const [useProgressiveTax, setUseProgressiveTax] = useState(true)
  const [useChildDeduction, setUseChildDeduction] = useState(false)
  const [npdBusinessShare, setNpdBusinessShare] = useState(60)
  const [useNpdBonus, setUseNpdBonus] = useState(true)
  const [usnContributions, setUsnContributions] = useState('57 390')
  const [customRate, setCustomRate] = useState(13)
  const [advanceDay, setAdvanceDay] = useState(25)
  const [salaryDay, setSalaryDay] = useState(10)
  const [exporting, setExporting] = useState(false)

  const input = useMemo<SalaryInput>(
    () => ({
      year: 2026,
      mode,
      amount: parseMoney(amountRaw),
      amountMode,
      children,
      useProgressiveTax,
      useChildDeduction,
      npdBusinessShare,
      useNpdBonus,
      usnFixedContributions: parseMoney(usnContributions),
      customRate,
      paymentSchedule: { advanceDay, salaryDay, advanceShare: 0.4 },
    }),
    [
      mode,
      amountRaw,
      amountMode,
      children,
      useProgressiveTax,
      useChildDeduction,
      npdBusinessShare,
      useNpdBonus,
      usnContributions,
      customRate,
      advanceDay,
      salaryDay,
    ],
  )
  const result = useMemo(() => calculateSalary(input), [input])
  const nextPayment = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return result.events.find((event) => event.date >= today) ?? result.events[0]
  }, [result.events])

  const onExport = async () => {
    setExporting(true)
    try {
      await exportSalaryXlsx(input, result)
    } finally {
      setExporting(false)
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 pt-9 pb-20 md:px-6 md:pt-14 md:pb-28">
        <header>
          <h1 className="font-display text-[36px] font-bold leading-[1.05] tracking-tight md:text-[52px]">
            Сколько и&nbsp;когда придёт
          </h1>
          <p className="mt-4 max-w-[680px] text-[15px] leading-relaxed text-muted-foreground md:text-[18px]">
            Заполните три шага — получите сумму на руки и даты выплат на
            2026&nbsp;год. Сохраните результат в Excel.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" />
            Цифры остаются только в вашем браузере
          </div>
        </header>

        <section
          aria-label="Параметры расчёта"
          className="mt-8 divide-y divide-border overflow-hidden rounded-[24px] border border-border bg-card md:mt-10"
        >
          <WizardStep
            number={1}
            title="Тип занятости"
            hint={MODES.find((item) => item.value === mode)?.label}
          >
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {MODES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={item.value === mode}
                  onClick={() => setMode(item.value)}
                  className={cn(
                    'min-h-16 rounded-[14px] border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    item.value === mode
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40',
                  )}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {item.hint}
                  </span>
                </button>
              ))}
            </div>
          </WizardStep>

          <WizardStep
            number={2}
            title="Доход"
            hint={`${formatMoneyInput(amountRaw)} ₽ ${amountMode === 'gross' ? 'до налогов' : 'на руки'}`}
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="flex h-12 overflow-hidden rounded-[14px] border border-border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                <span className="sr-only">Доход в месяц</span>
                <input
                  inputMode="numeric"
                  value={amountRaw}
                  onChange={(event) => setAmountRaw(event.target.value)}
                  onBlur={() => setAmountRaw(formatMoneyInput(amountRaw))}
                  className="min-w-0 flex-1 bg-transparent px-4 text-lg font-semibold outline-none"
                />
                <span className="flex items-center border-l border-border bg-muted/40 px-4 text-sm">
                  ₽ в мес.
                </span>
              </label>
              <div className="grid h-12 grid-cols-2 rounded-[14px] border border-border p-1 text-xs">
                {[
                  ['gross', 'До налогов'],
                  ['net', 'На руки'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAmountMode(value as AmountMode)}
                    className={cn(
                      'rounded-[10px] px-3 font-medium',
                      amountMode === value
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <ModeFields
              mode={mode}
              children={children}
              setChildren={setChildren}
              useProgressiveTax={useProgressiveTax}
              setUseProgressiveTax={setUseProgressiveTax}
              useChildDeduction={useChildDeduction}
              setUseChildDeduction={setUseChildDeduction}
              npdBusinessShare={npdBusinessShare}
              setNpdBusinessShare={setNpdBusinessShare}
              useNpdBonus={useNpdBonus}
              setUseNpdBonus={setUseNpdBonus}
              usnContributions={usnContributions}
              setUsnContributions={setUsnContributions}
              customRate={customRate}
              setCustomRate={setCustomRate}
            />
          </WizardStep>

          {mode === 'tk_rf' && (
            <WizardStep
              number={3}
              title="Даты выплат"
              hint={`аванс ${advanceDay} · зарплата ${salaryDay}`}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <DayField
                  label="Аванс"
                  value={advanceDay}
                  onChange={setAdvanceDay}
                  hint="обычно 20–25 число"
                />
                <DayField
                  label="Зарплата"
                  value={salaryDay}
                  onChange={setSalaryDay}
                  hint="обычно 5–10 число следующего месяца"
                />
              </div>
              {advanceDay === salaryDay && (
                <p role="alert" className="text-sm text-destructive">
                  Даты аванса и зарплаты должны отличаться.
                </p>
              )}
            </WizardStep>
          )}
        </section>

        {input.amount > 0 ? (
          <SalaryResults
            input={input}
            result={result}
            nextPayment={nextPayment}
            exporting={exporting}
            onExport={onExport}
          />
        ) : (
          <div className="mt-10 rounded-[24px] border border-dashed border-border p-12 text-center text-muted-foreground">
            Введите доход, чтобы увидеть расчёт.
          </div>
        )}
      </div>

      <SalaryArticle />
      <FaqSection items={SALARY_FAQ} />
    </PageShell>
  )
}

function WizardStep({
  number,
  title,
  hint,
  children,
}: {
  number: number
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-5 p-5 md:grid-cols-[200px_1fr] md:gap-8 md:p-7">
      <div className="flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-xs font-semibold text-background">
          {number}
        </span>
        <span>
          <span className="block font-semibold">{title}</span>
          {hint && (
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {hint}
            </span>
          )}
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </div>
  )
}

function ModeFields(props: {
  mode: TaxMode
  children: number
  setChildren: (value: number) => void
  useProgressiveTax: boolean
  setUseProgressiveTax: (value: boolean) => void
  useChildDeduction: boolean
  setUseChildDeduction: (value: boolean) => void
  npdBusinessShare: number
  setNpdBusinessShare: (value: number) => void
  useNpdBonus: boolean
  setUseNpdBonus: (value: boolean) => void
  usnContributions: string
  setUsnContributions: (value: string) => void
  customRate: number
  setCustomRate: (value: number) => void
}) {
  if (props.mode === 'tk_rf') {
    return (
      <div className="border-t border-border pt-4">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Уточнения по ТК
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Детей для вычета:</span>
          {[0, 1, 2, 3].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => {
                props.setChildren(count)
                props.setUseChildDeduction(count > 0)
              }}
              className={cn(
                'min-h-9 rounded-full border px-3 text-sm',
                props.children === count
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border',
              )}
            >
              {count === 0 ? 'нет' : count === 3 ? '3+' : count}
            </button>
          ))}
        </div>
        <CheckLine
          checked={props.useProgressiveTax}
          onChange={props.setUseProgressiveTax}
          label="Прогрессивная шкала НДФЛ 13–22%"
        />
        <CheckLine
          checked={props.children > 0 && props.useChildDeduction}
          onChange={props.setUseChildDeduction}
          disabled={props.children === 0}
          label="Учитывать стандартный вычет на детей"
        />
      </div>
    )
  }
  if (props.mode === 'npd') {
    return (
      <div className="border-t border-border pt-4">
        <label className="text-sm">
          <span className="flex justify-between">
            <span>Доля дохода от юрлиц и ИП</span>
            <strong>{props.npdBusinessShare}%</strong>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={props.npdBusinessShare}
            onChange={(event) =>
              props.setNpdBusinessShare(Number(event.target.value))
            }
            className="mt-3 w-full accent-primary"
          />
        </label>
        <CheckLine
          checked={props.useNpdBonus}
          onChange={props.setUseNpdBonus}
          label="Налоговый бонус 10 000 ₽ ещё не использован"
        />
      </div>
    )
  }
  if (props.mode === 'usn_6') {
    return (
      <label className="border-t border-border pt-4 text-sm">
        Фиксированные взносы за 2026 год
        <span className="mt-2 flex h-11 max-w-56 items-center rounded-xl border px-3">
          <input
            inputMode="numeric"
            value={props.usnContributions}
            onChange={(event) => props.setUsnContributions(event.target.value)}
            onBlur={() =>
              props.setUsnContributions(
                formatMoneyInput(props.usnContributions),
              )
            }
            className="min-w-0 flex-1 bg-transparent outline-none"
          />
          <span className="text-muted-foreground">₽</span>
        </span>
        <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
          Дополнительный 1% с дохода свыше 300 000 ₽ рассчитывается
          автоматически.
        </span>
      </label>
    )
  }
  return (
    <label className="border-t border-border pt-4 text-sm">
      Ставка налога
      <span className="mt-2 flex h-11 max-w-32 items-center rounded-xl border px-3">
        <input
          type="number"
          min={0}
          max={100}
          value={props.customRate}
          inputMode="decimal"
          onChange={(event) => props.setCustomRate(Number(event.target.value))}
          className="min-w-0 flex-1 bg-transparent outline-none"
        />
        %
      </span>
    </label>
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
        'mt-3 flex items-center gap-3 text-sm',
        disabled && 'text-muted-foreground',
      )}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onChange(value === true)}
      />
      {label}
    </label>
  )
}

function DayField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  hint: string
}) {
  return (
    <label className="text-sm">
      <span className="font-medium">{label}</span>
      <span className="mt-1.5 flex h-11 items-center rounded-xl border px-3">
        <input
          type="number"
          min={1}
          max={31}
          value={value}
          inputMode="numeric"
          onChange={(event) =>
            onChange(Math.min(31, Math.max(1, Number(event.target.value))))
          }
          className="min-w-0 flex-1 bg-transparent font-semibold outline-none"
        />
        <span className="text-muted-foreground">числа</span>
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
    </label>
  )
}

function SalaryResults({
  input,
  result,
  nextPayment,
  exporting,
  onExport,
}: {
  input: SalaryInput
  result: ReturnType<typeof calculateSalary>
  nextPayment: ReturnType<typeof calculateSalary>['events'][number] | undefined
  exporting: boolean
  onExport: () => void
}) {
  return (
    <div className="mt-10 flex flex-col gap-7 md:mt-12">
      <section className="rounded-[24px] border border-border bg-card p-6 md:p-9">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Следующая выплата
        </div>
        <div className="mt-4 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="font-display text-[44px] font-bold leading-none tracking-tight md:text-[64px]">
              {nextPayment ? formatRubles(nextPayment.net) : '—'}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {nextPayment ? (
                <>
                  <strong className="text-foreground">
                    {formatShortDate(nextPayment.date)}
                  </strong>
                  {' · '}
                  {nextPayment.kind === 'advance'
                    ? 'аванс'
                    : nextPayment.kind === 'salary'
                      ? 'зарплата'
                      : 'поступление'}
                  {nextPayment.shifted && ' · дата перенесена с выходного'}
                </>
              ) : (
                'Нет событий'
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm md:min-w-72">
            <Metric label="В среднем / мес." value={formatRubles(result.averageMonthlyNet)} />
            <Metric label="За год" value={formatRubles(result.totals.net)} />
            <Metric label="Налоги" value={formatRubles(result.totals.tax)} />
            <Metric
              label="Нагрузка"
              value={`${(result.totals.effectiveRate * 100).toFixed(1).replace('.', ',')}%`}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-[20px] border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <WalletCards className="size-4" />
          </span>
          <span>
            Полный расчёт за 2026 год
            <span className="block text-xs text-muted-foreground">
              сводка, месяцы и все выплаты
            </span>
          </span>
        </div>
        <Button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="min-h-11 rounded-xl"
        >
          <Download />
          {exporting ? 'Готовим файл…' : 'Скачать Excel'}
        </Button>
      </div>

      <section className="overflow-hidden rounded-[24px] border border-border bg-card">
        <div className="border-b border-border px-5 py-5 md:px-7">
          <h2 className="font-display text-xl font-bold">График поступлений</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Выходные и официальные праздники переносят выплату на предыдущий
            рабочий день.
          </p>
        </div>
        <div
          className="overflow-x-auto"
          tabIndex={0}
          role="region"
          aria-label="График поступлений по месяцам"
        >
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Месяц</th>
                <th className="px-5 py-3">События</th>
                <th className="px-5 py-3 text-right">До налогов</th>
                <th className="px-5 py-3 text-right">Удержано</th>
                <th className="px-5 py-3 text-right">На руки</th>
              </tr>
            </thead>
            <tbody>
              {result.months.map((month) => (
                <tr key={month.month} className="border-t border-border">
                  <th className="px-5 py-4 text-left font-medium">
                    {MONTHS[month.month]}
                  </th>
                  <td className="px-5 py-4 text-xs text-muted-foreground">
                    {month.events.map((event) => (
                      <div key={`${event.kind}-${event.date}`}>
                        {formatShortDate(event.date)} ·{' '}
                        {event.kind === 'advance'
                          ? 'аванс'
                          : event.kind === 'salary'
                            ? 'зарплата'
                            : 'поступление'}
                      </div>
                    ))}
                  </td>
                  <td className="px-5 py-4 text-right">{formatRubles(month.gross)}</td>
                  <td className="px-5 py-4 text-right text-rose-700">
                    {formatRubles(month.tax + month.contributions)}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                    {formatRubles(month.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {result.insights.map((insight) => (
          <article
            key={insight.title}
            className="rounded-[20px] border border-border bg-card p-5"
          >
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {insight.title}
            </div>
            <div className="mt-3 font-display text-2xl font-bold">
              {insight.value}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {insight.body}
            </p>
          </article>
        ))}
      </section>

      {input.amountMode === 'net' && (
        <div className="flex gap-3 rounded-[16px] bg-muted/60 p-4 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          Чтобы получать {formatRubles(input.amount)} на руки в среднем,
          ориентир дохода до налогов — {formatRubles(result.inputGrossMonthly)}
          в месяц.
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  )
}

function SalaryArticle() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-24 md:px-6 md:pb-28">
      <div className="rounded-[28px] border border-border bg-card p-6 md:p-10">
        <div className="flex items-center gap-3 text-primary">
          <CalendarDays className="size-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.16em]">
            Как считается
          </span>
        </div>
        <h2 className="mt-5 font-display text-3xl font-bold tracking-tight">
          НДФЛ и выплаты в 2026 году
        </h2>
        <div className="mt-6 space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p>
            Для работников по ТК РФ сервис применяет прогрессивную шкалу
            НДФЛ: 13% до 2,4 млн ₽, затем 15%, 18%, 20% и 22%. Повышенная
            ставка применяется не ко всему доходу, а только к сумме внутри
            следующего диапазона.
          </p>
          <p>
            Детские вычеты действуют до месяца, в котором доход с начала года
            превысил 450 000 ₽. Для самозанятых учитываются ставки 4% и 6%,
            а для ИП на УСН — налог, фиксированные взносы и дополнительный 1%
            с дохода свыше 300 000 ₽.
          </p>
          <a
            href="/vacation"
            className="inline-flex items-center gap-2 font-medium text-primary"
          >
            Планируете отпуск? Подобрать даты
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  )
}

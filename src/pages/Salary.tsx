import { useState } from 'react'
import { Download, Info, Lightbulb } from 'lucide-react'
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
import { cn } from '@/lib/utils'

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

// stub preview data
const MONTHLY_PREVIEW = MONTHS.map(() => ({
  advance: 80_000,
  salary: 94_000,
  take: 174_000,
  tax: 26_000,
}))

export function SalaryPage() {
  const [employment, setEmployment] = useState('tk')
  const [grossMode, setGrossMode] = useState(true)

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-20 md:pt-14 md:pb-28">
        <SalaryHeader />

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:min-h-[580px]">
            <SalaryForm
              employment={employment}
              onEmploymentChange={setEmployment}
              grossMode={grossMode}
              onGrossModeChange={setGrossMode}
            />
          </div>

          <div className="flex flex-col gap-6">
            <SummaryCards />
            <AdviceCard />
          </div>
        </div>

        <div className="mt-8">
          <CashflowSection />
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
          Калькулятор зарплаты
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground md:text-base">
          Расчёт выплат по месяцам и за год с учётом налогового режима.
        </p>
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
}: {
  employment: string
  onEmploymentChange: (v: string) => void
  grossMode: boolean
  onGrossModeChange: (v: boolean) => void
}) {
  return (
    <form className="flex flex-col gap-5 rounded-[24px] border border-border/60 bg-card p-6 md:p-7">
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
            defaultValue="200 000"
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

      {employment === 'tk' && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Аванс">
            <Select defaultValue="15">
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20, 25].map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} число
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Зарплата">
            <Select defaultValue="30">
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[25, 28, 30, 1, 5, 10].map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} число
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      )}

      {employment === 'tk' && (
        <Field label="Детей до 18">
          <Select defaultValue="0">
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n === 3 ? '3 и больше' : n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}

      {employment === 'custom' && (
        <Field label="Ставка налога">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-border/60 bg-white px-3">
            <Input
              className="border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
              inputMode="numeric"
              placeholder="13"
              defaultValue="13"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </Field>
      )}

      <label className="flex items-start gap-3 text-[14px] text-foreground">
        <Checkbox defaultChecked className="mt-0.5" />
        <span className="flex items-center gap-1.5 text-muted-foreground">
          Учитывать НДФЛ и стандартные вычеты
          <Info className="size-3.5" />
        </span>
      </label>

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

function SummaryCards() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <SummaryCard
        label="Доход до вычета"
        value="200 000 ₽"
        hint="в месяц"
      />
      <SummaryCard
        label="Налоги (13%)"
        value="26 000 ₽"
        hint="в месяц"
      />
      <SummaryCard
        label="Доход на руки"
        value="174 000 ₽"
        hint="в месяц"
        accent
      />
      <SummaryCard
        label="За год на руки"
        value="2 088 000 ₽"
        hint="итого за 12 мес."
        accent
      />
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

function AdviceCard() {
  return (
    <div className="flex items-start gap-3 rounded-[20px] border border-primary/20 bg-primary/5 p-5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
        <Lightbulb className="size-4" />
      </span>
      <p className="text-[14px] leading-relaxed text-foreground/80">
        Ваш средний доход на руки — <b className="font-semibold text-foreground">174&nbsp;000&nbsp;₽</b> в месяц.
        Это на&nbsp;13% меньше дохода до&nbsp;налогообложения.
      </p>
    </div>
  )
}

function CashflowSection() {
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
          <ChartStub />
          <p className="mt-4 text-[13px] text-muted-foreground">
            Средний доход на руки — 174&nbsp;000&nbsp;₽ / мес · налоговая нагрузка 13%
          </p>
        </TabsContent>

        <TabsContent value="table" className="mt-5">
          <MonthlyTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ChartStub() {
  const max = 180_000
  return (
    <div className="grid grid-cols-12 gap-2 md:gap-3">
      {MONTHLY_PREVIEW.map((m, i) => {
        const advH = (m.advance / max) * 100
        const salH = (m.salary / max) * 100
        return (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="flex h-40 w-full flex-col-reverse overflow-hidden rounded-lg bg-muted/40">
              <div
                className="w-full bg-primary"
                style={{ height: `${advH}%` }}
                title={`Аванс ${m.advance.toLocaleString('ru-RU')} ₽`}
              />
              <div
                className="w-full bg-primary/40"
                style={{ height: `${salH}%` }}
                title={`Зарплата ${m.salary.toLocaleString('ru-RU')} ₽`}
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

function MonthlyTable() {
  // Mobile cards + desktop table
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
            {MONTHLY_PREVIEW.map((m, i) => {
              const cumulative = (i + 1) * m.take
              return (
                <tr key={i} className="bg-white">
                  <td className="px-4 py-3 font-medium">{MONTHS[i]}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {m.advance.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {m.salary.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-700">
                    {m.take.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-4 py-3 text-right text-rose-600">
                    {m.tax.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {cumulative.toLocaleString('ru-RU')} ₽
                  </td>
                </tr>
              )
            })}
            <tr className="bg-muted/30 font-semibold">
              <td className="px-4 py-3">Итого</td>
              <td className="px-4 py-3 text-right">960 000 ₽</td>
              <td className="px-4 py-3 text-right">1 128 000 ₽</td>
              <td className="px-4 py-3 text-right text-emerald-700">2 088 000 ₽</td>
              <td className="px-4 py-3 text-right text-rose-600">312 000 ₽</td>
              <td className="px-4 py-3" />
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {MONTHLY_PREVIEW.map((m, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-white p-4"
          >
            <div className="text-[15px] font-medium">{MONTHS[i]}</div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              <dt className="text-muted-foreground">Аванс</dt>
              <dd className="text-right">
                {m.advance.toLocaleString('ru-RU')} ₽
              </dd>
              <dt className="text-muted-foreground">Зарплата</dt>
              <dd className="text-right">
                {m.salary.toLocaleString('ru-RU')} ₽
              </dd>
              <dt className="text-muted-foreground">На руки</dt>
              <dd className="text-right font-medium text-emerald-700">
                {m.take.toLocaleString('ru-RU')} ₽
              </dd>
              <dt className="text-muted-foreground">Налоги</dt>
              <dd className="text-right text-rose-600">
                {m.tax.toLocaleString('ru-RU')} ₽
              </dd>
            </dl>
          </div>
        ))}
      </div>
    </>
  )
}

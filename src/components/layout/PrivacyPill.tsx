import { Lock } from 'lucide-react'

export function PrivacyPill() {
  return (
    <div className="inline-flex h-10 items-center gap-2 rounded-full border border-border/60 bg-white px-4 text-sm text-muted-foreground">
      <Lock className="size-4 text-primary/80" />
      Ничего не&nbsp;уходит на&nbsp;сервер
    </div>
  )
}

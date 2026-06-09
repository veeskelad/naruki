import type { ReactNode } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import '@/index.css'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={150}>
      {children}
    </TooltipProvider>
  )
}


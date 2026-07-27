'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

// Onglets shadcn minimalistes (sans dépendance radix). Expose data-state="active|inactive"
// sur les triggers pour rester compatible avec les variantes data-[state=active]:… du markup.
const TabsCtx = React.createContext<{ value: string; setValue: (v: string) => void } | null>(null)

export function Tabs({ defaultValue = '', value, onValueChange, className, children }: {
  defaultValue?: string; value?: string; onValueChange?: (v: string) => void
  className?: string; children: React.ReactNode
}) {
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value ?? internal
  const setValue = (v: string) => { onValueChange?.(v); if (value === undefined) setInternal(v) }
  return <div className={className}><TabsCtx.Provider value={{ value: current, setValue }}>{children}</TabsCtx.Provider></div>
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div role="tablist" className={cn('inline-flex items-center gap-1', className)}>{children}</div>
}

export function TabsTrigger({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsCtx)
  const active = ctx?.value === value
  return (
    <button type="button" role="tab" data-state={active ? 'active' : 'inactive'} onClick={() => ctx?.setValue(value)}
      className={cn('inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:text-foreground', className)}>
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsCtx)
  if (ctx?.value !== value) return null
  return <div role="tabpanel" className={className}>{children}</div>
}

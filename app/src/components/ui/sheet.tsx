'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

// Tiroir latéral minimal (sans dépendance radix), API compatible avec l'usage du CoursePlayer.
export function Sheet({ open, onOpenChange, children }: { open: boolean; onOpenChange: (o: boolean) => void; children: React.ReactNode }) {
  return (
    <>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ open?: boolean; onOpenChange?: (o: boolean) => void }>, { open, onOpenChange })
          : child,
      )}
    </>
  )
}

export function SheetContent({ side = 'left', className, children, open, onOpenChange }: {
  side?: 'left' | 'right'; className?: string; children: React.ReactNode
  open?: boolean; onOpenChange?: (o: boolean) => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange?.(false)} />
      <div className={cn('absolute top-0 bottom-0 bg-card shadow-xl', side === 'left' ? 'left-0' : 'right-0', className)}>
        {children}
      </div>
    </div>
  )
}

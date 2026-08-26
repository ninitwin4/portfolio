import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The page's reading column. Lives here rather than in the root layout so
 * full-bleed sections (the hero) can opt out of it.
 */
export function Container({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mx-auto w-full max-w-3xl px-5 sm:px-8', className)}>
      {children}
    </div>
  )
}

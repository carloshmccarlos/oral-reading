import type * as React from 'react'
import { cn } from '@/lib/utils'

export interface SpinnerProps extends React.HTMLAttributes<HTMLOutputElement> {
  size?: 'sm' | 'md' | 'lg'
}

export function Spinner ({ className, size = 'md', ...props }: SpinnerProps) {
  const sizeClasses =
    size === 'sm'
      ? 'h-4 w-4 border-2'
      : size === 'lg'
        ? 'h-8 w-8 border-[3px]'
        : 'h-6 w-6 border-2'

  return (
    <output
      aria-live="polite"
      aria-label="Loading"
      className={cn(
        'inline-flex items-center justify-center',
        className
      )}
      {...props}
    >
      {/* Visual spinner indicator (CSS-only) */}
      <span
        aria-hidden="true"
        className={cn(
          'animate-spin rounded-full border-text-main/20 border-t-text-main',
          sizeClasses
        )}
      />
      <span className="sr-only">Loading</span>
    </output>
  )
}

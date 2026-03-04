import * as React from 'react'
import { cn } from '../../lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-11 w-full min-w-0 rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-base text-slate-100 shadow-xs transition outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-400/60 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Input }

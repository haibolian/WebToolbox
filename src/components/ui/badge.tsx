import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeStyles = cva(
  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-cyan-500/20 text-cyan-200',
        secondary: 'border-transparent bg-slate-800 text-slate-300',
        outline: 'border-slate-700 text-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeStyles>) {
  return <span className={cn(badgeStyles({ variant }), className)} {...props} />
}

export { Badge }

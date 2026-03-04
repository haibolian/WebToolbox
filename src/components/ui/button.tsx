import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60',
  {
    variants: {
      variant: {
        default: 'bg-cyan-500 text-slate-950 shadow hover:bg-cyan-400',
        secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700',
        ghost: 'text-slate-200 hover:bg-slate-800 hover:text-slate-50',
        outline: 'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800',
      },
      size: {
        default: 'h-10 min-w-[44px] px-4 py-2',
        sm: 'h-9 min-w-[44px] rounded-md px-3',
        lg: 'h-11 min-w-[44px] rounded-md px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonStyles> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return <Comp className={cn(buttonStyles({ variant, size, className }))} {...props} />
}

export { Button }

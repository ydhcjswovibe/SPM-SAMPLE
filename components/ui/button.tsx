import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 text-sm font-black tracking-[-0.02em] transition-all duration-150 disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'border-[var(--primary-shadow)] bg-primary text-primary-foreground shadow-[0_6px_0_var(--primary-shadow)] hover:translate-y-[2px] hover:shadow-[0_4px_0_var(--primary-shadow)] active:translate-y-[4px] active:shadow-[0_2px_0_var(--primary-shadow)]',
        destructive:
          'border-[var(--danger-shadow)] bg-destructive text-white shadow-[0_6px_0_var(--danger-shadow)] hover:translate-y-[2px] hover:shadow-[0_4px_0_var(--danger-shadow)] active:translate-y-[4px] active:shadow-[0_2px_0_var(--danger-shadow)]',
        outline:
          'border-[var(--line-strong)] bg-card text-foreground shadow-[0_6px_0_var(--line-strong)] hover:translate-y-[2px] hover:bg-secondary hover:shadow-[0_4px_0_var(--line-strong)] active:translate-y-[4px] active:shadow-[0_2px_0_var(--line-strong)]',
        secondary:
          'border-[var(--brand-blue-shadow)] bg-[var(--brand-blue)] text-white shadow-[0_6px_0_var(--brand-blue-shadow)] hover:translate-y-[2px] hover:shadow-[0_4px_0_var(--brand-blue-shadow)] active:translate-y-[4px] active:shadow-[0_2px_0_var(--brand-blue-shadow)]',
        surface:
          'border-[#dce8cd] bg-white text-foreground shadow-[0_8px_14px_rgba(111,145,72,0.08)]',
        ghost:
          'border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-accent hover:text-foreground',
        link: 'border-transparent text-primary shadow-none underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5 py-2 has-[>svg]:px-4',
        sm: 'h-9 rounded-xl gap-1.5 px-4 has-[>svg]:px-3',
        lg: 'h-12 rounded-2xl px-7 text-base has-[>svg]:px-5',
        icon: 'size-11 rounded-2xl',
        'icon-sm': 'size-9 rounded-xl',
        'icon-lg': 'size-12 rounded-2xl',
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
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

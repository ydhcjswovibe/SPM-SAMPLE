import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border-2 px-3 py-1 text-xs font-black whitespace-nowrap tracking-[-0.02em] [&>svg]:size-3 [&>svg]:pointer-events-none transition-[color,box-shadow]',
  {
    variants: {
      variant: {
        default: 'border-[var(--primary-shadow)] bg-[var(--primary-soft)] text-[var(--primary-shadow)]',
        secondary: 'border-[var(--brand-blue-shadow)] bg-secondary text-secondary-foreground',
        destructive: 'border-[var(--danger-shadow)] bg-destructive text-white',
        outline: 'border-[var(--line-strong)] bg-white text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

import Link from 'next/link'
import { ArrowRight, LogIn } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SpmMascot } from '@/components/spm-mascot'

interface AccessGateCardProps {
  title: string
  description: string
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string
  detail?: string | null
}

export function AccessGateCard({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  detail,
}: AccessGateCardProps) {
  return (
    <div className="min-h-dvh bg-background px-4 py-8">
      <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center">
        <Card className="w-full overflow-hidden">
          <CardHeader className="text-center">
            <div className="spm-kicker mx-auto mb-2">Access Check</div>
            <div className="mb-4 flex items-center justify-center gap-3">
              <SpmMascot size="sm" />
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] border-2 border-[var(--line-strong)] bg-white shadow-[0_4px_0_var(--line-strong)] text-secondary-foreground">
                <LogIn className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="spm-display text-3xl">{title}</CardTitle>
            <CardDescription className="mx-auto max-w-sm text-base">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {detail ? (
              <p className="rounded-[1rem] border-2 border-[var(--line-strong)] bg-secondary px-4 py-3 text-sm text-muted-foreground">
                {detail}
              </p>
            ) : null}

            <div className="flex flex-col gap-2">
              <Button asChild className="w-full gap-2">
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              {secondaryHref && secondaryLabel ? (
                <Button asChild variant="outline" className="w-full">
                  <Link href={secondaryHref}>{secondaryLabel}</Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

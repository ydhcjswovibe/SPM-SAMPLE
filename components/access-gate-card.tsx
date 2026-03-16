import Link from 'next/link'
import { ArrowRight, LogIn } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="min-h-dvh bg-background p-4">
      <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LogIn className="h-5 w-5" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {detail ? (
              <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
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

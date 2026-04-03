import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')

const primarySurfaceFiles = [
  'app/student/page.tsx',
  'app/student/lessons/page.tsx',
  'app/student/profile/page.tsx',
  'app/admin/students/page.tsx',
  'app/admin/content/page.tsx',
  'app/admin/page.tsx',
  'app/admin/settings/page.tsx',
  'components/student-nav.tsx',
  'components/student-class-detail-view.tsx',
  'components/mobile-nav.tsx',
  'components/admin-shell-header.tsx',
  'components/admin-mobile-utility-menu.tsx',
  'components/admin-mobile-action-menu.tsx',
  'components/admin-month-selector.tsx',
  'components/class-selector.tsx',
  'components/admin-matrix.tsx',
  'lib/student/surface.ts',
  'lib/admin/surface.ts',
  'components/ui/select.tsx',
  'components/ui/dropdown-menu.tsx',
  'components/ui/tabs.tsx',
  'components/ui/popover.tsx',
  'components/ui/card.tsx',
]

const ghostUsageFiles = new Set([
  'app/student/page.tsx',
  'app/student/lessons/page.tsx',
  'app/student/profile/page.tsx',
  'app/admin/students/page.tsx',
  'app/admin/content/page.tsx',
  'app/admin/page.tsx',
  'app/admin/settings/page.tsx',
  'components/student-nav.tsx',
  'components/mobile-nav.tsx',
  'components/admin-shell-header.tsx',
  'components/admin-mobile-utility-menu.tsx',
  'components/admin-mobile-action-menu.tsx',
  'components/admin-month-selector.tsx',
  'components/class-selector.tsx',
  'components/admin-matrix.tsx',
])

const alphaBackgroundRules = [
  {
    label: 'alpha utility background',
    regex: /\bbg-[^\s"'`]+\/\d+\b/,
  },
  {
    label: 'rgba background fill',
    regex: /\bbg-\[(?:rgba\(|linear-gradient\([^\]]*rgba\(|radial-gradient\([^\]]*rgba\()/,
  },
  {
    label: 'backdrop blur on primary surface',
    regex: /\bbackdrop-blur(?:-[^\s"'`]+)?\b/,
  },
]

const stableSurfaceFiles = [
  'app/student/page.tsx',
  'app/student/lessons/page.tsx',
  'app/student/profile/page.tsx',
  'app/admin/students/page.tsx',
  'app/admin/settings/page.tsx',
  'components/student-nav.tsx',
  'components/mobile-nav.tsx',
  'components/ui/button.tsx',
  'components/ui/card.tsx',
  'components/ui/input.tsx',
  'components/ui/select.tsx',
  'components/ui/dropdown-menu.tsx',
  'components/ui/tabs.tsx',
  'lib/student/surface.ts',
  'lib/admin/surface.ts',
]

const stableUtilityRules = [
  {
    label: 'arbitrary background fill',
    regex: /\bbg-\[#/,
  },
  {
    label: 'arbitrary gradient fill',
    regex: /\bbg-\[linear-gradient/,
  },
  {
    label: 'arbitrary radius token',
    regex: /\brounded-\[/,
  },
]

const opaqueSurfaceClasses = [
  'spm-shell-surface',
  'spm-shell-plate-surface',
  'spm-card-surface',
  'spm-card-surface-strong',
  'spm-inset-surface',
  'spm-control-surface',
  'spm-menu-surface',
  'spm-dialog-surface',
  'spm-tab-rail-surface',
  'spm-tone-warm-surface',
  'spm-tone-mint-surface',
  'spm-tone-blue-surface',
  'spm-tone-green-surface',
  'spm-tone-rose-surface',
  'spm-student-hero-surface',
  'spm-student-progress-surface',
]

function isAllowedDecorativeLine(line) {
  if (line.includes('glowClass')) {
    return true
  }

  return /\babsolute\b/.test(line)
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function readRepoFile(relativePath) {
  return await fs.readFile(path.join(repoRoot, relativePath), 'utf8')
}

async function verifyPrimarySurfaceFiles(errors) {
  for (const relativePath of primarySurfaceFiles) {
    const content = await readRepoFile(relativePath)
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      if (isAllowedDecorativeLine(line)) {
        return
      }

      for (const rule of alphaBackgroundRules) {
        if (rule.regex.test(line)) {
          errors.push(`${relativePath}:${index + 1} ${rule.label}: ${line.trim()}`)
        }
      }

      if (ghostUsageFiles.has(relativePath) && /variant=["']ghost["']/.test(line)) {
        errors.push(`${relativePath}:${index + 1} primary surface control must not use ghost variant`)
      }
    })
  }
}

async function verifyStableSurfaceFiles(errors) {
  for (const relativePath of stableSurfaceFiles) {
    const content = await readRepoFile(relativePath)
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      if (isAllowedDecorativeLine(line)) {
        return
      }

      for (const rule of stableUtilityRules) {
        if (rule.regex.test(line)) {
          errors.push(`${relativePath}:${index + 1} ${rule.label}: ${line.trim()}`)
        }
      }
    })
  }
}

async function verifyOpaqueSurfaceBlocks(errors) {
  const globalsCss = await readRepoFile('app/globals.css')

  for (const className of opaqueSurfaceClasses) {
    const pattern = new RegExp(`\\.${escapeRegex(className)}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, 'm')
    const match = globalsCss.match(pattern)

    if (!match) {
      errors.push(`app/globals.css missing .${className} block`)
      continue
    }

    if (/rgba\(|transparent/.test(match[1])) {
      errors.push(`app/globals.css .${className} must not use alpha/transparent background fills`)
    }
  }
}

async function verifyButtonGhostBase(errors) {
  const buttonSource = await readRepoFile('components/ui/button.tsx')
  const ghostMatch = buttonSource.match(/ghost:\s*'([^']+)'/)

  if (!ghostMatch) {
    errors.push('components/ui/button.tsx is missing ghost variant')
    return
  }

  const ghostValue = ghostMatch[1]

  if (/\bbg-[^\s"'`]+\/\d+\b/.test(ghostValue) || /\bbg-\[(?:rgba\(|linear-gradient\([^\]]*rgba\(|radial-gradient\([^\]]*rgba\()/.test(ghostValue)) {
    errors.push('components/ui/button.tsx ghost variant must not reintroduce alpha background fill')
  }
}

async function main() {
  const errors = []

  await verifyPrimarySurfaceFiles(errors)
  await verifyStableSurfaceFiles(errors)
  await verifyOpaqueSurfaceBlocks(errors)
  await verifyButtonGhostBase(errors)

  if (errors.length > 0) {
    console.error('Primary surface contract violations:')
    for (const error of errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log('Primary surface contract verified.')
}

await main()

import process from 'node:process'

import { applyRemoteCanonicalTargets } from './lib/remote-canonical-sync.mjs'

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const result = await applyRemoteCanonicalTargets(['enrollment-status'], { dryRun })
  console.log(JSON.stringify(result, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})

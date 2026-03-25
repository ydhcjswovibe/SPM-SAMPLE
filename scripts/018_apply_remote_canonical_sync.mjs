import process from 'node:process'

import {
  applyRemoteCanonicalTargets,
  readRemoteCanonicalTargetsFromArgv,
} from './lib/remote-canonical-sync.mjs'

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const targets = readRemoteCanonicalTargetsFromArgv(process.argv.slice(2))
  const result = await applyRemoteCanonicalTargets(targets, { dryRun })
  console.log(JSON.stringify(result, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})

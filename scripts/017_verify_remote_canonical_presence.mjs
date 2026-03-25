import process from 'node:process'

import {
  readRemoteCanonicalTargetsFromArgv,
  verifyRemoteCanonicalPresence,
} from './lib/remote-canonical-sync.mjs'

async function main() {
  const targets = readRemoteCanonicalTargetsFromArgv(process.argv.slice(2))
  const result = await verifyRemoteCanonicalPresence(targets)
  console.log(JSON.stringify(result, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
